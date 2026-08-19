CREATE TABLE agent_payments (
    id UUID PRIMARY KEY,
    agent_name_raw VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_payments_agent_name ON agent_payments(agent_name_raw);
