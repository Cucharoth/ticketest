-- -- -- =====================================================
-- -- -- Seed Data for Ticketest Backend
-- -- -- =====================================================


-- \c ticket_test_db;


-- Clean existing data
DELETE FROM "attendee_event";
DELETE FROM "ticket_event";
DELETE FROM "ticket";
DELETE FROM "event";
DELETE FROM "attendee";
DELETE FROM "notification";
DELETE FROM "event_type";
DELETE FROM "ticket_type";
DELETE FROM "notification_type";

-- =====================================================
-- Event Types
-- =====================================================
INSERT INTO "event_type" (id, name, "createdAt", "updatedAt") VALUES
('10000000-0000-0000-0000-000000000001', 'Concert', NOW(), NOW()),
('10000000-0000-0000-0000-000000000002', 'Conference', NOW(), NOW()),
('10000000-0000-0000-0000-000000000003', 'Workshop', NOW(), NOW());

-- =====================================================
-- Ticket Types
-- =====================================================
INSERT INTO "ticket_type" (id, type, "createdAt", "updatedAt") VALUES
('20000000-0000-0000-0000-000000000001', 'VIP', NOW(), NOW()),
('20000000-0000-0000-0000-000000000002', 'General Admission', NOW(), NOW()),
('20000000-0000-0000-0000-000000000003', 'Early Bird', NOW(), NOW());

-- =====================================================
-- Notification Types
-- =====================================================
INSERT INTO "notification_type" (id, type, "createdAt", "updatedAt") VALUES
('30000000-0000-0000-0000-000000000001', 'Email', NOW(), NOW()),
('30000000-0000-0000-0000-000000000002', 'SMS', NOW(), NOW()),
('30000000-0000-0000-0000-000000000003', 'Push', NOW(), NOW());

-- =====================================================
-- Attendees
-- =====================================================
INSERT INTO "attendee" (id, name, email, cellphone, "createdAt", "updatedAt") VALUES
('40000000-0000-0000-0000-000000000001', 'John Doe', 'john.doe@example.com', '+1234567890', NOW(), NOW()),
('40000000-0000-0000-0000-000000000002', 'Jane Smith', 'jane.smith@example.com', '+0987654321', NOW(), NOW());

-- =====================================================
-- Events
-- =====================================================
INSERT INTO "event" (id, name, date, place, "ticket_max", "tickets_left", "ticket_sold", "typeId", "createdAt", "updatedAt") VALUES
('50000000-0000-0000-0000-000000000001', 'Summer Music Festival', NOW() + INTERVAL '30 days', 'Central Park', 5000, 5000, 0, '10000000-0000-0000-0000-000000000001', NOW(), NOW()),
('50000000-0000-0000-0000-000000000002', 'Tech Summit 2025', NOW() + INTERVAL '60 days', 'Convention Center', 1000, 950, 50, '10000000-0000-0000-0000-000000000002', NOW(), NOW());