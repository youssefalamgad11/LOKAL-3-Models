/** 
 * LOKAL AI — Virtual Try-On logic with Gemini API integration
 */

const GARMENTS = [
  { id: 1, icon: '🧥', name: 'Oversized Utility Jacket', price: '$149', desc: 'Heavy cotton, dropped shoulder' },
  { id: 2, icon: '👕', name: 'Graphic Oversized Tee', price: '$45', desc: 'Premium ringspun cotton' },
  { id: 3, icon: '🧣', name: 'Silk-Cashmere Scarf', price: '$295', desc: 'Hand-hemmed, 180cm' },
  { id: 4, icon: '🧤', name: 'Color-Block Track Jacket', price: '$165', desc: 'Water-resistant shell' },
  { id: 5, icon: '👔', name: 'Clean-Cut Blazer', price: '$220', desc: 'Unlined, relaxed fit' },
  { id: 6, icon: '🩱', name: 'Logo-Print Crop Hoodie', price: '$75', desc: 'Heavyweight French terry' }
];

let selectedGarmentId = 1;
let uploadedImageHash = null; // Base64 representation

// Initialize Garment List
function initGarments() {
    const container = document.getElementById('garment-list');
    if (!container) return;
    container.innerHTML = '';
    
    GARMENTS.forEach(g => {
        const card = document.createElement('div');
        card.className = `garment-card ${g.id === selectedGarmentId ? 'active' : ''}`;
        card.onclick = () => selectGarment(g.id);
        card.innerHTML = `
            <span style="font-size: 1.5rem;">${g.icon}</span>
            <h4>${g.name}</h4>
            <p style="font-size: 0.7rem; color: var(--muted);">${g.desc}</p>
            <span class="price">${g.price}</span>
        `;
        container.appendChild(card);
    });
}

function selectGarment(id) {
    selectedGarmentId = id;
    initGarments();
}

// Image Upload Handling
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const imagePreview = document.getElementById('image-preview');
const uploadPlaceholder = document.getElementById('upload-placeholder');

if (dropZone) {
    dropZone.onclick = () => fileInput.click();
    
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        handleFile(file);
    };

    dropZone.ondragover = (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    };

    dropZone.ondragleave = () => {
        dropZone.classList.remove('drag-over');
    };

    dropZone.ondrop = (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        handleFile(e.dataTransfer.files[0]);
    };
}

function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const base64 = e.target.result;
        uploadedImageHash = base64.split(',')[1]; // Just the data part
        imagePreview.src = base64;
        imagePreview.style.display = 'block';
        uploadPlaceholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// AI Analysis Logic
async function runTryOn() {
    const apiKey = document.getElementById('api-key-input').value.trim();
    const garment = GARMENTS.find(g => g.id === selectedGarmentId);
    const fit = getSelected('fit');
    const occasion = getSelected('tryon-occasion');

    if (!uploadedImageHash) {
        alert("Please upload a photo first.");
        return;
    }

    showLoader('CONSULTING AI STYLIST...');

    if (!apiKey) {
        // Fallback to Mock Mode
        await new Promise(resolve => setTimeout(resolve, 2000));
        displayMockResult(garment, fit, occasion);
        hideLoader();
        return;
    }

    try {
        const result = await callGeminiAPI(apiKey, garment, fit, occasion, uploadedImageHash);
        displayResult(result, garment);
    } catch (error) {
        console.error("API Error:", error);
        alert("AI call failed. Ensure your API key is valid and you have internet access. Falling back to demo mode.");
        displayMockResult(garment, fit, occasion);
    } finally {
        hideLoader();
    }
}

