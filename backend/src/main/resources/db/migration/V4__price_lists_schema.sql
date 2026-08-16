CREATE TABLE price_lists (
    id UUID PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    commission_percentage DECIMAL(5, 2) DEFAULT 0.00,
    markup_amount DECIMAL(15, 2) DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    valid_from DATE,
    valid_to DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
