const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    const html = `
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>News App</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 40px; color: white; }
        .header h1 { font-size: 3rem; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        .loading { text-align: center; color: white; font-size: 1.2rem; margin: 50px 0; }
        .news-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 30px; }
        .news-card {
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
            transform: translateY(0);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .news-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
        .news-image { width: 100%; height: 200px; object-fit: cover; }
        .news-content { padding: 25px; }
        .news-title { font-size: 1.4rem; font-weight: 600; margin-bottom: 15px; color: #2c3e50; line-height: 1.3; }
        .news-description { color: #666; line-height: 1.6; margin-bottom: 15px; }
        .news-meta { display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; color: #888; border-top: 1px solid #eee; padding-top: 15px; }
        .refresh-btn { position: fixed; bottom: 30px; right: 30px; background: #667eea; color: white; border: none; border-radius: 50%; width: 60px; height: 60px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📰 News App</h1>
            <p>Senaste nyheterna från hela världen</p>
        </div>
        <div id="loading" class="loading">Laddar nyheter...</div>
        <div id="newsContainer" class="news-grid"></div>
    </div>
    <button id="refreshBtn" class="refresh-btn">🔄</button>
    <script>
        async function loadNews() {
            const loading = document.getElementById('loading');
            const newsContainer = document.getElementById('newsContainer');
            loading.style.display = 'block';
            newsContainer.innerHTML = '';
            try {
                const response = await fetch('/api/news');
                const data = await response.json();
                loading.style.display = 'none';
                if (data.articles && data.articles.length > 0) {
                    data.articles.forEach(article => {
                        const card = document.createElement('div');
                        card.className = 'news-card';
                        const publishedDate = new Date(article.publishedAt);
                        const formattedDate = publishedDate.toLocaleDateString('sv-SE', {
                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        });
                        card.innerHTML = \`
                            <img src="\${article.urlToImage || 'https://via.placeholder.com/400x200/cccccc/666666?text=No+Image'}" 
                                 alt="\${article.title}" class="news-image">
                            <div class="news-content">
                                <h2 class="news-title">\${article.title}</h2>
                                <p class="news-description">\${article.description || 'Ingen beskrivning tillgänglig.'}</p>
                                <div class="news-meta">
                                    <span>\${article.source?.name || 'Okänd källa'}</span>
                                    <span>\${formattedDate}</span>
                                </div>
                            </div>
                        \`;
                        newsContainer.appendChild(card);
                    });
                }
            } catch (err) {
                loading.style.display = 'none';
                console.error('Error loading news:', err);
            }
        }
        document.addEventListener('DOMContentLoaded', loadNews);
        document.getElementById('refreshBtn').addEventListener('click', loadNews);
    </script>
</body>
</html>`;
    res.send(html);
});

// API endpoint för nyheter
app.get('/api/news', async (req, res) => {
    try {
        // Använder NewsAPI (du behöver registrera för API key)
        // För demo använder vi mock data
        const mockNews = {
            status: "ok",
            totalResults: 3,
            articles: [
                {
                    title: "Breaking: Tech Innovation Reaches New Heights",
                    description: "Latest developments in technology sector show promising growth...",
                    url: "https://example.com/tech-news",
                    urlToImage: "https://via.placeholder.com/400x200/0066cc/ffffff?text=Tech+News",
                    publishedAt: new Date().toISOString(),
                    source: { name: "Tech Daily" }
                },
                {
                    title: "Climate Change: New Solutions Emerge",
                    description: "Scientists develop innovative approaches to combat climate change...",
                    url: "https://example.com/climate-news",
                    urlToImage: "https://via.placeholder.com/400x200/009900/ffffff?text=Climate+News",
                    publishedAt: new Date(Date.now() - 3600000).toISOString(),
                    source: { name: "Green Times" }
                },
                {
                    title: "Sports Update: Championship Results",
                    description: "Latest results from major sporting events around the world...",
                    url: "https://example.com/sports-news",
                    urlToImage: "https://via.placeholder.com/400x200/ff6600/ffffff?text=Sports+News",
                    publishedAt: new Date(Date.now() - 7200000).toISOString(),
                    source: { name: "Sports Central" }
                }
            ]
        };

        res.json(mockNews);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 News App server running on port ${PORT}`);
    console.log(`📱 Open http://localhost:${PORT} to view the app`);
});