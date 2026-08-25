CREATE TABLE agent_import_batches (
    id UUID PRIMARY KEY,
    original_filename VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'COMPLETED',
    total_agents INT NOT NULL DEFAULT 0,
    total_transactions INT NOT NULL DEFAULT 0,
    total_passengers INT NOT NULL DEFAULT 0,
    total_payments INT NOT NULL DEFAULT 0,
    imported_by UUID NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);
