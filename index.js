const searchForm = document.getElementById('search-form');
const wordInput = document.getElementById('word-input');
const resultDisplay = document.getElementById('result-display');
const errorMessage = document.getElementById('error-message');

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const word = wordInput.value.trim();
    
    if (word) {
        fetchWordData(word);
    }
});

async function fetchWordData(word) {
    // Reset UI
    errorMessage.classList.add('hidden');
    resultDisplay.classList.add('hidden');

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        
        if (!response.ok) throw new Error("Sorry, we couldn't find that word.");

        const data = await response.json();
        renderResult(data[0]);
    } catch (err) {
        showError(err.message);
    }
}

function renderResult(data) {
    const { word, phonetics, meanings } = data;
    const audioUrl = phonetics.find(p => p.audio)?.audio;

    resultDisplay.innerHTML = `
        <div class="result-header">
            <h2>${word.toUpperCase()}</h2>
            ${audioUrl ? `<button onclick="new Audio('${audioUrl}').play()">🔊 Listen</button>` : ''}
        </div>
        <p><strong>Phonetic:</strong> ${data.phonetic || 'N/A'}</p>
        <hr>
        ${meanings.map(m => `
            <div class="meaning">
                <p><em>${m.partOfSpeech}</em></p>
                <p>${m.definitions[0].definition}</p>
                ${m.definitions[0].example ? `<p style="color: gray;">Example: "${m.definitions[0].example}"</p>` : ''}
            </div>
        `).join('')}
    `;
    
    resultDisplay.classList.remove('hidden');
}

function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.remove('hidden');
}