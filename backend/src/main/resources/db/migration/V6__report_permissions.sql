-- Insert REPORT_VIEW permission (handle conflict if it already exists from V1_1)
INSERT INTO permissions (id, code, description, module) VALUES
    (gen_random_uuid(), 'REPORT_VIEW', 'Can view financial reports', 'report')
ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;

-- Assign REPORT_VIEW to ADMIN role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ADMIN' AND p.code = 'REPORT_VIEW'
ON CONFLICT DO NOTHING;
