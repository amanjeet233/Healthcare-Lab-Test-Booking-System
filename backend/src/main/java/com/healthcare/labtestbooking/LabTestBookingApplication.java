package com.healthcare.labtestbooking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EntityScan(basePackages = "com.healthcare.labtestbooking.entity")
@EnableJpaRepositories(basePackages = "com.healthcare.labtestbooking.repository")
@EnableTransactionManagement
@EnableScheduling
@EnableAsync
@EnableJpaAuditing
public class LabTestBookingApplication {

    public static void main(String[] args) {
        SpringApplication.run(LabTestBookingApplication.class, args);
    }
}
