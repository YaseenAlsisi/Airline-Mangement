-- Insert REPORT_VIEW permission
INSERT INTO permissions (id, name, description) VALUES
    (gen_random_uuid(), 'REPORT_VIEW', 'Can view financial reports');

-- Assign REPORT_VIEW to ADMIN role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ADMIN' AND p.name = 'REPORT_VIEW';
