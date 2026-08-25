CREATE TABLE agent_transactions (
    id UUID PRIMARY KEY,
    agent_id UUID NOT NULL REFERENCES agents(id),
    import_batch_id UUID NULL,
    
    transaction_type VARCHAR(30) NOT NULL,  
    
    passenger_name VARCHAR(255),
    birth_date DATE,
    national_id VARCHAR(50),
    passport_number VARCHAR(50),
    departure_port VARCHAR(255),
    destination VARCHAR(255),
    airline VARCHAR(255),
    departure_date DATE,
    departure_time TIME,
    investment_supplier VARCHAR(255),
    service_type VARCHAR(255),
    passenger_category VARCHAR(100),
    note TEXT,
    note_2 TEXT,
    note_3 TEXT,
    
    payment_description TEXT,
    
    debit_usd NUMERIC(15, 2) NOT NULL DEFAULT 0,
    credit_usd NUMERIC(15, 2) NOT NULL DEFAULT 0,
    debit_egp NUMERIC(15, 2) NOT NULL DEFAULT 0,
    credit_egp NUMERIC(15, 2) NOT NULL DEFAULT 0,
    
    source_sheet_name VARCHAR(255),
    source_row_number INT,
    raw_column_a TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_txn_agent ON agent_transactions(agent_id);
CREATE INDEX idx_agent_txn_type ON agent_transactions(transaction_type);
CREATE INDEX idx_agent_txn_batch ON agent_transactions(import_batch_id);
CREATE INDEX idx_agent_txn_dep_date ON agent_transactions(departure_date);
CREATE INDEX idx_agent_txn_passport ON agent_transactions(passport_number);
