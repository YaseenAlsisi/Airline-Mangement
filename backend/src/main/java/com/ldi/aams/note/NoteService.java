package com.ldi.aams.note;

import com.ldi.aams.note.internal.Note;
import com.ldi.aams.note.internal.NoteMapper;
import com.ldi.aams.note.internal.NoteRepository;
import com.ldi.aams.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final NoteMapper noteMapper;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public Page<NoteDto.NoteResponse> getAllNotes(Pageable pageable) {
        Page<Note> topLevelNotes = noteRepository.findByParentIdIsNull(pageable);
        return attachReplies(topLevelNotes);
    }

    @Transactional(readOnly = true)
    public Page<NoteDto.NoteResponse> getNotesByEntity(String entityType, UUID entityId, Pageable pageable) {
        Page<Note> topLevelNotes;
        if (entityId != null) {
            topLevelNotes = noteRepository.findByEntityTypeAndEntityIdAndParentIdIsNull(entityType, entityId, pageable);
        } else {
            topLevelNotes = noteRepository.findByEntityTypeAndParentIdIsNull(entityType, pageable);
        }
        return attachReplies(topLevelNotes);
    }

    private Page<NoteDto.NoteResponse> attachReplies(Page<Note> topLevelNotes) {
        if (topLevelNotes.isEmpty()) {
            return topLevelNotes.map(noteMapper::toResponse);
        }

        List<UUID> parentIds = topLevelNotes.getContent().stream().map(Note::getId).toList();
        List<Note> allReplies = noteRepository.findByParentIdIn(parentIds);
        
        Map<UUID, List<NoteDto.NoteResponse>> repliesByParentId = allReplies.stream()
                .map(noteMapper::toResponse)
                .collect(Collectors.groupingBy(NoteDto.NoteResponse::getParentId));

        return topLevelNotes.map(note -> {
            NoteDto.NoteResponse response = noteMapper.toResponse(note);
            response.setReplies(repliesByParentId.getOrDefault(note.getId(), List.of()));
            return response;
        });
    }

    @Transactional
    public NoteDto.NoteResponse createNote(NoteDto.CreateNoteRequest request, String username) {
        Note note = Note.builder()
                .content(request.getContent())
                .entityType(request.getEntityType() != null && !request.getEntityType().isBlank() ? request.getEntityType() : "GENERAL")
                .entityId(request.getEntityId())
                .parentId(request.getParentId())
                .createdBy(username)
                .build();
        
        Note savedNote = noteRepository.save(note);
        
        if (request.getParentId() != null) {
            noteRepository.findById(request.getParentId()).ifPresent(parentNote -> {
                notificationService.createNotification(
                        parentNote.getCreatedBy(), 
                        username, 
                        "NOTE_REPLY", 
                        username + " replied to your note.", 
                        parentNote.getId()
                );
            });
        }
        
        return noteMapper.toResponse(savedNote);
    }

    @Transactional
    public void deleteNote(UUID id, String username, boolean hasManagePermission) {
        noteRepository.findById(id).ifPresent(note -> {
            if (hasManagePermission || note.getCreatedBy().equals(username)) {
                noteRepository.delete(note);
            } else {
                throw new RuntimeException("Not authorized to delete this note");
            }
        });
    }
}
