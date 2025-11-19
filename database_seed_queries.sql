-- =====================================================
-- SQL Queries to Seed Visitor Types and Department Categories
-- Run these queries in your database to populate the data
-- =====================================================

-- ==================== Visitor Types ====================
-- Insert visitor types from the constants file
-- Note: Adjust Idpk values based on your existing data

INSERT INTO VisitorTypes (Idpk, VTypeName, VTypeStatus, VTypeCreatedBy, VTypeCreatedAt)
VALUES
(1, 'Rector Office Guest', 1, 'System', GETUTCDATE()),
(2, 'Government Officials / Teams', 1, 'System', GETUTCDATE()),
(3, 'Parents / Guardians', 1, 'System', GETUTCDATE()),
(4, 'Faculty / Staff Visitors', 1, 'System', GETUTCDATE()),
(5, 'Alumni', 1, 'System', GETUTCDATE()),
(6, 'Academic Event Attendees', 1, 'System', GETUTCDATE()),
(7, 'Media Teams', 1, 'System', GETUTCDATE()),
(8, 'Church Attendees (Sat/Sun)', 1, 'System', GETUTCDATE()),
(9, 'Light of Hope / Mercy Health', 1, 'System', GETUTCDATE()),
(10, 'FEAT Candidates (S-Block)', 1, 'System', GETUTCDATE()),
(11, 'Prometric Candidates', 1, 'System', GETUTCDATE()),
(12, 'Vendors / Purchase Office', 1, 'System', GETUTCDATE()),
(13, 'Campus Centre Visitors', 1, 'System', GETUTCDATE()),
(14, 'Labor / Labor Camp', 1, 'System', GETUTCDATE()),
(15, 'Residents / Hostelite Visitors (Evening)', 1, 'System', GETUTCDATE()),
(16, 'Food Delivery', 1, 'System', GETUTCDATE());

-- ==================== Department Categories (Destinations) ====================
-- Insert department categories for destinations
-- Note: Adjust Idpk values based on your existing data
-- The groups from campusSites are flattened into individual categories

-- College Buildings
INSERT INTO DeptCategories (Idpk, CategoryName, CategoryStatus, CategoryCreatedBy, CategoryCreatedAt)
VALUES
(1, 'A-Block (Semi Tajammul)', 1, 'System', GETUTCDATE()),
(2, 'B-Block', 1, 'System', GETUTCDATE()),
(3, 'C-Block', 1, 'System', GETUTCDATE()),
(4, 'D-Block (Peter David)', 1, 'System', GETUTCDATE()),
(5, 'P-Block (Sosheela)', 1, 'System', GETUTCDATE()),
(6, 'Ewing Library', 1, 'System', GETUTCDATE()),
(7, 'Sinclair Hall', 1, 'System', GETUTCDATE());

-- University Buildings
INSERT INTO DeptCategories (Idpk, CategoryName, CategoryStatus, CategoryCreatedBy, CategoryCreatedAt)
VALUES
(8, 'E-Block (Elahi)', 1, 'System', GETUTCDATE()),
(9, 'S-Block (Armacost)', 1, 'System', GETUTCDATE()),
(10, 'Jim Tebbe Campus Center', 1, 'System', GETUTCDATE());

-- Academic Centers
INSERT INTO DeptCategories (Idpk, CategoryName, CategoryStatus, CategoryCreatedBy, CategoryCreatedAt)
VALUES
(11, 'Center for Dialogue and Action', 1, 'System', GETUTCDATE()),
(12, 'Resource Center', 1, 'System', GETUTCDATE());

-- Administrative Buildings
INSERT INTO DeptCategories (Idpk, CategoryName, CategoryStatus, CategoryCreatedBy, CategoryCreatedAt)
VALUES
(13, 'N-Block (Ahmed Saeed)', 1, 'System', GETUTCDATE()),
(14, 'Day Care Center', 1, 'System', GETUTCDATE()),
(15, 'Mercy Health Center', 1, 'System', GETUTCDATE()),
(16, 'Lucas Staff Café & Sports Complex', 1, 'System', GETUTCDATE()),
(17, 'Light of Hope School', 1, 'System', GETUTCDATE()),
(18, 'FC Chapel & I C Church', 1, 'System', GETUTCDATE()),
(19, 'Rizwan Masjid', 1, 'System', GETUTCDATE()),
(20, 'Rizwan Masjid Market', 1, 'System', GETUTCDATE()),
(21, 'Maintenance Workshop', 1, 'System', GETUTCDATE());

-- Residential Area
INSERT INTO DeptCategories (Idpk, CategoryName, CategoryStatus, CategoryCreatedBy, CategoryCreatedAt)
VALUES
(22, 'Expats Residence Visitors', 1, 'System', GETUTCDATE()),
(23, 'Residential Bungalows', 1, 'System', GETUTCDATE()),
(24, 'Residential Quarters / Hostels Adjacent', 1, 'System', GETUTCDATE());

-- Hostels
INSERT INTO DeptCategories (Idpk, CategoryName, CategoryStatus, CategoryCreatedBy, CategoryCreatedAt)
VALUES
(25, 'Hope Tower', 1, 'System', GETUTCDATE()),
(26, 'PG Girls Hostel (H/No 38)', 1, 'System', GETUTCDATE()),
(27, 'Single Women Residency (H/No 32C)', 1, 'System', GETUTCDATE()),
(28, 'Sherazi Hall', 1, 'System', GETUTCDATE()),
(29, 'West Hall', 1, 'System', GETUTCDATE()),
(30, 'Newton Hall', 1, 'System', GETUTCDATE()),
(31, 'Griswold Hall', 1, 'System', GETUTCDATE()),
(32, 'Vellte Hall', 1, 'System', GETUTCDATE()),
(33, 'Kennedy Hall', 1, 'System', GETUTCDATE());

-- Miscellaneous
INSERT INTO DeptCategories (Idpk, CategoryName, CategoryStatus, CategoryCreatedBy, CategoryCreatedAt)
VALUES
(34, 'Prometric Center', 1, 'System', GETUTCDATE()),
(35, 'Labor', 1, 'System', GETUTCDATE()),
(36, 'Vendors', 1, 'System', GETUTCDATE());

-- =====================================================
-- IMPORTANT NOTES:
-- 1. Check your existing data first to avoid ID conflicts
-- 2. Adjust Idpk values if you already have data in these tables
-- 3. If using SQL Server, use GETUTCDATE() or GETDATE()
-- 4. If using other databases, adjust the date function accordingly
-- 5. After running these queries, the Enroll page will automatically
--    load these values from the database
-- =====================================================

