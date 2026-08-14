package com.ldi.aams.note.internal;

import com.ldi.aams.note.NoteDto;
import org.springframework.stereotype.Component;

@Component
public class NoteMapper {

    public NoteDto.NoteResponse toResponse(Note note) {
        return NoteDto.NoteResponse.builder()
                .id(note.getId())
                .content(note.getContent())
                .entityType(note.getEntityType())
                .entityId(note.getEntityId())
                .createdBy(note.getCreatedBy())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }
}
