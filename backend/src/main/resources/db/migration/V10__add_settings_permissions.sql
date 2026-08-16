-- Insert missing permissions
INSERT INTO permissions (id, code, description, module) VALUES 
(gen_random_uuid(), 'NOTE_VIEW', 'View notes', 'note'),
(gen_random_uuid(), 'SETTINGS_MANAGE', 'Manage all settings', 'settings'),
(gen_random_uuid(), 'SYSTEM_VIEW', 'View system settings', 'settings');

-- Assign new permissions to ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permissions 
WHERE code IN ('NOTE_VIEW', 'SETTINGS_MANAGE', 'SYSTEM_VIEW');

-- Assign View permissions to VIEWER
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permissions 
WHERE code IN ('NOTE_VIEW', 'SYSTEM_VIEW');
