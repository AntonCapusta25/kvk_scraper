import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { KVKScraper } from './scraper';
import { SearchParams, ScrapeResponse } from './types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'KVK Scraper API is running' });
});

// Scrape endpoint
app.post('/api/scrape', async (req: Request, res: Response) => {
    const params: SearchParams = req.body;

    // Validate request
    if (!params.query || params.query.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'Search query is required'
        } as ScrapeResponse);
    }

    const scraper = new KVKScraper();

    try {
        console.log('Starting scrape with params:', params);

        await scraper.initialize();
        const results = await scraper.scrape(params);

        const response: ScrapeResponse = {
            success: true,
            data: results,
            totalResults: results.length,
            pagesScraped: Math.ceil(results.length / 10) // Approximate
        };

        res.json(response);
    } catch (error) {
        console.error('Scraping failed:', error);

        const response: ScrapeResponse = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };

        res.status(500).json(response);
    } finally {
        await scraper.close();
    }
});

app.listen(PORT, () => {
    console.log(`🚀 KVK Scraper API running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
