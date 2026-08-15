-- Insert NOTE_DELETE_ANY permission
INSERT INTO permissions (id, code, description, module) VALUES
    (gen_random_uuid(), 'NOTE_DELETE_ANY', 'Can delete any note', 'note')
ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;

-- Assign NOTE_DELETE_ANY to ADMIN role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ADMIN' AND p.code = 'NOTE_DELETE_ANY'
ON CONFLICT DO NOTHING;
