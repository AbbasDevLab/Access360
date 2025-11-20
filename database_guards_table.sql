-- =====================================================
-- SQL Query to Create Guards Table
-- Run this query in your database to create the Guards table
-- =====================================================

-- OPTION 1: Create Guards Table WITHOUT Foreign Key (Recommended - simpler)
-- Use this version if you want to add the foreign key constraint later

CREATE TABLE Guards (
    Id NVARCHAR(50) PRIMARY KEY,
    GuardFullName NVARCHAR(200) NOT NULL,
    GuardCode NVARCHAR(50) NULL,
    Username NVARCHAR(100) NOT NULL UNIQUE,
    GuardEmail NVARCHAR(200) NOT NULL,
    GuardPassword NVARCHAR(255) NOT NULL,
    GuardPhone NVARCHAR(20) NULL,
    GuardStatus BIT NOT NULL DEFAULT 1,
    GuardLocationIdpk INT NULL,
    GuardIsDisabled BIT NOT NULL DEFAULT 0,
    GuardCreatedBy NVARCHAR(100) NULL,
    GuardCreatedAt DATETIME NULL DEFAULT GETUTCDATE(),
    GuardUpdatedBy NVARCHAR(100) NULL,
    GuardUpdatedAt DATETIME NULL
);

-- Create Indexes for better performance
CREATE INDEX IX_Guards_Username ON Guards(Username);
CREATE INDEX IX_Guards_GuardEmail ON Guards(GuardEmail);
CREATE INDEX IX_Guards_GuardStatus ON Guards(GuardStatus);
CREATE INDEX IX_Guards_GuardLocationIdpk ON Guards(GuardLocationIdpk);

-- =====================================================
-- OPTIONAL: Add Foreign Key Constraint Later (if Locations table exists)
-- Run this separately after creating the table if you want referential integrity
-- =====================================================

/*
ALTER TABLE Guards
ADD CONSTRAINT FK_Guards_Locations 
FOREIGN KEY (GuardLocationIdpk) 
REFERENCES Locations(Idpk) 
ON DELETE SET NULL;
*/

-- =====================================================
-- OPTIONAL: Insert Sample Guard (for testing)
-- Remove or modify as needed
-- =====================================================

/*
INSERT INTO Guards (
    Id, 
    GuardFullName, 
    GuardCode, 
    Username, 
    GuardEmail, 
    GuardPassword, 
    GuardPhone, 
    GuardStatus, 
    GuardLocationIdpk, 
    GuardIsDisabled, 
    GuardCreatedBy, 
    GuardCreatedAt
)
VALUES (
    'GUARD001',
    'John Doe',
    'GD001',
    'guard1',
    'guard1@example.com',
    'password123', -- ⚠️ In production, this should be hashed!
    '+92-300-1234567',
    1, -- Active
    NULL, -- No location assigned
    0, -- Not disabled
    'System',
    GETUTCDATE()
);
*/
