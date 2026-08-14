package com.ldi.aams.note;

import com.ldi.aams.note.internal.Note;
import com.ldi.aams.note.internal.NoteMapper;
import com.ldi.aams.note.internal.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final NoteMapper noteMapper;

    @Transactional(readOnly = true)
    public Page<NoteDto.NoteResponse> getAllNotes(Pageable pageable) {
        return noteRepository.findAll(pageable).map(noteMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<NoteDto.NoteResponse> getNotesByEntity(String entityType, UUID entityId, Pageable pageable) {
        if (entityId != null) {
            return noteRepository.findByEntityTypeAndEntityId(entityType, entityId, pageable).map(noteMapper::toResponse);
        }
        return noteRepository.findByEntityType(entityType, pageable).map(noteMapper::toResponse);
    }

    @Transactional
    public NoteDto.NoteResponse createNote(NoteDto.CreateNoteRequest request, String username) {
        Note note = Note.builder()
                .content(request.getContent())
                .entityType(request.getEntityType() != null && !request.getEntityType().isBlank() ? request.getEntityType() : "GENERAL")
                .entityId(request.getEntityId())
                .createdBy(username)
                .build();
        return noteMapper.toResponse(noteRepository.save(note));
    }
}
