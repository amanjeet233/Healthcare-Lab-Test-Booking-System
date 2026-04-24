package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

/**
 * File Upload Controller
 * Handles secure file uploads with validation
 */
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAnyRole('TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
public class FileUploadController {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final Set<String> ALLOWED_MIME_TYPES = new HashSet<>(
            Arrays.asList("application/pdf", "image/jpeg", "image/png", "image/jpg")
    );
    private static final String UPLOAD_DIR = "uploads/reports/";

    /**
     * Upload report file with validation
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam MultipartFile file) {
        try {
            // Validate file exists
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("File is empty"));
            }

            // Validate file size
            if (file.getSize() > MAX_FILE_SIZE) {
                log.warn("File too large: {} bytes (max: {} bytes)", file.getSize(), MAX_FILE_SIZE);
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("File too large. Maximum 10MB allowed."));
            }

            // Validate MIME type
            String contentType = file.getContentType();
            if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType)) {
                log.warn("Invalid MIME type: {}", contentType);
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid file type. Allowed: PDF, JPG, PNG"));
            }

            // Validate filename for path traversal
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.contains("..") || originalFilename.contains("/")) {
                log.warn("Suspicious filename: {}", originalFilename);
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid filename"));
            }

            // Store with UUID to prevent overwrites and directory traversal
            String fileExtension = getFileExtension(originalFilename);
            String storedFilename = UUID.randomUUID() + "." + fileExtension;

            // Create upload directory if not exists
            Path uploadPath = Paths.get(UPLOAD_DIR);
            Files.createDirectories(uploadPath);

            // Write file
            Path filePath = uploadPath.resolve(storedFilename);
            Files.write(filePath, file.getBytes());

            log.info("File uploaded successfully: {} (stored as: {})", originalFilename, storedFilename);

            return ResponseEntity.ok(ApiResponse.success("File uploaded successfully",
                    new FileUploadResponse(storedFilename, originalFilename, file.getSize())));

        } catch (IOException e) {
            log.error("Error uploading file", e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Error uploading file"));
        }
    }

    /**
     * Download file
     */
    @GetMapping("/download/{filename}")
    public ResponseEntity<?> downloadFile(@PathVariable String filename) {
        try {
            // Validate filename for path traversal
            if (filename.contains("..") || filename.contains("/")) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid filename"));
            }

            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename);
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            log.info("File downloaded: {}", filename);
            return ResponseEntity.ok(ApiResponse.success("File found", filePath.toAbsolutePath().toString()));

        } catch (Exception e) {
            log.error("Error downloading file: {}", filename, e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Error downloading file"));
        }
    }

    /**
     * Extract file extension safely
     */
    private String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        return (lastDot > 0) ? filename.substring(lastDot + 1).toLowerCase() : "";
    }

    /**
     * File upload response DTO
     */
    public static class FileUploadResponse {
        public final String storedFilename;
        public final String originalFilename;
        public final long fileSize;

        public FileUploadResponse(String storedFilename, String originalFilename, long fileSize) {
            this.storedFilename = storedFilename;
            this.originalFilename = originalFilename;
            this.fileSize = fileSize;
        }
    }
}
