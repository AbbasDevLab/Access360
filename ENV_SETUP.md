# Environment Variables Setup

## Required Environment Variables

This application requires environment variables to be set for proper operation. Follow these steps:

### 1. Create `.env` File

Create a `.env` file in the root directory of the project (same level as `package.json`).

### 2. Copy from Template

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Or manually create `.env` with the following content:

```env
# OpenAI API Key for OCR text extraction
# Get your API key from: https://platform.openai.com/api-keys
VITE_OPENAI_API_KEY=your_openai_api_key_here

# API Base URL
VITE_API_BASE_URL=https://api.access360.site/backend/api/
```

### 3. Set Your API Key

Replace `your_openai_api_key_here` with your actual OpenAI API key.

**Important:** Never commit the `.env` file to git. It's already in `.gitignore`.

---

## Environment Variables Explained

### `VITE_OPENAI_API_KEY`
- **Required:** Yes (for OCR functionality)
- **Description:** OpenAI API key used for extracting structured data from CNIC OCR text
- **Get your key:** https://platform.openai.com/api-keys

### `VITE_API_BASE_URL`
- **Required:** No (has default in code)
- **Description:** Base URL for the backend API
- **Default:** `https://api.access360.site/backend/api/`

---

## Notes

- All environment variables in Vite must be prefixed with `VITE_` to be accessible in the frontend
- The `.env` file is already in `.gitignore` and will not be committed
- After creating/updating `.env`, restart your development server for changes to take effect