async function callGeminiAPI(key, garment, fit, occasion, base64Image) {
    const prompt = `You are a professional fashion stylist AI. Analyze this person's photo and provide a detailed style analysis for wearing the ${garment.name} (${garment.desc}) in a ${fit} fit for a ${occasion} occasion. Respond ONLY in this exact JSON format:
    {
      "fit_analysis": "string (2-3 sentences about fit for their body type)",
      "styling_notes": "string (2-3 sentences of personalized styling advice)",
      "style_score": number (60-98),
      "versatility_score": number (60-98),
      "trend_score": number (60-98),
      "complete_the_look": [
        {"name": "string", "price": "string"},
        {"name": "string", "price": "string"},
        {"name": "string", "price": "string"}
      ],
      "styling_tips": ["string", "string", "string", "string"]
    }`;

    // Using Gemini 3 Flash Preview as it's the latest and multimodal
    const MODEL = "gemini-3-flash-preview"; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [
                    { inline_data: { mime_type: "image/jpeg", data: base64Image } },
                    { text: prompt }
                ]
            }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        })
    });

    if (!response.ok) throw new Error("API Request Failed");

    const data = await response.json();
    const textResult = data.candidates[0].content.parts[0].text;
    return JSON.parse(textResult);
}

function displayResult(result, garment) {
    document.getElementById('res-item-name').innerText = garment.name.toUpperCase();
    document.getElementById('res-fit').innerText = result.fit_analysis;
    document.getElementById('res-styling').innerText = result.styling_notes;

    // Scores
    animateScore('match', result.style_score);
    animateScore('vers', result.versatility_score);
    animateScore('trend', result.trend_score);

    // Complete the Look
    const compEl = document.getElementById('res-complete');
    compEl.innerHTML = '';
    result.complete_the_look.forEach(item => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.innerText = `${item.name} (${item.price})`;
        compEl.appendChild(span);
    });

    // Tips
    const tipsEl = document.getElementById('res-tips');
    tipsEl.innerHTML = '';
    result.styling_tips.forEach(tip => {
        const li = document.createElement('li');
        li.innerText = tip;
        tipsEl.appendChild(li);
    });

    document.querySelector('.control-panel').style.display = 'none';
    document.getElementById('tryon-result').style.display = 'block';
}

function animateScore(id, val) {
    const bar = document.getElementById(`score-${id}-bar`);
    const valText = document.getElementById(`score-${id}-val`);
    
    let current = 0;
    valText.innerText = '0%';
    bar.style.width = '0%';
    
    setTimeout(() => {
        bar.style.width = val + '%';
        const interval = setInterval(() => {
            if (current >= val) {
                clearInterval(interval);
            } else {
                current++;
                valText.innerText = current + '%';
            }
        }, 15);
    }, 300);
}

function displayMockResult(garment, fit, occasion) {
    const mock = {
        fit_analysis: `The ${garment.name} drapes exceptionally well on your frame. The ${fit} selection provides a clean vertical line that elongates your silhouette while maintaining the desired aesthetic.`,
        styling_notes: `Since you're aiming for a ${occasion} vibe, try pairing this with high-contrast footwear to break the monochromatic flow. The ${garment.desc.toLowerCase()} adds a layer of sophistication.`,
        style_score: 88,
        versatility_score: 92,
        trend_score: 95,
        complete_the_look: [
            {name: "Chunky Ridge Boots", price: "$220"},
            {name: "Silver Link Chain", price: "$65"},
            {name: "Tapered Cargo Pants", price: "$110"}
        ],
        styling_tips: [
            "Roll the sleeves slightly to show the forearm for a more casual look.",
            "Avoid busy patterns underneath to keep the focus on the jacket's silhouette.",
            "Use a cross-body bag to add tactical visual interest.",
            "Opt for neutral socks if wearing cropped trousers."
        ]
    };
    displayResult(mock, garment);
}

function resetTryOn() {
    document.querySelector('.control-panel').style.display = 'block';
    document.getElementById('tryon-result').style.display = 'none';
}

// Global UI
function showLoader(text) {
    const loader = document.getElementById('loader');
    document.getElementById('loader-text').innerText = text;
    loader.style.display = 'flex';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

function getSelected(groupId) {
    const group = document.querySelector(`.toggle-group[data-group="${groupId}"]`);
    if (!group) return null;
    const active = group.querySelector('.toggle-btn.active');
    return active ? active.innerText : null;
}

// Start
initGarments();
