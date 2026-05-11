/** 
 * LOKAL AI — Core logic for Segmentation and Recommendations 
 */

// Helper: Toggle Buttons Functionality
function setToggle(btn, group) {
    const parent = btn.parentElement;
    parent.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// Helper: Get selected value from a toggle group
function getSelected(groupId) {
    const group = document.querySelector(`.toggle-group[data-group="${groupId}"]`);
    if (!group) return null;
    const active = group.querySelector('.toggle-btn.active');
    return active ? active.innerText : null;
}

// Helper: Delay function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- SEGMENTATION LOGIC ---

const CLUSTERS = {
    'A': {
        name: 'THE TRENDSETTER',
        desc: 'Young, social-savvy buyers who prioritize hype and early-adopter status. High affinity for streetwear and limited drops.',
        metrics: { size: '24%', ltv: '$1,240', risk: 'Low' },
        strategy: ['Launch exclusive influencer-led drops', 'Utilize hyper-fast TikTok/Reels content', 'Incentivize UGC on social threads', 'Implement early-access loyalty gates'],
        channels: ['TIKTOK', 'INSTAGRAM', 'DISCORD']
    },
    'B': {
        name: 'THE LUXURY SEEKER',
        desc: 'High-net-worth individuals focused on heritage, material quality, and personal concierge services.',
        metrics: { size: '12%', ltv: '$8,500', risk: 'Very Low' },
        strategy: ['Direct 1:1 VIP outreach', 'Private viewing events', 'High-gloss editorial content', 'Premium packaging/unboxing experience'],
        channels: ['EMAIL', 'DIRECT', 'PRIVATE WHATSAPP']
    },
    'C': {
        name: 'THE CONSCIOUS BUYER',
        desc: 'Value-driven shoppers who research supply chains and prioritize brand ethics over raw aesthetics.',
        metrics: { size: '18%', ltv: '$950', risk: 'Medium' },
        strategy: ['Transparent supply chain reporting', 'Partnerships with ethical activists', 'Recycling/circular program highlights', 'Detailed fabric sourcing guides'],
        channels: ['BLOG', 'PINTEREST', 'ECO-VILLAGE']
    },
    'D': {
        name: 'THE CASUAL BROWSER',
        desc: 'Seasonal shoppers looking for reliable basics and accessible entry points into new trends.',
        metrics: { size: '46%', ltv: '$420', risk: 'High' },
        strategy: ['Flash sales and coupon retargeting', 'Bundle-and-save offers', 'Search-engine optimized guides', 'Automated cart recovery emails'],
        channels: ['GOOGLE ADS', 'FACEBOOK', 'EMAIL NEWSLETTER']
    }
}

async function runSegmentation() {
    const age = getSelected('age');
    const style = getSelected('style');
    const budget = getSelected('budget');
    const freq = getSelected('freq');
    const channel = getSelected('channel');

    showLoader('PROCESSING STYLE VECTORS...');
    await sleep(1800);
    hideLoader();

    let result = CLUSTERS['D']; // Default

    if (budget === '$600+' || style === 'Luxury') {
        result = CLUSTERS['B'];
    } else if (style === 'Sustainable') {
        result = CLUSTERS['C'];
    } else if (age === '18-24' && style === 'Streetwear') {
        result = CLUSTERS['A'];
    } else if (freq === 'Weekly' || freq === 'Daily/Impulse') {
        result = CLUSTERS['A'];
    }

    displaySegmentation(result);
}

function displaySegmentation(cluster) {
    document.getElementById('cluster-name').innerText = cluster.name;
    document.getElementById('cluster-desc').innerText = cluster.desc;
    document.getElementById('metric-size').innerText = cluster.metrics.size;
    document.getElementById('metric-ltv').innerText = cluster.metrics.ltv;
    document.getElementById('metric-risk').innerText = cluster.metrics.risk;

    const strategyList = document.getElementById('strategy-list');
    strategyList.innerHTML = '';
    cluster.strategy.forEach(item => {
        const li = document.createElement('li');
        li.innerText = item;
        strategyList.appendChild(li);
    });

    const channelTags = document.getElementById('channel-tags');
    channelTags.innerHTML = '';
    cluster.channels.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.innerText = tag;
        channelTags.appendChild(span);
    });

    document.querySelector('.control-panel').style.display = 'none';
    document.getElementById('segmentation-result').style.display = 'block';
}

function resetSegmentation() {
    document.querySelector('.control-panel').style.display = 'block';
    document.getElementById('segmentation-result').style.display = 'none';
}

// --- RECOMMENDATIONS LOGIC ---

