-- V14__passenger_manifest_import_schema.sql

CREATE TABLE manifest_import_batches (
    id UUID PRIMARY KEY,
    original_filename VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    total_rows INT NOT NULL DEFAULT 0,
    valid_rows INT NOT NULL DEFAULT 0,
    invalid_rows INT NOT NULL DEFAULT 0,
    uploaded_by UUID NULL,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE manifest_passengers (
    id UUID PRIMARY KEY,
    batch_id UUID NOT NULL REFERENCES manifest_import_batches(id) ON DELETE CASCADE,
    row_number INT NOT NULL,
    passenger_name VARCHAR(255) NOT NULL,
    birth_date DATE NULL,
    national_id VARCHAR(50) NULL,
    passport_number VARCHAR(50) NULL,
    departure_port VARCHAR(255) NULL,
    destination VARCHAR(255) NULL,
    flight_number VARCHAR(100) NULL,
    departure_date DATE NULL,
    arrival_time TIME NULL,
    agent_id UUID NULL REFERENCES agents(id) ON DELETE SET NULL,
    agent_name_raw VARCHAR(255) NULL,
    investment_supplier VARCHAR(255) NULL,
    service_type VARCHAR(255) NULL,
    passenger_category VARCHAR(100) NULL,
    note_2 TEXT NULL,
    note_3 TEXT NULL,
    note_4 TEXT NULL,
    debit_usd DECIMAL(15,2) DEFAULT 0,
    credit_usd DECIMAL(15,2) DEFAULT 0,
    debit_egp DECIMAL(15,2) DEFAULT 0,
    credit_egp DECIMAL(15,2) DEFAULT 0,
    validation_status VARCHAR(50) NOT NULL DEFAULT 'VALID',
    validation_errors TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_manifest_passengers_batch_id ON manifest_passengers(batch_id);
CREATE INDEX idx_manifest_passengers_agent_id ON manifest_passengers(agent_id);
CREATE INDEX idx_manifest_passengers_agent_name_raw ON manifest_passengers(agent_name_raw);
CREATE INDEX idx_manifest_passengers_departure_date ON manifest_passengers(departure_date);
CREATE INDEX idx_manifest_passengers_passport_number ON manifest_passengers(passport_number);
CREATE INDEX idx_manifest_passengers_port_dest ON manifest_passengers(departure_port, destination);

-- Insert permissions
INSERT INTO permissions (id, code, description, module) VALUES 
(gen_random_uuid(), 'MANIFEST_IMPORT_VIEW', 'View manifest imports', 'manifest'),
(gen_random_uuid(), 'MANIFEST_IMPORT_CREATE', 'Create/Upload manifest imports', 'manifest'),
(gen_random_uuid(), 'MANIFEST_IMPORT_EDIT', 'Edit manifest imports', 'manifest'),
(gen_random_uuid(), 'MANIFEST_IMPORT_PUBLISH', 'Publish manifest imports', 'manifest');

-- Assign all permissions to ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permissions WHERE module = 'manifest';

-- Assign View permissions to VIEWER
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permissions 
WHERE module = 'manifest' AND code LIKE '%_VIEW';
