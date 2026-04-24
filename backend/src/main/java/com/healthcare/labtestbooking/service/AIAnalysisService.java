package com.healthcare.labtestbooking.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.labtestbooking.dto.AiAnalysisFlagDto;
import com.healthcare.labtestbooking.dto.AiAnalysisRecommendationDto;
import com.healthcare.labtestbooking.dto.AiAnalysisResponseDto;
import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.ReportAiAnalysis;
import com.healthcare.labtestbooking.entity.ReportResult;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.AiAnalysisStatus;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import com.healthcare.labtestbooking.exception.ResourceNotFoundException;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.ReportAiAnalysisRepository;
import com.healthcare.labtestbooking.repository.ReportResultRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIAnalysisService {
    private static final String AI_TEMPORARILY_BUSY_MESSAGE = "AI service is currently busy. Please try again in a minute.";
    private static final String AI_GENERIC_FAILURE_MESSAGE = "AI analysis failed unexpectedly. Please retry.";
    private static final String AI_PARSE_FAILURE_MESSAGE = "AI response format was invalid. Please retry in a moment.";

    private static final String GEMINI_GENERATE_CONTENT_URL_TEMPLATE =
            "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    private static final String GROQ_CHAT_COMPLETIONS_URL =
            "https://api.groq.com/openai/v1/chat/completions";

    private final BookingRepository bookingRepository;
    private final ReportResultRepository reportResultRepository;
    private final ReportAiAnalysisRepository reportAiAnalysisRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.ai.provider:gemini}")
    private String aiProvider;

    @Value("${app.ai.enabled:true}")
    private boolean aiEnabled;

    @Value("${app.ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.ai.gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    @Value("${app.ai.groq.enabled:false}")
    private boolean groqEnabled;

    @Value("${app.ai.groq.api-key:}")
    private String groqApiKey;

    @Value("${app.ai.groq.model:llama-3.3-70b-versatile}")
    private String groqModel;

    @Value("${app.ai.gemini.max-retries:3}")
    private int geminiMaxRetries;

    @Value("${app.ai.gemini.retry-delay-ms:700}")
    private long geminiRetryDelayMs;

    @Autowired
    @Lazy
    private AIAnalysisAsyncService aiAnalysisAsyncService;

    @Transactional
    public void requestAnalysisForBooking(Long bookingId) {
        User currentUser = getCurrentUser();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        enforceAccess(currentUser, booking);
        upsertPendingRecord(booking);
        aiAnalysisAsyncService.analyzeReportAsync(bookingId);
    }

    @Transactional
    public void analyzeReport(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        ReportAiAnalysis analysis = upsertPendingRecord(booking);

        List<ReportResult> results = reportResultRepository.findByBookingId(bookingId);
        if (results.isEmpty()) {
            analysis.setStatus(AiAnalysisStatus.FAILED);
            analysis.setErrorMessage("No test results found for booking");
            reportAiAnalysisRepository.save(analysis);
            return;
        }

        String promptSnapshot = buildPrompt(booking, results);
        analysis.setPromptSnapshot(promptSnapshot);
        reportAiAnalysisRepository.save(analysis);

        if (!aiEnabled) {
            analysis.setStatus(AiAnalysisStatus.FAILED);
            analysis.setErrorMessage("AI analysis is disabled");
            reportAiAnalysisRepository.save(analysis);
            return;
        }

        boolean hasValidKey = false;
        if ("groq".equalsIgnoreCase(aiProvider) && groqEnabled && groqApiKey != null && !groqApiKey.isBlank()) {
            hasValidKey = true;
        } else if ("gemini".equalsIgnoreCase(aiProvider) && geminiApiKey != null && !geminiApiKey.isBlank()) {
            hasValidKey = true;
        }

        if (!hasValidKey) {
            analysis.setStatus(AiAnalysisStatus.FAILED);
            analysis.setErrorMessage("AI API key is missing for provider: " + aiProvider);
            reportAiAnalysisRepository.save(analysis);
            return;
        }

        try {
            String rawResponse;
            if ("groq".equalsIgnoreCase(aiProvider) && groqEnabled) {
                rawResponse = callGroq(promptSnapshot);
            } else {
                rawResponse = callGeminiWithRetry(promptSnapshot);
            }
            analysis.setRawResponse(rawResponse);

            JsonNode parsedContent = extractAndParseContent(rawResponse, aiProvider);
            applyParsedAnalysis(analysis, parsedContent);

            analysis.setStatus(AiAnalysisStatus.COMPLETED);
            analysis.setGeneratedAt(LocalDateTime.now());
            analysis.setErrorMessage(null);
            reportAiAnalysisRepository.save(analysis);
        } catch (Exception ex) {
            log.error("Failed to generate AI analysis for booking {}", bookingId, ex);
            analysis.setStatus(AiAnalysisStatus.FAILED);
            analysis.setErrorMessage(buildClientSafeErrorMessage(ex));
            reportAiAnalysisRepository.save(analysis);
        }
    }

    @Transactional(readOnly = true)
    public AiAnalysisResponseDto getAnalysisForBooking(Long bookingId) {
        User currentUser = getCurrentUser();

        ReportAiAnalysis analysis = reportAiAnalysisRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("AI analysis not yet generated"));

        enforceAccess(currentUser, analysis.getBooking());

        return toDto(analysis);
    }

    @Transactional
    public void regenerateAnalysis(Long bookingId) {
        User currentUser = getCurrentUser();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        enforceAccess(currentUser, booking);
        upsertPendingRecord(booking);
        aiAnalysisAsyncService.analyzeReportAsync(bookingId);
    }

    private ReportAiAnalysis upsertPendingRecord(Booking booking) {
        ReportAiAnalysis analysis = reportAiAnalysisRepository.findByBookingId(booking.getId())
                .orElseGet(() -> ReportAiAnalysis.builder().booking(booking).build());

        analysis.setStatus(AiAnalysisStatus.PENDING);
        analysis.setErrorMessage(null);
        return reportAiAnalysisRepository.save(analysis);
    }

    private void enforceAccess(User currentUser, Booking booking) {
        if (currentUser.getRole() == UserRole.PATIENT) {
            Long bookingPatientId = booking != null && booking.getPatient() != null ? booking.getPatient().getId() : null;
            if (bookingPatientId == null || !bookingPatientId.equals(currentUser.getId())) {
                throw new ResourceNotFoundException("AI analysis not found");
            }
        }
    }

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof UserDetails userDetails)) {
            throw new ResourceNotFoundException("Unauthorized");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private String callGeminiWithRetry(String prompt) throws JsonProcessingException {
        int maxAttempts = Math.max(1, geminiMaxRetries);
        HttpStatusCodeException lastTransientException = null;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return callGemini(prompt);
            } catch (HttpStatusCodeException ex) {
                if (!isTransientProviderError(ex.getStatusCode())) {
                    throw ex;
                }
                lastTransientException = ex;
                log.warn("Gemini transient failure (attempt {}/{}): status={}", attempt, maxAttempts, ex.getStatusCode());
                if (attempt < maxAttempts) {
                    sleepBeforeRetry(attempt);
                }
            }
        }

        throw new IllegalStateException(
                "AI provider is temporarily unavailable. Please try again in a few moments.",
                lastTransientException);
    }

    private String callGemini(String prompt) throws JsonProcessingException {
        String systemInstruction = """
                You are a clinical pathologist assistant.
                Return strictly valid JSON with keys:
                summary (string),
                flags (array of objects with testName, value, severity, clinicalNote),
                patterns (array of strings),
                recommendations (array of objects with category and text),
                disclaimer (string).
                Severity must be one of: NORMAL, MILD, MODERATE, CRITICAL.
                Keep language patient-friendly and concise.
                """;

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("system_instruction", Map.of("parts", List.of(Map.of("text", systemInstruction))));
        requestBody.put("contents", List.of(
                Map.of(
                        "role", "user",
                        "parts", List.of(Map.of("text", prompt))
                )
        ));
        requestBody.put("generationConfig", Map.of(
                "temperature", 0.2,
                "responseMimeType", "application/json"
        ));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        String model = URLEncoder.encode(geminiModel, StandardCharsets.UTF_8);
        String key = URLEncoder.encode(geminiApiKey, StandardCharsets.UTF_8);
        String url = String.format(GEMINI_GENERATE_CONTENT_URL_TEMPLATE, model, key);

        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new IllegalStateException("Gemini call failed with status: " + response.getStatusCode());
        }
        return response.getBody();
    }

    private String callGroq(String prompt) throws JsonProcessingException {
        String systemInstruction = """
                You are a clinical pathologist assistant.
                Return strictly valid JSON with keys:
                summary (string),
                flags (array of objects with testName, value, severity, clinicalNote),
                patterns (array of strings),
                recommendations (array of objects with category and text),
                disclaimer (string).
                Severity must be one of: NORMAL, MILD, MODERATE, CRITICAL.
                Keep language patient-friendly and concise.
                """;

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("model", groqModel);
        requestBody.put("messages", List.of(
                Map.of("role", "system", "content", systemInstruction),
                Map.of("role", "user", "content", prompt)
        ));
        requestBody.put("temperature", 0.2);
        requestBody.put("response_format", Map.of("type", "json_object"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(GROQ_CHAT_COMPLETIONS_URL, entity, String.class);
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new IllegalStateException("Groq call failed with status: " + response.getStatusCode());
        }
        return response.getBody();
    }

    private boolean isTransientProviderError(HttpStatusCode statusCode) {
        int status = statusCode.value();
        return status == 429 || status == 500 || status == 502 || status == 503 || status == 504;
    }

    private void sleepBeforeRetry(int attempt) {
        long delay = Math.max(0L, geminiRetryDelayMs) * attempt;
        if (delay <= 0) {
            return;
        }
        try {
            Thread.sleep(delay);
        } catch (InterruptedException interruptedException) {
            Thread.currentThread().interrupt();
        }
    }

    private String buildClientSafeErrorMessage(Exception ex) {
        if (ex instanceof HttpStatusCodeException statusException) {
            if (isTransientProviderError(statusException.getStatusCode())) {
                return AI_TEMPORARILY_BUSY_MESSAGE;
            }
            return "AI service request failed with status " + statusException.getStatusCode().value() + ". Please retry.";
        }

        String message = ex.getMessage();
        if (message != null) {
            String normalized = message.toLowerCase();
            if (normalized.contains("temporarily unavailable")
                    || normalized.contains("service unavailable")
                    || normalized.contains("status: 503")
                    || normalized.contains("too many requests")
                    || normalized.contains("status: 429")) {
                return AI_TEMPORARILY_BUSY_MESSAGE;
            }
            if (normalized.contains("missing content")
                    || normalized.contains("json")
                    || normalized.contains("parse")) {
                return AI_PARSE_FAILURE_MESSAGE;
            }
        }
        return AI_GENERIC_FAILURE_MESSAGE;
    }

    private String sanitizeErrorMessageForClient(String message) {
        if (message == null || message.isBlank()) {
            return null;
        }
        String normalized = message.toLowerCase();
        if (normalized.contains("<eol>")
                || normalized.contains("\"error\"")
                || normalized.contains("service unavailable")
                || normalized.contains("status: 503")
                || normalized.contains("status 503")
                || normalized.contains("too many requests")
                || normalized.contains("status: 429")
                || normalized.contains("status 429")) {
            return AI_TEMPORARILY_BUSY_MESSAGE;
        }
        return message.length() > 240 ? message.substring(0, 240) : message;
    }

    private JsonNode extractAndParseContent(String rawResponse, String provider) throws JsonProcessingException {
        JsonNode root = objectMapper.readTree(rawResponse);
        String jsonText;

        if ("groq".equalsIgnoreCase(provider)) {
            // Groq response format: { "choices": [ { "message": { "content": "..." } } ] }
            JsonNode contentNode = root.path("choices").path(0).path("message").path("content");
            if (contentNode.isMissingNode() || contentNode.isNull()) {
                throw new IllegalStateException("Groq response missing content");
            }
            jsonText = contentNode.isTextual() ? contentNode.asText() : contentNode.toString();
        } else {
            // Gemini response format: { "candidates": [ { "content": { "parts": [ { "text": "..." } ] } } ] }
            JsonNode contentNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
            if (contentNode.isMissingNode() || contentNode.isNull()) {
                throw new IllegalStateException("Gemini response missing content");
            }
            jsonText = contentNode.isTextual() ? contentNode.asText() : contentNode.toString();
        }

        if (jsonText.startsWith("```")) {
            jsonText = jsonText.replaceFirst("^```json\\s*", "")
                    .replaceFirst("^```\\s*", "")
                    .replaceFirst("\\s*```$", "");
        }
        return objectMapper.readTree(jsonText);
    }

    private void applyParsedAnalysis(ReportAiAnalysis analysis, JsonNode parsed) throws JsonProcessingException {
        analysis.setSummary(readText(parsed, "summary"));
        analysis.setDisclaimer(readText(parsed, "disclaimer"));

        JsonNode flagsNode = parsed.path("flags");
        JsonNode patternsNode = parsed.path("patterns");
        JsonNode recommendationsNode = parsed.path("recommendations");

        analysis.setFlagsJson(toJsonArrayOrEmpty(flagsNode));
        analysis.setPatternsJson(toJsonArrayOrEmpty(patternsNode));
        analysis.setRecommendationsJson(toJsonArrayOrEmpty(recommendationsNode));
        analysis.setHealthScore(calculateHealthScore(flagsNode));
    }

    private String buildPrompt(Booking booking, List<ReportResult> results) {
        User patient = booking.getPatient();
        String patientGender = patient != null && patient.getGender() != null ? patient.getGender().name() : "UNKNOWN";
        Integer age = resolveAge(patient);
        String testName = booking.getTest() != null ? booking.getTest().getTestName() : "Lab Test";

        StringBuilder sb = new StringBuilder();
        sb.append("Patient context:\n");
        sb.append("- age: ").append(age != null ? age : "UNKNOWN").append("\n");
        sb.append("- gender: ").append(patientGender).append("\n");
        sb.append("- bookingId: ").append(booking.getId()).append("\n");
        sb.append("- testName: ").append(testName).append("\n\n");
        sb.append("Results:\n");

        for (ReportResult result : results) {
            String parameterName = result.getParameter() != null ? result.getParameter().getParameterName() : "Unknown Parameter";
            String value = result.getResultValue() != null && !result.getResultValue().isBlank()
                    ? result.getResultValue()
                    : Optional.ofNullable(result.getValue()).orElse("-");
            String unit = result.getUnit() != null ? result.getUnit() : Optional.ofNullable(result.getParameter())
                    .map(p -> p.getUnit())
                    .orElse("-");
            String referenceRange = resolveReferenceRange(result);
            String outOfRange = (Boolean.TRUE.equals(result.getIsAbnormal()) || Boolean.TRUE.equals(result.getIsCritical())) ? "YES" : "NO";

            sb.append("- testName: ").append(parameterName)
                    .append(", value: ").append(value)
                    .append(", unit: ").append(unit)
                    .append(", referenceRange: ").append(referenceRange)
                    .append(", flaggedOutsideRange: ").append(outOfRange)
                    .append("\n");
        }

        sb.append("\nGenerate plain-language insights for the patient based only on the above data.");
        return sb.toString();
    }

    private Integer resolveAge(User patient) {
        if (patient == null || patient.getDateOfBirth() == null) {
            return null;
        }
        return Period.between(patient.getDateOfBirth(), LocalDate.now()).getYears();
    }

    private String resolveReferenceRange(ReportResult result) {
        if (result.getNormalRange() != null && !result.getNormalRange().isBlank()) {
            return result.getNormalRange();
        }
        if (result.getParameter() != null
                && result.getParameter().getNormalRangeMin() != null
                && result.getParameter().getNormalRangeMax() != null) {
            return result.getParameter().getNormalRangeMin() + " - " + result.getParameter().getNormalRangeMax();
        }
        if (result.getNormalRangeMin() != null && result.getNormalRangeMax() != null) {
            return result.getNormalRangeMin() + " - " + result.getNormalRangeMax();
        }
        return "-";
    }

    private String readText(JsonNode node, String field) {
        JsonNode value = node.path(field);
        return value.isTextual() ? value.asText() : "";
    }

    private String toJsonArrayOrEmpty(JsonNode node) throws JsonProcessingException {
        if (node == null || !node.isArray()) {
            return "[]";
        }
        return objectMapper.writeValueAsString(node);
    }

    private int calculateHealthScore(JsonNode flagsNode) {
        if (flagsNode == null || !flagsNode.isArray() || flagsNode.isEmpty()) {
            return 90;
        }

        int score = 100;
        for (JsonNode flag : flagsNode) {
            String severity = flag.path("severity").asText("NORMAL");
            switch (severity.toUpperCase()) {
                case "CRITICAL" -> score -= 35;
                case "MODERATE" -> score -= 20;
                case "MILD" -> score -= 10;
                default -> {
                }
            }
        }
        return Math.max(0, score);
    }

    private AiAnalysisResponseDto toDto(ReportAiAnalysis analysis) {
        List<AiAnalysisFlagDto> flags = parseFlags(analysis.getFlagsJson());
        List<String> patterns = parsePatterns(analysis.getPatternsJson());
        List<AiAnalysisRecommendationDto> recommendations = parseRecommendations(analysis.getRecommendationsJson());
        
        List<ReportResult> results = reportResultRepository.findByBookingId(analysis.getBooking().getId());
        Map<String, Integer> organScores = calculateOrganScores(results);
        boolean hasCritical = results.stream().anyMatch(r -> Boolean.TRUE.equals(r.getIsCritical()));

        return AiAnalysisResponseDto.builder()
                .bookingId(analysis.getBooking().getId())
                .status(analysis.getStatus())
                .healthScore(analysis.getHealthScore())
                .summary(resolveSummary(analysis))
                .flags(flags)
                .patterns(patterns)
                .recommendations(recommendations)
                .organScores(organScores)
                .hasCriticalResults(hasCritical)
                .disclaimer(analysis.getDisclaimer())
                .generatedAt(analysis.getGeneratedAt())
                .errorMessage(sanitizeErrorMessageForClient(analysis.getErrorMessage()))
                .build();
    }

    private String resolveSummary(ReportAiAnalysis analysis) {
        if (analysis.getSummary() != null && !analysis.getSummary().isBlank()) {
            return analysis.getSummary();
        }
        if (analysis.getStatus() == AiAnalysisStatus.PENDING) {
            return "AI analysis is being generated. Please check again shortly.";
        }
        if (analysis.getStatus() == AiAnalysisStatus.FAILED) {
            return "AI analysis could not be generated for this report.";
        }
        return "";
    }

    private Map<String, Integer> calculateOrganScores(List<ReportResult> results) {
        Map<String, List<ReportResult>> groups = new java.util.HashMap<>();
        for (ReportResult res : results) {
            String cat = res.getParameter() != null && res.getParameter().getCategory() != null ? res.getParameter().getCategory() : "General";
            groups.computeIfAbsent(cat, k -> new ArrayList<>()).add(res);
        }

        Map<String, Integer> scores = new java.util.HashMap<>();
        groups.forEach((cat, resList) -> {
            int base = 100;
            for (ReportResult r : resList) {
                if (Boolean.TRUE.equals(r.getIsCritical())) base -= 40;
                else if (Boolean.TRUE.equals(r.getIsAbnormal())) base -= 15;
            }
            scores.put(cat, Math.max(0, base));
        });
        return scores;
    }

    private List<AiAnalysisFlagDto> parseFlags(String flagsJson) {
        if (flagsJson == null || flagsJson.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(flagsJson, new TypeReference<List<AiAnalysisFlagDto>>() {
            });
        } catch (Exception ex) {
            log.warn("Failed to parse AI flags json", ex);
            return new ArrayList<>();
        }
    }

    private List<String> parsePatterns(String patternsJson) {
        if (patternsJson == null || patternsJson.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(patternsJson, new TypeReference<List<String>>() {
            });
        } catch (Exception ex) {
            log.warn("Failed to parse AI patterns json", ex);
            return new ArrayList<>();
        }
    }

    private List<AiAnalysisRecommendationDto> parseRecommendations(String recommendationsJson) {
        if (recommendationsJson == null || recommendationsJson.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(recommendationsJson, new TypeReference<List<AiAnalysisRecommendationDto>>() {
            });
        } catch (Exception ex) {
            log.warn("Failed to parse AI recommendations json", ex);
            return new ArrayList<>();
        }
    }
}
