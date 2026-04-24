package com.healthcare.labtestbooking.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final DataSource dataSource;

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking if lab tests data needs to be loaded...");

        try (Connection connection = dataSource.getConnection()) {
            var stmt = connection.createStatement();
            var rs = stmt.executeQuery("SELECT COUNT(*) FROM tests");
            rs.next();
            int count = rs.getInt(1);

            if (count == 0) {
                log.info("Tests table is empty. Flyway migrations are expected to seed lab tests before startup completes.");
            } else {
                log.info("Lab tests data already exists. Skipping initialization.");
            }
        } catch (SQLException e) {
            log.warn("Error checking lab tests data: {}", e.getMessage());
        }
    }
}
