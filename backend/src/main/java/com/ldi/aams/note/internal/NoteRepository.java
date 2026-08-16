package com.ldi.aams.note.internal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NoteRepository extends JpaRepository<Note, UUID> {
    Page<Note> findByEntityTypeAndEntityIdAndParentIdIsNull(String entityType, UUID entityId, Pageable pageable);
    Page<Note> findByEntityTypeAndParentIdIsNull(String entityType, Pageable pageable);
    Page<Note> findByParentIdIsNull(Pageable pageable);
    java.util.List<Note> findByParentIdIn(java.util.List<UUID> parentIds);
}
