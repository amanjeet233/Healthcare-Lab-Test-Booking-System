-- Create health_metrics table used by HealthInsightsService

CREATE TABLE IF NOT EXISTS health_metrics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_code VARCHAR(50) NOT NULL,
    metric_value DECIMAL(12,4) NULL,
    unit VARCHAR(20) NULL,
    risk_level ENUM('LOW','MODERATE','HIGH','CRITICAL') NULL,
    trend VARCHAR(20) NULL,
    interpretation TEXT NULL,
    source_report_id BIGINT NULL,
    measured_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    CONSTRAINT fk_health_metrics_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_health_metrics_report
        FOREIGN KEY (source_report_id) REFERENCES reports(id)
);

CREATE INDEX idx_health_metrics_user_id ON health_metrics(user_id);
CREATE INDEX idx_health_metrics_metric_code ON health_metrics(metric_code);
CREATE INDEX idx_health_metrics_measured_at ON health_metrics(measured_at);
