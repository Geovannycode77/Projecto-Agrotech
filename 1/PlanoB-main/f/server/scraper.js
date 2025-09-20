const puppeteer = require('puppeteer');
const { JSDOM } = require('jsdom');

// Configuration
const SCRAPE_URLS = {
    MAPA: 'https://www.gov.br/agricultura/pt-br/assuntos/sanidade-animal',
    OIE_WAHIS: 'https://wahis.woah.org/#/reporting/list?country=AGO' // Angola filter
};

// Separate caches
let caches = {
    mapa: { 
        lastUpdated: null, 
        data: null, 
        ttl: 3600000 // 1 hour
    },
    wahis: { 
        lastUpdated: null, 
        data: null, 
        ttl: 3600000 // 1 hour
    }
};

const errorLog = [];

// ================== SCRAPING FUNCTIONS ================== //

async function scrapeWAHIS() {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    });
    
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'pt-BR,pt;q=0.9'
        });

        console.log(`Accessing WAHIS: ${SCRAPE_URLS.OIE_WAHIS}`);
        await page.goto(SCRAPE_URLS.OIE_WAHIS, {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        // Wait for alerts table
        await page.waitForSelector('.outbreak-list', { timeout: 30000 });

        const alerts = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.outbreak-item'));
            return items.map(item => ({
                disease: item.querySelector('.disease-name')?.innerText.trim() || 'Unspecified disease',
                location: item.querySelector('.location')?.innerText.trim() || 'Unspecified location',
                date: item.querySelector('.date')?.innerText.trim() || new Date().toLocaleDateString('pt-BR'),
                status: item.querySelector('.status')?.innerText.trim() || 'Unknown status',
                source: 'WAHIS'
            }));
        });

        // Filter for relevant diseases
        return alerts.filter(alert => {
            const lowerDisease = alert.disease.toLowerCase();
            return lowerDisease.includes('suína') || 
                   lowerDisease.includes('aviária') ||
                   lowerDisease.includes('aftosa');
        });

    } catch (error) {
        console.error('WAHIS scraping error:', error);
        errorLog.push({
            timestamp: new Date(),
            source: 'WAHIS',
            error: error.message
        });
        throw error;
    } finally {
        await browser.close();
    }
}

async function scrapeMAPASanidadeAnimal() {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    });
    
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'pt-BR,pt;q=0.9'
        });

        console.log(`Accessing MAPA: ${SCRAPE_URLS.MAPA}`);
        await page.goto(SCRAPE_URLS.MAPA, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        // Verify correct page loaded
        const pageTitle = await page.title();
        if (!pageTitle.includes('Sanidade Animal')) {
            throw new Error(`Incorrect page loaded. Title: ${pageTitle}`);
        }

        // Wait for key elements
        try {
            await page.waitForSelector('#content-core, .main-content, .content', { timeout: 30000 });
        } catch (e) {
            console.log('Key elements not found after 30 seconds');
        }

        // Extract content
        const content = await page.evaluate(() => {
            return document.querySelector('#content-core, .main-content, .content')?.innerHTML || null;
        });

        if (!content) {
            const screenshot = await page.screenshot({ encoding: 'base64' });
            console.error('HTML not found. Screenshot:', screenshot.substring(0, 100) + '...');
            throw new Error('Page structure not found');
        }

        // Parse with JSDOM
        const dom = new JSDOM(content);
        const document = dom.window.document;
        
        const alerts = [];
        const items = document.querySelectorAll('.tileItem, .list-item, .item-noticia');

        if (items.length === 0) {
            console.log('No items found - HTML:', content.substring(0, 200) + '...');
        }

        items.forEach(item => {
            try {
                const titleElement = item.querySelector('.tileHeadline a, .titulo-noticia, h3 a');
                const dateElement = item.querySelector('.summary-view-icon, .data-noticia, time');
                const summaryElement = item.querySelector('.description, .resumo-noticia');
                
                if (titleElement) {
                    const alert = {
                        title: titleElement.textContent.trim(),
                        link: titleElement.href || SCRAPE_URLS.MAPA,
                        date: dateElement ? 
                            dateElement.textContent.trim() : 
                            new Date().toLocaleDateString('pt-BR'),
                        summary: summaryElement ? 
                            summaryElement.textContent.trim().substring(0, 150) + '...' : 
                            '',
                        source: 'MAPA'
                    };
                    
                    // Detect animal type
                    const lowerTitle = alert.title.toLowerCase();
                    if (lowerTitle.includes('aviária') || lowerTitle.includes('aves')) {
                        alert.animal = 'aves';
                    } else if (lowerTitle.includes('suína') || lowerTitle.includes('suínos')) {
                        alert.animal = 'suinos';
                    } else {
                        alert.animal = 'bovinos';
                    }
                    
                    // Simulate random distance
                    alert.distance = Math.floor(Math.random() * 200) + 10;
                    
                    alerts.push(alert);
                }
            } catch (error) {
                console.error('Error processing item:', error);
                errorLog.push({
                    timestamp: new Date(),
                    source: 'MAPA',
                    error: error.message
                });
            }
        });

        return alerts.slice(0, 10);

    } catch (error) {
        console.error('MAPA scraping error:', error);
        errorLog.push({
            timestamp: new Date(),
            source: 'MAPA',
            error: error.message
        });
        throw error;
    } finally {
        await browser.close();
    }
}

// ================== CACHE MANAGEMENT ================== //

async function getCachedData(source = 'mapa') {
    const now = new Date();
    const cache = caches[source];
    
    if (cache.data && cache.lastUpdated && (now - cache.lastUpdated) < cache.ttl) {
        console.log(`Returning cached ${source} data`);
        return cache.data;
    }
    
    try {
        console.log(`Updating ${source} cache...`);
        const data = source === 'wahis' ? await scrapeWAHIS() : await scrapeMAPASanidadeAnimal();
        
        caches[source] = {
            data,
            lastUpdated: new Date(),
            ttl: 3600000
        };
        
        return data;
    } catch (error) {
        if (cache.data) {
            console.log(`Using cached data due to ${source} scraping error`);
            return cache.data;
        }
        throw error;
    }
}

// ================== EXPORTS ================== //

module.exports = {
    scrapeHealthAlerts: () => getCachedData('mapa'),
    scrapeWAHISAlerts: () => getCachedData('wahis'),
    getErrorLog: () => errorLog,
    clearCache: (source) => {
        caches[source] = { lastUpdated: null, data: null, ttl: 3600000 };
        console.log(`Cache cleared for ${source}`);
    }
};