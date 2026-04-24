CREATE TABLE IF NOT EXISTS report_shares (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    report_id BIGINT NOT NULL,
    shared_with_email VARCHAR(120) NOT NULL,
    access_type VARCHAR(20) NOT NULL,
    shared_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_report_shares_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

CREATE INDEX idx_report_shares_report_id ON report_shares(report_id);
CREATE INDEX idx_report_shares_shared_email ON report_shares(shared_with_email);

