# KVK.nl Company Scraper

A web scraper for the Dutch Chamber of Commerce (KVK) website with a modern React admin interface and Playwright-powered browser automation.

## Features

- 🔍 **Customizable Search**: Search by company name, KVK number, address, or keywords
- 🎯 **Advanced Filters**: Category selection and multiple filter options
- 📊 **Data Export**: Export results to CSV or JSON formats
- 🎨 **Modern UI**: Beautiful dark theme with glassmorphism effects
- ⚡ **Fast Scraping**: Playwright Chromium automation for efficient data extraction
- 📄 **Pagination Support**: Scrape multiple pages of results

## Tech Stack

### Backend
- Node.js + TypeScript
- Express.js
- Playwright (Chromium)

### Frontend
- React + TypeScript
- Vite
- Axios

## Installation

### Prerequisites
- Node.js 18+ and npm

### Backend Setup

```bash
cd backend
npm install
npm run install-browser  # Install Playwright Chromium browser
cp .env.example .env      # Create environment file
```

### Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

The API will be available at `http://localhost:3001`

### Start Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

1. Open the frontend in your browser (`http://localhost:5173`)
2. Enter a search query (company name, KVK number, etc.)
3. Select a category (Everything, Trade Register, or Advice and Inspiration)
4. Apply optional filters:
   - Main Branches
   - Legal Persons
   - Registered
   - Existing (trade) names
5. Set the maximum number of pages to scrape
6. Click "Start Scraping"
7. View results in the table
8. Export data to CSV or JSON

## API Endpoints

### Health Check
```
GET /api/health
```

### Scrape KVK
```
POST /api/scrape
Content-Type: application/json

{
  "query": "burger",
  "category": "all",
  "filters": {
    "mainBranches": false,
    "legalPersons": false,
    "registered": false,
    "existingNames": false
  },
  "maxPages": 5
}
```

## Data Structure

Each scraped company contains:

```typescript
{
  tradeName: string;
  kvkNumber: string;
  companyType: string;
  branchType: string;
  establishmentNumber: string;
  address: string;
  activityDescription: string;
  statutoryName?: string;
  url: string;
}
```

## Project Structure

```
kvk-scraper/
├── backend/
│   ├── src/
│   │   ├── server.ts       # Express API server
│   │   ├── scraper.ts      # Playwright scraper logic
│   │   └── types.ts        # TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SearchForm.tsx
│   │   │   ├── SearchForm.css
│   │   │   ├── ResultsTable.tsx
│   │   │   └── ResultsTable.css
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── utils/
│   │   │   └── export.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── types.ts
│   └── package.json
└── README.md
```

## Notes

- The scraper uses headless Chromium browser automation since kvk.nl doesn't support URL-based filtering
- Scraping speed depends on network conditions and the number of results
- Be respectful of the KVK website - avoid excessive scraping requests
- Each page typically contains ~10 results

## License

MIT
