# Access360 Project Overview

Access360 is a visitor management system built for secure, efficient check-in/out with auditability, faculty scheduling, and guard operations. It includes OCR-based enrollment, multi-role portals, and a unified UI theme.

## Core Modules
- **Admin Portal**: Manage users, companies, guards, faculties, and scheduled guest approvals.
- **Guard Portal**: Check-in/out flows and scheduled guest verification at counters.
- **Faculty Portal**: Schedule guests and track approval and arrival status.

## Features Implemented

### Visitor & Guest Management
- **OCR-based enrollment** with CNIC extraction (name, father name, CNIC).
- **Manual visitor entry** with validation and optional fields.
- **Guest visit creation** and **active visit tracking**.
- **Return visitor lookup** for faster processing.
- **Guest list** and **guest visit list** with CRUD operations.

### Guard Operations
- **Guard dashboard** with check-in/check-out actions.
- **Scheduled guest list** with search by name, CNIC, phone, or faculty.
- **Mark arrival** for scheduled guests (timestamped).
- **No-show auto marking** for past approved guests.
- **Car number visibility** for faster vehicle verification.

### Faculty Scheduling
- **Faculty login** and session handling.
- **Create scheduled guest requests** (date/time, purpose, car).
- **View request status** (pending/approved/rejected/arrived/no-show).
- **Arrival timestamps** surfaced to faculty.

### Admin Management
- **Admin users** (create/list/delete).
- **Companies** (create/list/delete).
- **Guards** (create/list/delete).
- **Faculties** (create/list/delete for faculty portal credentials).
- **Scheduled guest approval workflow** (approve/reject with reason).
- **Home dashboard** shows pending faculty guest requests.

### UX & UI
- **Unified dark theme** across Admin, Guard, and Faculty portals.
- **Readable forms** and consistent controls across pages.
- **Bilingual Admin User form** (English + Urdu side-by-side labels).
- **Side panel layout** for scheduled guest visibility on guard dashboard.
- **Search/filter** for large scheduled lists.

### Internationalization
- **i18n setup** for English and Urdu.
- **Bilingual labels** in admin forms.

### API Integration
- Centralized API base URL config.
- Services for:
  - Admin users, companies, guards
  - Locations, departments, visitor types
  - Guests and visits
  - Faculty and scheduled guests
  - OCR integration (OCR.space)

## Planned/Backend-Required Endpoints (for full flow)
- **Faculty Login**: `POST /api/Faculty/Login`
- **Scheduled Guests**:
  - Create/Read/Update/Delete
  - Approve/Reject
  - Mark Arrived / No Show

## Notes
- Guard and faculty portals rely on backend endpoints to validate users and scheduled guest states.
- Arrival and no-show tracking requires backend support for `ArrivedAt`, `NoShowAt`, and `VisitStatus`.

