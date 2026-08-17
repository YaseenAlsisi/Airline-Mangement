package com.ldi.aams.note;

import com.ldi.aams.common.dto.ApiResponse;
import com.ldi.aams.common.dto.PagedResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.AccessDeniedException;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('NOTE_MANAGE', 'NOTE_VIEW')")
    public ResponseEntity<ApiResponse<PagedResponse<NoteDto.NoteResponse>>> getNotes(
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) UUID entityId,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        if (entityType != null) {
            return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(noteService.getNotesByEntity(entityType, entityId, pageable))));
        }
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(noteService.getAllNotes(pageable))));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('NOTE_MANAGE', 'NOTE_CREATE', 'NOTE_REPLY')")
    public ResponseEntity<ApiResponse<NoteDto.NoteResponse>> createNote(
            @Valid @RequestBody NoteDto.CreateNoteRequest request,
            Authentication authentication) {
        
        if (request.getParentId() != null) {
            boolean hasReplyAuth = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("NOTE_REPLY") || a.getAuthority().equals("NOTE_MANAGE"));
            if (!hasReplyAuth) {
                throw new AccessDeniedException("Not authorized to reply to notes");
            }
        }
        
        return new ResponseEntity<>(ApiResponse.success(noteService.createNote(request, authentication.getName())), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNote(@PathVariable UUID id, Authentication authentication) {
        boolean hasManage = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("NOTE_MANAGE"));
        noteService.deleteNote(id, authentication.getName(), hasManage);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
