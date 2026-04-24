package com.healthcare.labtestbooking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DomainEventPublisher {

    private final ApplicationEventPublisher applicationEventPublisher;
    private final FeatureFlagService featureFlagService;

    public void publish(Object event) {
        if (featureFlagService.isDomainEventsEnabled()) {
            applicationEventPublisher.publishEvent(event);
        }
    }
}

