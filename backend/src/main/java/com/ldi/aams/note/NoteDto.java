package com.ldi.aams.note;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

public class NoteDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NoteResponse {
        private UUID id;
        private String content;
        private String entityType;
        private UUID entityId;
        private String createdBy;
        private Instant createdAt;
        private Instant updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateNoteRequest {
        @NotBlank(message = "Content is required")
        private String content;

        private String entityType;
        private UUID entityId;
    }
}
