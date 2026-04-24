package com.healthcare.labtestbooking.health;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.SocketTimeoutException;

@Component
public class PaymentGatewayHealthIndicator implements HealthIndicator {

    @Value("${app.payment.mock-base-url:http://localhost:8080/payments/mock}")
    private String paymentMockBaseUrl;

    @Override
    public Health health() {
        try {
            // Check if payment gateway mock base URL is accessible
            URL url = new URL(paymentMockBaseUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("HEAD");
            connection.setConnectTimeout(3000);
            connection.setReadTimeout(3000);
            
            int responseCode = connection.getResponseCode();
            connection.disconnect();

            if (responseCode >= 200 && responseCode < 300) {
                return Health.up()
                        .withDetail("externalApi", "Payment Gateway")
                        .withDetail("status", "Reachable")
                        .withDetail("endpoint", paymentMockBaseUrl)
                        .withDetail("responseCode", responseCode)
                        .build();
            } else if (responseCode >= 400 && responseCode < 500) {
                return Health.outOfService()
                        .withDetail("externalApi", "Payment Gateway")
                        .withDetail("status", "Client Error")
                        .withDetail("endpoint", paymentMockBaseUrl)
                        .withDetail("responseCode", responseCode)
                        .build();
            } else {
                return Health.down()
                        .withDetail("externalApi", "Payment Gateway")
                        .withDetail("status", "Server Error")
                        .withDetail("endpoint", paymentMockBaseUrl)
                        .withDetail("responseCode", responseCode)
                        .build();
            }
        } catch (SocketTimeoutException e) {
            return Health.down()
                    .withDetail("externalApi", "Payment Gateway")
                    .withDetail("reason", "Connection timeout: " + e.getMessage())
                    .withDetail("endpoint", paymentMockBaseUrl)
                    .withException(e)
                    .build();
        } catch (Exception e) {
            return Health.down()
                    .withDetail("externalApi", "Payment Gateway")
                    .withDetail("reason", "Connection failed: " + e.getMessage())
                    .withDetail("endpoint", paymentMockBaseUrl)
                    .withException(e)
                    .build();
        }
    }
}
