# Backend API Specifications for Guards

## Required Endpoints

You need to implement these endpoints in your backend API controller. The frontend is calling these endpoints:

### Base URL
All endpoints are under: `/api/Admin/`

---

## 1. Get All Guards
**GET** `/Admin/GetGuards`

**Response:** Array of Guard objects
```json
[
  {
    "id": "GUARD001",
    "guardFullName": "John Doe",
    "guardCode": "GD001",
    "username": "guard1",
    "guardEmail": "guard1@example.com",
    "guardPassword": null, // Don't return password in GET requests
    "guardPhone": "+92-300-1234567",
    "guardStatus": true,
    "guardLocationIdpk": 1,
    "guardIsDisabled": false,
    "guardCreatedBy": "System",
    "guardCreatedAt": "2025-11-21T01:00:00Z",
    "guardUpdatedBy": null,
    "guardUpdatedAt": null
  }
]
```

---

## 2. Get Guard By ID
**GET** `/Admin/GetGuardById/Guard/{id}`

**Parameters:**
- `id` (path parameter): Guard ID (e.g., "GUARD001")

**Response:** Single Guard object (same structure as above)

---

## 3. Create Guard
**POST** `/Admin/CreateGuard/Guard`

**Request Body:**
```json
{
  "Id": "GUARD001",
  "GuardFullName": "John Doe",
  "GuardCode": "GD001",
  "Username": "guard1",
  "GuardEmail": "guard1@example.com",
  "GuardPassword": "password123", // Should be hashed before storing
  "GuardPhone": "+92-300-1234567",
  "GuardStatus": true,
  "GuardLocationIdpk": 1, // or null
  "GuardIsDisabled": false,
  "GuardCreatedBy": "System"
}
```

**Response:** Created Guard object (without password)

**Validation:**
- `Id` is required and must be unique
- `GuardFullName` is required
- `Username` is required and must be unique
- `GuardEmail` is required and must be valid email format
- `GuardPassword` is required (should be hashed before storing)
- `GuardStatus` defaults to true if not provided
- `GuardIsDisabled` defaults to false if not provided

---

## 4. Update Guard
**PUT** `/Admin/UpdateGuard/Guard/{id}`

**Parameters:**
- `id` (path parameter): Guard ID

**Request Body:**
```json
{
  "GuardFullName": "John Doe Updated",
  "GuardCode": "GD001",
  "Username": "guard1",
  "GuardEmail": "guard1@example.com",
  "GuardPhone": "+92-300-1234567",
  "GuardStatus": true,
  "GuardLocationIdpk": 1,
  "GuardIsDisabled": false,
  "GuardUpdatedBy": "Admin"
}
```

**Note:** Password is NOT included in update (handle password changes separately if needed)

**Response:** Updated Guard object

---

## 5. Delete Guard
**DELETE** `/Admin/DeleteGuard/Guard/{id}`

**Parameters:**
- `id` (path parameter): Guard ID

**Response:** Success message or 204 No Content

---

## Database Table Structure

The Guards table should have these columns (matching the SQL file provided):

```sql
CREATE TABLE Guards (
    Id NVARCHAR(50) PRIMARY KEY,
    GuardFullName NVARCHAR(200) NOT NULL,
    GuardCode NVARCHAR(50) NULL,
    Username NVARCHAR(100) NOT NULL UNIQUE,
    GuardEmail NVARCHAR(200) NOT NULL,
    GuardPassword NVARCHAR(255) NOT NULL, -- Should be hashed
    GuardPhone NVARCHAR(20) NULL,
    GuardStatus BIT NOT NULL DEFAULT 1,
    GuardLocationIdpk INT NULL,
    GuardIsDisabled BIT NOT NULL DEFAULT 0,
    GuardCreatedBy NVARCHAR(100) NULL,
    GuardCreatedAt DATETIME NULL DEFAULT GETUTCDATE(),
    GuardUpdatedBy NVARCHAR(100) NULL,
    GuardUpdatedAt DATETIME NULL
);
```

---

## Important Notes

1. **Password Security:** Always hash passwords before storing (use bcrypt or similar)
2. **Password in Responses:** Never return passwords in GET requests
3. **Unique Constraints:** Username and Email should be unique
4. **Foreign Key:** GuardLocationIdpk should reference Locations(Idpk) if that table exists
5. **Error Handling:** Return appropriate HTTP status codes:
   - 200/201: Success
   - 400: Bad Request (validation errors)
   - 404: Not Found
   - 409: Conflict (duplicate username/email)
   - 500: Server Error

---

## Example C# Controller Structure

If you're using .NET, here's a basic structure:

```csharp
[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    // ... existing methods for AdminUsers and Companies ...

    [HttpGet("GetGuards")]
    public async Task<ActionResult<IEnumerable<Guard>>> GetGuards()
    {
        // Implementation
    }

    [HttpGet("GetGuardById/Guard/{id}")]
    public async Task<ActionResult<Guard>> GetGuardById(string id)
    {
        // Implementation
    }

    [HttpPost("CreateGuard/Guard")]
    public async Task<ActionResult<Guard>> CreateGuard([FromBody] CreateGuardDto dto)
    {
        // Hash password before saving
        // Validate unique username/email
        // Implementation
    }

    [HttpPut("UpdateGuard/Guard/{id}")]
    public async Task<ActionResult<Guard>> UpdateGuard(string id, [FromBody] UpdateGuardDto dto)
    {
        // Implementation
    }

    [HttpDelete("DeleteGuard/Guard/{id}")]
    public async Task<IActionResult> DeleteGuard(string id)
    {
        // Implementation
    }
}
```

---

## Quick Fix Option

If you want to test quickly, you can temporarily use the AdminUser endpoints pattern and create guards as a special type of admin user, but it's better to implement dedicated Guard endpoints.

