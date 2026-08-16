-- Insert basic permissions
INSERT INTO permissions (id, code, description, module) VALUES 
(gen_random_uuid(), 'AGENT_VIEW', 'View agents', 'agent'),
(gen_random_uuid(), 'AGENT_CREATE', 'Create agents', 'agent'),
(gen_random_uuid(), 'AGENT_EDIT', 'Edit agents', 'agent'),
(gen_random_uuid(), 'AGENT_DELETE', 'Delete agents', 'agent'),
(gen_random_uuid(), 'PRICE_VIEW', 'View price lists', 'pricelist'),
(gen_random_uuid(), 'PRICE_CREATE', 'Create price lists', 'pricelist'),
(gen_random_uuid(), 'PRICE_EDIT', 'Edit price lists', 'pricelist'),
(gen_random_uuid(), 'PRICE_DELETE', 'Delete price lists', 'pricelist'),
(gen_random_uuid(), 'IMPORT_VIEW', 'View import history', 'excelimport'),
(gen_random_uuid(), 'IMPORT_CREATE', 'Upload/import files', 'excelimport'),
(gen_random_uuid(), 'REPORT_VIEW', 'View reports', 'report'),
(gen_random_uuid(), 'USER_MANAGE', 'Manage users', 'user'),
(gen_random_uuid(), 'ROLE_MANAGE', 'Manage roles and permissions', 'user'),
(gen_random_uuid(), 'NOTE_CREATE', 'Create notes', 'note'),
(gen_random_uuid(), 'NOTE_REPLY', 'Reply to notes', 'note'),
(gen_random_uuid(), 'AUDIT_VIEW', 'View audit logs', 'auditlog');

-- Insert initial roles
INSERT INTO roles (id, name, description, is_system) VALUES 
('00000000-0000-0000-0000-000000000001', 'ADMIN', 'System Administrator', true),
('00000000-0000-0000-0000-000000000002', 'VIEWER', 'Read Only Viewer', true);

-- Assign all permissions to ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permissions;

-- Assign View and Note permissions to VIEWER
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permissions 
WHERE code LIKE '%_VIEW' OR code IN ('NOTE_CREATE', 'NOTE_REPLY');

-- Insert default admin user (password is 'admin' hashed with bcrypt: $2a$10$5DxKN6AwOCsrH62fP8OHhO4gM0HeUUscQsjNGtpo.52oMBeC8eiBa)
INSERT INTO users (id, username, email, password_hash, full_name, is_active) VALUES 
('11111111-1111-1111-1111-111111111111', 'admin', 'admin@example.com', '$2a$10$5DxKN6AwOCsrH62fP8OHhO4gM0HeUUscQsjNGtpo.52oMBeC8eiBa', 'System Administrator', true);

-- Assign ADMIN role to default admin user
INSERT INTO user_roles (user_id, role_id) VALUES 
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001');
