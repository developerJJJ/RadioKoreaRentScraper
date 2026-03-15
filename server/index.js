import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const BASE_URL = 'https://www.radiokorea.com/bulletin/bbs/board.php?bo_table=c_realestate';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

app.post('/api/scrape', async (req, res) => {
    const { pages = 1, excludeKeywords = [] } = req.body;
    const allListings = [];
    let globalIndex = 1;

    try {
        for (let page = 1; page <= pages; page++) {
            if (page > 1) {
                const waitTime = 1000 + Math.random() * 1000;
                console.log(`Waiting ${waitTime.toFixed(0)}ms before next page...`);
                await delay(waitTime);
            }
            const url = `${BASE_URL}&page=${page}`;
            console.log(`Scraping page ${page}: ${url}`);

            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            console.log(`Response received: ${data.length} characters`);

            const $ = cheerio.load(data);
            const listingItems = $('.board_list li').filter((i, el) => $(el).find('a[href*="wr_id="]').length > 0);
            
            console.log(`Found ${listingItems.length} potential listing items on page ${page}`);

            listingItems.each((i, el) => {
                const item = $(el);
                
                // The first a tag with wr_id usually has the main info
                const mainLink = item.find('a[href*="wr_id="]').first();
                if (mainLink.length === 0) return;

                const link = mainLink.attr('href');
                const title = item.find('h3').text().trim() || mainLink.text().trim();
                
                // Skip notices or empty/advertisement rows if possible
                if (!title || title.includes('[공지]')) return;

                const price = item.find('.price').text().trim() || 'N/A';
                const writer = item.find('.writer').text().trim() || 'N/A';
                const date = item.find('.date').text().trim() || 'N/A';
                const location = item.find('.location').text().trim() || 'N/A';
                const category = item.find('.ca_name').text().trim() || 'N/A';

                // Check for excluded keywords (case-insensitive and trimmed)
                const shouldExclude = excludeKeywords.some(keyword => {
                    const cleanKeyword = keyword.trim().toLowerCase();
                    if (!cleanKeyword) return false;
                    return title.toLowerCase().includes(cleanKeyword) || 
                           writer.toLowerCase().includes(cleanKeyword) ||
                           category.toLowerCase().includes(cleanKeyword);
                });

                if (!shouldExclude) {
                    allListings.push({
                        index: globalIndex++,
                        title,
                        link: link.startsWith('http') ? link : `https://www.radiokorea.com${link.startsWith('/') ? link : '/bulletin/bbs/' + link.replace(/^\.\.\/bbs\//, '')}`,
                        price,
                        writer,
                        location,
                        category,
                        date
                    });
                }
            });
        }

        res.json({ success: true, listings: allListings });
    } catch (error) {
        console.error('Scraping error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
