package com.healthcare.labtestbooking.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.features")
@Getter
@Setter
public class FeatureFlagsProperties {

    private boolean apiV1Enabled = true;
    private boolean mockPaymentsOnly = true;
    private boolean publishDomainEvents = true;
    private boolean circuitBreakerEnabled = true;
    private boolean requestCorrelationEnabled = true;
}