const PRODUCTS = {
    'Streetwear': { 'Bold & Vibrant': [
        { icon: '👟', name: 'Neon Volt Runners', price: '$120', desc: 'Lightweight mesh with react foam tech' },
        { icon: '🧥', name: 'Cobalt Shell Jacket', price: '$210', desc: 'GORE-TEX infused techwear' },
        { icon: '🧢', name: 'Reflective Snapback', price: '$45', desc: '3M visibility with 24oz canvas' },
        { icon: '🎒', name: 'Utility Rig Bag', price: '$85', desc: 'Modular strapping system' }
    ]},
    'Luxury': { 'Neutrals': [
        { icon: '👞', name: 'Calfskin Loafers', price: '$650', desc: 'Hand-stitched in Milan' },
        { icon: '👔', name: 'Silk-Linen Shirt', price: '$320', desc: 'Tailored fit, mother-of-pearl buttons' },
        { icon: '👓', name: 'Acetate Frames', price: '$420', desc: 'Japanese hardware, polarized lenses' },
        { icon: '💼', name: 'Full-Grain Brief', price: '$1200', desc: 'Weatherproof leather, brass fittings' }
    ]},
    'Minimalist': { 'Earth Tones': [
        { icon: '👕', name: 'Heavy Cotton Tee', price: '$45', desc: '300gsm, boxy vintage fit' },
        { icon: '👖', name: 'Canvas Work Pant', price: '$95', desc: 'Double-knee reinforced' },
        { icon: '🧥', name: 'Unstructured Chore Coat', price: '$165', desc: 'Stone-washed twill' },
        { icon: '👟', name: 'Suede Court Sneaker', price: '$140', desc: 'Raw edge finish, cream sole' }
    ]}
};

// Generic fallback products for others
const FALLBACK_PRODUCTS = [
    { icon: '👕', name: 'Signature Basic Tee', price: '$35', desc: 'Essential staple for any wardrobe' },
    { icon: '👖', name: 'Structured Slim Fit', price: '$85', desc: 'Versatile cut for all-day comfort' },
    { icon: '🧥', name: 'Variable Layer Hoodie', price: '$75', desc: 'Fleece lined, heavy-duty build' },
    { icon: '👞', name: 'Daily Hybrid Boot', price: '$145', desc: 'Weatherproof suede, ergonomic sole' }
];

async function runRecommendations() {
    const gender = getSelected('gender');
    const style = getSelected('main-style');
    const colors = getSelected('colors');
    const occasion = getSelected('occasion');
    const budget = getSelected('item-budget');

    showLoader('MAPPING STYLE VECTORS...');
    await sleep(2000);
    hideLoader();

    let recs = FALLBACK_PRODUCTS;
    if (PRODUCTS[style] && PRODUCTS[style][colors]) {
        recs = PRODUCTS[style][colors];
    } else if (PRODUCTS[style]) {
        // Just use the first available color for that style if match not exact
        const firstKey = Object.keys(PRODUCTS[style])[0];
        recs = PRODUCTS[style][firstKey];
    }

    displayRecommendations(recs, style, colors, occasion);
}

function displayRecommendations(recs, style, colors, occasion) {
    const container = document.getElementById('product-list');
    container.innerHTML = '';

    recs.forEach((p, index) => {
        const matchPercent = 95 - (index * 2) + Math.floor(Math.random() * 5);
        const card = document.createElement('div');
        card.className = 'rec-card fade-up';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <span class="rec-match">${matchPercent}% MATCH</span>
            <span class="rec-icon">${p.icon}</span>
            <h4 class="rec-name">${p.name}</h4>
            <p style="font-size: 0.75rem; color: var(--muted); margin-bottom: 0.5rem;">${p.desc}</p>
            <span class="rec-price">${p.price}</span>
        `;
        container.appendChild(card);
    });

    document.getElementById('reasoning-text').innerText = `Based on your preference for ${style.toLowerCase()} silhouettes in ${colors.toLowerCase()}, our engine identified consistent fabric affinities for ${occasion.toLowerCase()} use. These picks emphasize structural integrity and color harmony.`;

    const dnaContainer = document.getElementById('dna-tags');
    dnaContainer.innerHTML = '';
    const tags = [`#${style.toUpperCase()}`, `#${colors.split('&')[0].trim().toUpperCase()}`, `#${occasion.split('/')[0].trim().toUpperCase()}`];
    tags.forEach(t => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.innerText = t;
        dnaContainer.appendChild(span);
    });

    document.querySelector('.control-panel').style.display = 'none';
    document.getElementById('recommendations-result').style.display = 'block';
}

function resetRecommendations() {
    document.querySelector('.control-panel').style.display = 'block';
    document.getElementById('recommendations-result').style.display = 'none';
}

// --- GLOBAL UI HELPERS ---

function showLoader(text) {
    const loader = document.getElementById('loader');
    loader.querySelector('p').innerText = text;
    loader.style.display = 'flex';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}
