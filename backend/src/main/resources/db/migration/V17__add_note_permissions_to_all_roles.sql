-- Add NOTE_VIEW, NOTE_CREATE, and NOTE_REPLY to all existing roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE p.code IN ('NOTE_VIEW', 'NOTE_CREATE', 'NOTE_REPLY')
ON CONFLICT DO NOTHING;
