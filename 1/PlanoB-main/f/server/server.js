const express = require('express');
const cors = require('cors');
const { 
    scrapeHealthAlerts, 
    scrapeWAHISAlerts,
    getErrorLog,
    clearCache
} = require('./scraper');
const NodeCache = require('node-cache');

const app = express();
const API_CACHE = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

// Middlewares
app.use(cors());
app.use(express.json());

// Main endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'AgroDashboard API Online',
        endpoints: {
            alerts: '/api/alerts',
            wahis: '/api/wahis-alerts',
            vaccines: '/api/vaccines',
            errors: '/api/errors (dev only)'
        },
        version: '2.0.0'
    });
});

// MAPA alerts endpoint
app.get('/api/alerts', async (req, res) => {
    try {
        const cachedAlerts = API_CACHE.get('mapa_alerts');
        if (cachedAlerts) {
            return res.json({
                source: 'cache',
                data: cachedAlerts
            });
        }

        const alerts = await scrapeHealthAlerts();
        API_CACHE.set('mapa_alerts', alerts);
        
        res.json({
            source: 'live',
            data: alerts
        });
    } catch (error) {
        console.error('Error in /api/alerts:', error);
        res.status(500).json({
            error: 'Failed to fetch alerts',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// WAHIS alerts endpoint
app.get('/api/wahis-alerts', async (req, res) => {
    try {
        const cachedAlerts = API_CACHE.get('wahis_alerts');
        if (cachedAlerts) {
            return res.json({
                source: 'cache',
                data: cachedAlerts
            });
        }

        const alerts = await scrapeWAHISAlerts();
        API_CACHE.set('wahis_alerts', alerts);
        
        res.json({
            source: 'live',
            data: alerts
        });
    } catch (error) {
        console.error('Error in /api/wahis-alerts:', error);
        res.status(500).json({
            error: 'Failed to fetch WAHIS alerts',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Vaccines endpoint (mock data)
app.get('/api/vaccines', (req, res) => {
    try {
        const vaccines = [
            {
                id: 1,
                date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
                title: "Febre Aftosa Vaccination",
                type: "mandatory",
                animal: "cattle",
                description: "Mandatory for all cattle"
            },
            {
                id: 2,
                date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
                title: "Deworming",
                type: "recommended",
                animal: "all",
                description: "Preventive deworming"
            }
        ];
        
        API_CACHE.set('vaccines', vaccines);
        res.json(vaccines);
    } catch (error) {
        console.error('Error in /api/vaccines:', error);
        res.status(500).json({
            error: 'Failed to fetch vaccines',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Error log endpoint (development only)
if (process.env.NODE_ENV === 'development') {
    app.get('/api/errors', (req, res) => {
        res.json(getErrorLog());
    });
}

// Cache management endpoint
app.post('/api/cache/clear', (req, res) => {
    try {
        const { source } = req.body;
        if (source && ['mapa', 'wahis'].includes(source)) {
            clearCache(source);
            API_CACHE.del(`${source}_alerts`);
            return res.json({ success: true, message: `Cache cleared for ${source}` });
        }
        throw new Error('Invalid source');
    } catch (error) {
        res.status(400).json({
            error: 'Failed to clear cache',
            details: error.message
        });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('API error:', err.stack);
    res.status(500).json({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔍 Scrapers configured with ${API_CACHE.getTtl('mapa_alerts') / 3600000} hour cache`);
});

// Scheduled updates
setInterval(async () => {
    try {
        console.log('⏳ Updating MAPA data...');
        const mapaData = await scrapeHealthAlerts();
        API_CACHE.set('mapa_alerts', mapaData);
        
        console.log('⏳ Updating WAHIS data...');
        const wahisData = await scrapeWAHISAlerts();
        API_CACHE.set('wahis_alerts', wahisData);
        
        console.log('✅ All data updated successfully');
    } catch (error) {
        console.error('❌ Update failed:', error.message);
    }
}, 3600000); // Every 1 hour