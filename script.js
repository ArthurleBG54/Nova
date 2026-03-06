/**
 * NOVA AI - Logique Centrale
 * Remplace les valeurs ci-dessous par tes propres clés API
 */
const CONFIG = {
    GEMINI_API_KEY: "AIzaSyB3kBGa0qjLCInHfegHdHS1O7ELBTHqmbM", // Pour le "cerveau" de Nova
    ALPHA_VANTAGE_KEY: "E44QH5JYTB41W3ET", // Pour les prix du Trading
    RAPID_API_KEY: "..." // Pour les tendances TikTok/Insta
};

// --- INITIALISATION ---
let currentMode = "E-commerce";

// --- CHANGER DE MODE D'IA ---
function switchIA(type) {
    currentMode = type;
    document.getElementById('current-ia-title').innerText = 'Nova ' + type;
    document.getElementById('ia-type-text').innerText = type;

    // Mise à jour de l'interface active dans la sidebar
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // Message de bienvenue spécifique
    let welcome = `Mode **Nova ${type}** activé. `;
    let actions = "";

    if (type === 'E-commerce') {
        welcome += "Je suis prête à analyser le marché Shopify et TikTok.";
        actions = `<div class="action-group">
            <button class="action-btn" onclick="askNova('Trouve un produit gagnant 💎')">💎 Trouver un Winner</button>
            <button class="action-btn" onclick="askNova('Crée ma boutique Shopify 🏗️')">🏗️ Créer ma Boutique</button>
        </div>`;
    } else if (type === 'Trading') {
        welcome += "Analyse des marchés financiers en temps réel prête.";
        actions = `<div class="action-group">
            <button class="action-btn" onclick="askNova('Analyse le BTC/USD 📈')">📈 Analyse BTC/USD</button>
            <button class="action-btn" onclick="askNova('Tendances Bourse 📊')">📊 Tendances Bourse</button>
        </div>`;
    }

    const windowChat = document.getElementById('chat-window');
    windowChat.innerHTML = `<div class="message ai-msg">${welcome}${actions}</div>`;
}

// --- ENVOI DE MESSAGE ---
async function askNova(query) {
    const input = document.getElementById('user-input');
    const text = query || input.value;
    if (!text.trim()) return;

    displayMessage(text, 'user-msg');
    input.value = "";

    // Afficher un loader
    const loadingId = "load-" + Date.now();
    displayMessage("Nova analyse les données...", 'ai-msg', loadingId);

    try {
        let response = "";
        
        // LOGIQUE SELON LE MODE
        if (currentMode === "Trading" && text.includes("BTC")) {
            response = await fetchTradingData("BTC");
        } else if (currentMode === "E-commerce" && text.includes("Winner")) {
            response = await callGeminiAI("Analyse les tendances actuelles et donne moi un produit gagnant dropshipping avec niche et argumentaire.");
        } else {
            // Appel par défaut au cerveau de l'IA (Gemini)
            response = await callGeminiAI(`En tant que Nova ${currentMode}, réponds à : ${text}`);
        }

        document.getElementById(loadingId).innerHTML = response;
    } catch (error) {
        document.getElementById(loadingId).innerHTML = "Erreur de connexion aux serveurs Nova. Vérifie tes clés API.";
    }
}

// --- AFFICHAGE ---
function displayMessage(text, className, id = null) {
    const windowChat = document.getElementById('chat-window');
    const div = document.createElement('div');
    div.className = `message ${className}`;
    if (id) div.id = id;
    div.innerHTML = text;
    windowChat.appendChild(div);
    windowChat.scrollTop = windowChat.scrollHeight;
}

// --- APPEL API GEMINI (LE CERVEAU) ---
async function callGeminiAI(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// --- APPEL API TRADING ---
async function fetchTradingData(symbol) {
    // Exemple avec Alpha Vantage pour le prix en temps réel
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${CONFIG.ALPHA_VANTAGE_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const price = data["Global Quote"]["05. price"];
    return `Le prix actuel de **${symbol}** est de **$${parseFloat(price).toFixed(2)}**. L'analyse technique suggère une zone de support imminente.`;
}

// Lier la touche "Entrée"
document.getElementById('user-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') askNova();
});
