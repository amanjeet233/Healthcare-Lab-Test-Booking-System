package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.SearchResultDTO;
import com.healthcare.labtestbooking.entity.LabTest;
import com.healthcare.labtestbooking.repository.LabTestRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private static final int MAX_AUTOCOMPLETE_RESULTS = 10;
    private static final int MAX_CACHE_SIZE = 200;
    private static final int POPULAR_LIMIT = 5;

    private final LabTestRepository labTestRepository;

    private volatile List<LabTest> activeTests = new ArrayList<>();
    private volatile Trie trie = new Trie();

    private final Map<String, Integer> queryPopularity = new ConcurrentHashMap<>();
    private final Map<Long, Integer> testPopularity = new ConcurrentHashMap<>();

    private final Map<String, List<String>> autocompleteCache = Collections.synchronizedMap(
        new LinkedHashMap<String, List<String>>(MAX_CACHE_SIZE, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<String, List<String>> eldest) {
                return size() > MAX_CACHE_SIZE;
            }
        }
    );

    @PostConstruct
    public void initializeIndex() {
        refreshIndex();
    }

    public void refreshIndex() {
        List<LabTest> tests = labTestRepository.findByIsActiveTrue();
        Trie nextTrie = new Trie();
        for (LabTest test : tests) {
            if (test.getTestName() != null) {
                nextTrie.insert(test.getTestName());
            }
            if (test.getTestCode() != null) {
                nextTrie.insert(test.getTestCode());
            }
        }
        activeTests = tests;
        trie = nextTrie;
        autocompleteCache.clear();
        log.info("Search index refreshed with {} tests", tests.size());
    }

    public List<SearchResultDTO> searchTests(String query) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String normalizedQuery = normalize(query);
        queryPopularity.merge(normalizedQuery, 1, Integer::sum);

        List<SearchResultDTO> results = new ArrayList<>();
        for (LabTest test : activeTests) {
            int score = calculateScore(normalizedQuery, test);
            if (score > 0) {
                testPopularity.merge(test.getId(), 1, Integer::sum);
                results.add(toSearchResult(test, score));
            }
        }

        return results.stream()
            .sorted(Comparator.comparing(SearchResultDTO::getMatchScore).reversed()
                .thenComparing(SearchResultDTO::getTestName, String.CASE_INSENSITIVE_ORDER))
            .collect(Collectors.toList());
    }

    public List<String> autocomplete(String prefix) {
        if (prefix == null || prefix.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String normalizedPrefix = normalize(prefix);
        List<String> cached = autocompleteCache.get(normalizedPrefix);
        if (cached != null) {
            return cached;
        }

        List<String> suggestions = trie.suggest(normalizedPrefix, MAX_AUTOCOMPLETE_RESULTS);
        autocompleteCache.put(normalizedPrefix, suggestions);
        return suggestions;
    }

    private SearchResultDTO toSearchResult(LabTest test, int score) {
        return SearchResultDTO.builder()
            .testId(test.getId())
            .testName(test.getTestName())
            .testCode(test.getTestCode())
            .category(test.getCategory() != null ? test.getCategory().getCategoryName() : null)
            .matchScore(score)
            .isPopular(isPopularTest(test.getId()))
            .build();
    }

    private boolean isPopularTest(Long testId) {
        return testPopularity.entrySet().stream()
            .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
            .limit(POPULAR_LIMIT)
            .anyMatch(entry -> entry.getKey().equals(testId));
    }

    private int calculateScore(String query, LabTest test) {
        String name = normalize(test.getTestName());
        String code = normalize(test.getTestCode());

        int score = 0;
        int nameDistance = name.isEmpty() ? Integer.MAX_VALUE : levenshteinDistance(query, name);
        int codeDistance = code.isEmpty() ? Integer.MAX_VALUE : levenshteinDistance(query, code);
        int distance = Math.min(nameDistance, codeDistance);

        boolean contains = (!name.isEmpty() && name.contains(query)) || (!code.isEmpty() && code.contains(query));
        boolean startsWith = (!name.isEmpty() && name.startsWith(query)) || (!code.isEmpty() && code.startsWith(query));

        if (contains || distance < 3) {
            int base = Math.max(0, 100 - (distance * 15));
            int bonus = 0;
            if (contains) {
                bonus += 30;
            }
            if (startsWith) {
                bonus += 15;
            }
            score = Math.min(100, base + bonus);
        }

        return score;
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private int levenshteinDistance(String a, String b) {
        int aLen = a.length();
        int bLen = b.length();
        if (aLen == 0) {
            return bLen;
        }
        if (bLen == 0) {
            return aLen;
        }

        int[] prev = new int[bLen + 1];
        int[] curr = new int[bLen + 1];

        for (int j = 0; j <= bLen; j++) {
            prev[j] = j;
        }

        for (int i = 1; i <= aLen; i++) {
            curr[0] = i;
            char aChar = a.charAt(i - 1);
            for (int j = 1; j <= bLen; j++) {
                int cost = aChar == b.charAt(j - 1) ? 0 : 1;
                curr[j] = Math.min(
                    Math.min(curr[j - 1] + 1, prev[j] + 1),
                    prev[j - 1] + cost
                );
            }
            int[] temp = prev;
            prev = curr;
            curr = temp;
        }

        return prev[bLen];
    }

    private static class Trie {
        private final TrieNode root = new TrieNode();

        void insert(String value) {
            String normalized = value.toLowerCase(Locale.ROOT).trim();
            if (normalized.isEmpty()) {
                return;
            }
            TrieNode node = root;
            for (char c : normalized.toCharArray()) {
                node = node.children.computeIfAbsent(c, key -> new TrieNode());
                node.addSuggestion(value);
            }
            node.isWord = true;
        }

        List<String> suggest(String prefix, int limit) {
            TrieNode node = root;
            for (char c : prefix.toCharArray()) {
                TrieNode next = node.children.get(c);
                if (next == null) {
                    return Collections.emptyList();
                }
                node = next;
            }
            return node.getSuggestions(limit);
        }
    }

    private static class TrieNode {
        private final Map<Character, TrieNode> children = new ConcurrentHashMap<>();
        private final List<String> suggestions = new ArrayList<>();
        private boolean isWord;

        void addSuggestion(String value) {
            if (suggestions.contains(value)) {
                return;
            }
            suggestions.add(value);
        }

        List<String> getSuggestions(int limit) {
            if (suggestions.isEmpty()) {
                return Collections.emptyList();
            }
            int size = Math.min(limit, suggestions.size());
            return new ArrayList<>(suggestions.subList(0, size));
        }
    }
}
