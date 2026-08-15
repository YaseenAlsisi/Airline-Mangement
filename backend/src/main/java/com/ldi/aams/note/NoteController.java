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

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @GetMapping
    @PreAuthorize("hasAuthority('NOTE_MANAGE')")
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
    @PreAuthorize("hasAuthority('NOTE_MANAGE')")
    public ResponseEntity<ApiResponse<NoteDto.NoteResponse>> createNote(
            @Valid @RequestBody NoteDto.CreateNoteRequest request,
            Authentication authentication) {
        return new ResponseEntity<>(ApiResponse.success(noteService.createNote(request, authentication.getName())), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('NOTE_MANAGE') or hasAuthority('NOTE_DELETE_ANY')")
    public ResponseEntity<ApiResponse<Void>> deleteNote(
            @PathVariable UUID id,
            Authentication authentication) {
        noteService.deleteNote(id, authentication);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
