# HEALTHCARE_PLATFORM

Simple full-stack app to upload, list, download and delete PDF medical documents.

## Tech
- Frontend: React (Vite)
- Backend: Node.js + Express
- Database: MySQL
- File storage: local `backend/uploads/`

## Setup (local)
Prereqs: Node.js (16+), npm, MySQL server.

### 1. Clone
```bash
git clone https://github.com/ujjwalukstar/INI8-LABS.git
cd Healthcare_Platform
```

### 2. Install Node_Modules
```bash
cd backend -> npm i
cd frontend -> npm i
```

### 3. MySQL: create DB & table

Edit backend/.env with your MySQL credentials.

Run the migration:
```bash
mysql -u root -p < backend/migrations/create_documents_table.sql
```

### 4. Set-up .env files
```bash

backend/.env -
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=healthcare
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760   # 10MB in bytes

frontend/.env -
VITE_API_URL="http://localhost:4000"

```
### 4. Start Commands

Backend
```bash
cd backend
npm start or node server.js
```

Frontend
```bash
cd frontend
npm run dev
```