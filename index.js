// 1. SELECT DOM ELEMENTS
const searchForm = document.getElementById('search-form');
const wordInput = document.getElementById('word-input');
const resultDisplay = document.getElementById('result-display');
const errorMessage = document.getElementById('error-message');
const favoritesList = document.getElementById('favorites-list');
const clearBtn = document.getElementById('clear-favorites');

// 2. STATE MANAGEMENT (Favorites logic)
// We load existing favorites from localStorage immediately
let favorites = JSON.parse(localStorage.getItem('wordly_favorites')) || [];

// 3. API & CORE LOGIC
async function fetchWordData(word) {
    errorMessage.classList.add('hidden');
    resultDisplay.classList.add('hidden');

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (!response.ok) throw new Error("Word not found. Try another!");

        const data = await response.json();
        renderResult(data[0]);
    } catch (err) {
        showError(err.message);
    }
}

// 4. RENDERING FUNCTIONS
function renderResult(data) {
    const { word, phonetics, meanings } = data;
    const audioUrl = phonetics.find(p => p.audio)?.audio;

    // We build the HTML and include the "Save" button here
    resultDisplay.innerHTML = `
        <div class="result-header">
            <h2>${word.toUpperCase()}</h2>
            <div class="actions">
                ${audioUrl ? `<button onclick="new Audio('${audioUrl}').play()">🔊 Listen</button>` : ''}
                <button id="save-btn" class="save-btn">⭐ Save Favorite</button>
            </div>
        </div>
        <p><strong>Phonetic:</strong> ${data.phonetic || 'N/A'}</p>
        <hr>
        ${meanings.map(m => `
            <div class="meaning">
                <p><em>${m.partOfSpeech}</em></p>
                <p>${m.definitions[0].definition}</p>
            </div>
        `).join('')}
    `;
    
    resultDisplay.classList.remove('hidden');

    // Attach event listener to the NEWLY created save button
    document.getElementById('save-btn').addEventListener('click', () => saveWord(word));
}

function renderFavorites() {
    favoritesList.innerHTML = favorites.length === 0 
        ? '<li>No favorites saved yet.</li>' 
        : favorites.map(word => `
            <li>
                <span>${word}</span>
                <button class="remove-btn" onclick="removeWord('${word}')">Remove</button>
            </li>
        `).join('');
}

// 5. FAVORITES ACTIONS
function saveWord(word) {
    if (!favorites.includes(word.toLowerCase())) {
        favorites.push(word.toLowerCase());
        updateStorage();
    }
}

function removeWord(word) {
    favorites = favorites.filter(f => f !== word);
    updateStorage();
}

function updateStorage() {
    localStorage.setItem('wordly_favorites', JSON.stringify(favorites));
    renderFavorites();
}

function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.remove('hidden');
}

// 6. EVENT LISTENERS
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const word = wordInput.value.trim();
    if (word) fetchWordData(word);
});

clearBtn.addEventListener('click', () => {
    favorites = [];
    updateStorage();
});

// 7. INITIALIZE
renderFavorites();