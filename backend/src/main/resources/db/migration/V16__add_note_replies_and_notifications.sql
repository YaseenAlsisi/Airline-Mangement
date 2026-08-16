-- Add parent_id to notes table for replies
ALTER TABLE notes 
ADD COLUMN parent_id UUID REFERENCES notes(id) ON DELETE CASCADE;

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    recipient_username VARCHAR(255) NOT NULL,
    sender_username VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    reference_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for querying unread notifications for a user
CREATE INDEX idx_notifications_recipient_unread ON notifications(recipient_username, is_read);
