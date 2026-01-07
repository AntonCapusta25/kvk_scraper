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

## Deployment

### Deploying Frontend to Vercel

The frontend can be deployed to Vercel while running the backend locally.

#### Prerequisites
- Vercel account
- Vercel CLI (optional): `npm install -g vercel`

#### Step 1: Configure Environment Variables

1. Copy the environment template:
   ```bash
   cp .env.example frontend/.env
   ```

2. For **local development**, keep the default:
   ```env
   VITE_API_URL=http://localhost:3001
   ```

3. For **production** (deployed frontend connecting to your local backend), you'll need to expose your local backend using one of these options:

   **Option A: ngrok (Recommended for testing)**
   ```bash
   # Install ngrok: https://ngrok.com/download
   ngrok http 3001
   # Use the provided HTTPS URL in Vercel environment variables
   ```

   **Option B: Cloudflare Tunnel**
   ```bash
   # Install cloudflared
   cloudflared tunnel --url http://localhost:3001
   ```

   **Option C: Public IP/VPS**
   - Deploy backend to a VPS with a public IP
   - Ensure port 3001 is accessible

#### Step 2: Deploy to Vercel

**Using Vercel Dashboard:**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Vercel will auto-detect the `vercel.json` configuration
5. Add environment variable:
   - Key: `VITE_API_URL`
   - Value: Your backend URL (e.g., `https://your-ngrok-url.ngrok.io` or `http://your-ip:3001`)
6. Click "Deploy"

**Using Vercel CLI:**
```bash
# From project root
vercel

# Set environment variable
vercel env add VITE_API_URL

# Deploy to production
vercel --prod
```

#### Step 3: Configure Backend CORS

Update your backend's `.env` file to allow requests from your Vercel deployment:

```env
PORT=3001
FRONTEND_URL=https://your-vercel-app.vercel.app
```

Or modify `backend/src/server.ts` to allow multiple origins:

```typescript
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://your-vercel-app.vercel.app'
    ]
}));
```

#### Important Notes

- **CORS**: Ensure your backend allows requests from your Vercel domain
- **HTTPS**: If using ngrok or similar, you'll get HTTPS automatically
- **Security**: For production, consider adding authentication to your backend API
- **Tunneling**: ngrok free tier sessions expire after 2 hours; restart as needed

## License

MIT
