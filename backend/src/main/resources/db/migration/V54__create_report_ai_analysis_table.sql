CREATE TABLE IF NOT EXISTS report_ai_analysis (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    health_score INT NULL,
    summary TEXT NULL,
    flags_json LONGTEXT NULL,
    patterns_json LONGTEXT NULL,
    recommendations_json LONGTEXT NULL,
    disclaimer TEXT NULL,
    raw_response LONGTEXT NULL,
    prompt_snapshot LONGTEXT NULL,
    error_message TEXT NULL,
    generated_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_report_ai_analysis_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);
