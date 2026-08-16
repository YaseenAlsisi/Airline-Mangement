ALTER TABLE manifest_passengers
ADD COLUMN regular_price NUMERIC(12, 2),
ADD COLUMN commission NUMERIC(12, 2),
ADD COLUMN total_price NUMERIC(12, 2);
