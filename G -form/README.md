# Missing Person Guardian Form

React + Node.js + Supabase app for submitting missing person reports with photo/video uploads.

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── index.js                  # Express server entry
│   │   ├── supabaseClient.js         # Supabase client (service role)
│   │   ├── middleware/upload.js      # Multer config + file type/size limits
│   │   ├── routes/guardian.js        # POST /api/guardian/submit, GET /api/guardian/:id
│   │   └── services/storageService.js # Upload to Supabase Storage + verify
│   └── supabase/migrations/
│       └── 001_guardian_submissions.sql
└── frontend/
    └── src/
        ├── components/
        │   ├── GuardianForm.js       # Main form
        │   ├── FileUploadField.js    # Drag-and-drop photo/video uploader
        │   └── SubmissionSuccess.js  # Post-submit confirmation with file status
        └── App.js
```

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `backend/supabase/migrations/001_guardian_submissions.sql` in the SQL editor
3. Create a Storage bucket named `missing-person-files` and set it to **public**
4. Copy your **Project URL** and **service_role** key

### 2. Backend

```bash
cd backend
cp .env.example .env
# Fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
npm install
npm run dev
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000
npm install
npm start
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/guardian/submit` | Submit a report (multipart/form-data) |
| GET  | `/api/guardian/:id`    | Retrieve a submission by ID |

### POST body fields

| Field | Type | Required |
|-------|------|----------|
| guardian_name | string | ✅ |
| guardian_phone | string | ✅ |
| guardian_email | string | |
| child_name | string | ✅ |
| child_age | number | ✅ |
| child_gender | string | |
| last_seen_date | date (YYYY-MM-DD) | ✅ |
| last_seen_location | string | ✅ |
| description | string | |
| photo | file (JPEG/PNG/WebP, max 10 MB) | |
| video | file (MP4/MOV/WebM, max 100 MB) | |

## File Upload Verification

After each file is uploaded to Supabase Storage, the backend:
1. Lists the storage folder and confirms the file exists by name
2. Checks the stored file size matches the uploaded buffer size
3. Returns `verified: true` in the response only when both checks pass

If verification fails, the request returns a 500 error and the submission is not saved to the database.
