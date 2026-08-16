CREATE TABLE notes (
    id UUID PRIMARY KEY,
    content TEXT NOT NULL,
    entity_type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    entity_id UUID,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookup by entity
CREATE INDEX idx_notes_entity ON notes(entity_type, entity_id);

-- Insert NOTE_MANAGE permission
INSERT INTO permissions (id, code, description, module) VALUES
    (gen_random_uuid(), 'NOTE_MANAGE', 'Can create and view notes', 'note')
ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;

-- Assign NOTE_MANAGE to ADMIN role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ADMIN' AND p.code = 'NOTE_MANAGE'
ON CONFLICT DO NOTHING;
