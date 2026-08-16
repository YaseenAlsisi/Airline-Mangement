-- V13__add_pricing_groups_schema.sql

-- 1. Create price_list_groups table
CREATE TABLE price_list_groups (
    id UUID PRIMARY KEY,
    price_list_id UUID NOT NULL REFERENCES price_lists(id) ON DELETE CASCADE,
    departure_airport VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add pricing_group_id to price_list_entries
ALTER TABLE price_list_entries
    ADD COLUMN pricing_group_id UUID REFERENCES price_list_groups(id) ON DELETE CASCADE;

-- 3. Migrate existing data
-- First, insert distinct groups into price_list_groups
-- Using gen_random_uuid() which is available in PostgreSQL 13+
INSERT INTO price_list_groups (id, price_list_id, departure_airport, destination, created_at, updated_at)
SELECT gen_random_uuid(), price_list_id, departure, destination, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT price_list_id, departure, destination
    FROM price_list_entries
) AS distinct_groups;

-- Then, update price_list_entries to link to the new groups
UPDATE price_list_entries ple
SET pricing_group_id = plg.id
FROM price_list_groups plg
WHERE ple.price_list_id = plg.price_list_id
  AND ple.departure = plg.departure_airport
  AND ple.destination = plg.destination;

-- 4. Clean up price_list_entries
-- Delete any entries that couldn't be mapped (should be 0, but just in case)
DELETE FROM price_list_entries WHERE pricing_group_id IS NULL;

-- Make pricing_group_id NOT NULL
ALTER TABLE price_list_entries
    ALTER COLUMN pricing_group_id SET NOT NULL;

-- Drop old columns from price_list_entries
ALTER TABLE price_list_entries
    DROP COLUMN price_list_id,
    DROP COLUMN departure,
    DROP COLUMN destination;

-- 5. Add unique constraint to prevent duplicate passenger types in a group
ALTER TABLE price_list_entries
    ADD CONSTRAINT uq_pricing_group_passenger_type UNIQUE (pricing_group_id, passenger_type);
