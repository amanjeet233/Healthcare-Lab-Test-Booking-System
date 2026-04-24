package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.config.FeatureFlagsProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FeatureFlagService {

    private final FeatureFlagsProperties featureFlagsProperties;

    public boolean isApiV1Enabled() {
        return featureFlagsProperties.isApiV1Enabled();
    }

    public boolean isMockPaymentsOnlyEnabled() {
        return featureFlagsProperties.isMockPaymentsOnly();
    }

    public boolean isDomainEventsEnabled() {
        return featureFlagsProperties.isPublishDomainEvents();
    }

    public boolean isCircuitBreakerEnabled() {
        return featureFlagsProperties.isCircuitBreakerEnabled();
    }

    public boolean isRequestCorrelationEnabled() {
        return featureFlagsProperties.isRequestCorrelationEnabled();
    }
}

