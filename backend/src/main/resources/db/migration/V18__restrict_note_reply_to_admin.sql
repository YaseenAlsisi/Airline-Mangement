-- Remove NOTE_REPLY permission from all roles except ADMIN
DELETE FROM role_permissions
WHERE permission_id = (SELECT id FROM permissions WHERE code = 'NOTE_REPLY')
  AND role_id != '00000000-0000-0000-0000-000000000001';
