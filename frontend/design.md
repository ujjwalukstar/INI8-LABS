```markdown
# HEALTHCARE_PLATFORM

## 1. Tech Stack Choices

**Q1. Frontend framework**  
- **React (Vite)** — fast dev server, small bundle, component model. Easy to validate file inputs and update UI reactively.

**Q2. Backend framework**  
- **Node.js + Express** — lightweight, simple to create REST APIs, integrates easily with multer for file uploads and mysql2 for MySQL.

**Q3. Database**  
- **MySQL** — relational DB requested. Lightweight to run locally, good tooling, ACID properties for metadata.

**Q4. If supporting 1,000 users**  
- Use cloud object storage (S3) for files instead of local disk.  
- Move DB to managed RDS / cluster; use read replicas for read-heavy loads.  
- Add authentication and per-user isolation.  
- Add background workers (for virus scan, thumbnail generation).  
- Add CDN for downloads, autoscaling for backend (load balancer), monitoring.

## 2. Architecture Overview

- Frontend (React) <--> Backend REST API (Express)
- Backend stores uploaded files on disk in `uploads/` and writes metadata to MySQL `documents` table.
- When downloading, backend streams file from disk.

**Diagram (linear):**
1. User chooses PDF in UI → frontend POST `/documents/upload`.
2. Backend receives file (multer), saves to `uploads/`, inserts metadata into MySQL.
3. Frontend calls GET `/documents` to refresh list.
4. For download, frontend navigates to `/documents/:id` (GET) which streams file.
5. For delete, frontend calls DELETE `/documents/:id` → backend deletes file and row.

## 3. API Specification

### POST /documents/upload
- **Description**: Upload a PDF file.
- **Request**:
  - Method: `POST`
  - Content-Type: `multipart/form-data`
  - Body: field name `file` (PDF only)
- **Sample Response (success, 201)**:
```json
{
  "id": 1,
  "filename": "report.pdf",
  "filepath": "uploads/167123_report.pdf",
  "filesize": 34567,
  "created_at": "2025-12-10T12:00:00Z",
  "status": "uploaded"
}
```

### GET /documents
- **Description**: List all documents (for the single assumed user).
- **Request**: `GET /documents`
- **Response (200)**:
```json
[
  {
    "id": 1,
    "filename": "report.pdf",
    "filepath": "uploads/167123_report.pdf",
    "filesize": 34567,
    "created_at": "2025-12-10T12:00:00Z",
    "status": "uploaded"
  }
]
```

### GET /documents/:id
- **Description**: Download a file by id.
- **Request**: `GET /documents/1`
- **Response**: Streams file as `application/pdf` with header  
  `Content-Disposition: attachment; filename="report.pdf"`

### DELETE /documents/:id
- **Description**: Delete file and remove metadata row.
- **Request**: `DELETE /documents/1`
- **Response (200 success)**:
```json
{ "message": "deleted", "id": 1 }
```

## 4. Data Flow Description

**Upload flow (step-by-step)**  
1. Frontend: user selects PDF and clicks Upload.  
2. Frontend: sends `multipart/form-data` POST to `/documents/upload`.  
3. Backend (Express + multer): validates file type (only `application/pdf`) and file size (limit).  
4. Backend: saves file under `uploads/` with unique name (timestamp + original name).  
5. Backend: inserts metadata into `documents` table (`filename`, `filepath`, `filesize`, `created_at`, `status`).  
6. Backend: returns metadata JSON to frontend.  
7. Frontend: fetches `/documents` to refresh list.

**Download flow**  
1. Frontend receives list with document `id`.  
2. User clicks Download → browser navigates to `/documents/:id`.  
3. Backend looks up metadata by `id`; if record exists and file is present, sets proper headers and streams file.  
4. Browser downloads the PDF.

## 5. Assumptions

- Single-user flow (no authentication required).  
- File type limited to PDF only.  
- File size limit: default 10 MB (adjustable).  
- Concurrency: small scale; no special locking needed.  
- Files stored locally in `uploads/` for simplicity (not durable for production).  
- Deleted files are permanently removed from disk.
```

