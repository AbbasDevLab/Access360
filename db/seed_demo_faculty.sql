-- Demo Faculty Seed (SQL Server)
-- Creates a demo faculty user if it doesn't exist

IF OBJECT_ID('dbo.Faculty', 'U') IS NULL
BEGIN
  RAISERROR('Table dbo.Faculty does not exist. Please run the schema script first.', 16, 1)
  RETURN
END

IF NOT EXISTS (SELECT 1 FROM dbo.Faculty WHERE Username = 'demo.faculty')
BEGIN
  INSERT INTO dbo.Faculty (
    FacultyId,
    FacultyFullName,
    FacultyCode,
    Username,
    FacultyEmail,
    FacultyPassword,
    FacultyPhone,
    FacultyStatus,
    FacultyIsDisabled,
    FacultyCreatedBy
  ) VALUES (
    'FAC-DEMO-001',
    'Demo Faculty',
    'DF001',
    'demo.faculty',
    'demo.faculty@example.com',
    'Demo@123',
    '0300-0000000',
    1,
    0,
    'System'
  )
END
ELSE
BEGIN
  PRINT 'Demo faculty user already exists.'
END
