package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.Report;
import com.healthcare.labtestbooking.entity.ReportResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportSealingService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";

    @Value("${app.report.sealing.secret:healthcare-lab-secure-sealing-key-2026}")
    private String sealingSecret;

    /**
     * Generates a digital fingerprint (HMAC-SHA256) for a report.
     * The hash is based on report ID, patient name, and a summary of results.
     */
    public String generateFingerprint(Report report) {
        try {
            String dataToHash = buildDataString(report);
            return calculateHmac(dataToHash);
        } catch (Exception e) {
            log.error("Failed to generate digital fingerprint for report {}", report.getId(), e);
            return "SIGNATURE_ERROR_" + System.currentTimeMillis();
        }
    }

    private String buildDataString(Report report) {
        StringBuilder sb = new StringBuilder();
        sb.append("REPORT_ID:").append(report.getId()).append("|");
        sb.append("PATIENT:").append(report.getPatient() != null ? report.getPatient().getName() : "UNKNOWN").append("|");
        sb.append("VERIFIED_BY:").append(report.getVerifiedBy() != null ? report.getVerifiedBy() : "NONE").append("|");
        
        // Include result snapshots to ensure data payload integrity
        if (report.getResults() != null) {
            String resultsSummary = report.getResults().stream()
                    .map(r -> {
                        String pName = r.getParameter() != null ? r.getParameter().getParameterName() : "P";
                        String val = r.getResultValue() != null ? r.getResultValue() : (r.getValue() != null ? r.getValue() : "N/A");
                        return pName + ":" + val;
                    })
                    .sorted()
                    .collect(Collectors.joining(";"));
            sb.append("RESULTS:").append(resultsSummary);
        }

        return sb.toString();
    }

    private String calculateHmac(String data) throws NoSuchAlgorithmException, InvalidKeyException {
        SecretKeySpec secretKey = new SecretKeySpec(sealingSecret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM);
        Mac mac = Mac.getInstance(HMAC_ALGORITHM);
        mac.init(secretKey);
        byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(hmacBytes);
    }
}
