// Costanti di Gioco
const GAME_DURATION = 30;
const POINTS_PER_MOLE = 25;
const INITIAL_SPAWN_RATE = 1000; // Spawn iniziale: 1 brufolo ogni 1000ms
const MIN_SPAWN_RATE = 400;      // Spawn minimo: 1 brufolo ogni 400ms
const DIFFICULTY_INCREASE_INTERVAL = 5; // Aumenta difficoltà ogni 5 secondi

// ========================================
// EXCLUSION ZONES - Aree dove i brufoli NON possono apparire
// ========================================
// ISTRUZIONI PER REGOLARE LE COORDINATE:
// - Ogni zona è definita da: left, top, width, height
// - Tutti i valori sono PERCENTUALI (0-100) della dimensione del contenitore
// - left: distanza dal bordo sinistro (0 = estrema sinistra, 100 = estrema destra)
// - top: distanza dal bordo superiore (0 = in alto, 100 = in basso)
// - width: larghezza della zona (in percentuale della larghezza totale)
// - height: altezza della zona (in percentuale dell'altezza totale)
//
// Per regolare, osserva dove appaiono i brufoli e modifica questi valori:
// - Aumenta left per spostare la zona verso destra
// - Aumenta top per spostare la zona verso il basso
// - Aumenta width/height per ingrandire la zona
// ========================================

const EXCLUSION_ZONES = [
    // Occhio sinistro
    {
        left: 15,    // Regola questo valore per spostare orizzontalmente
        top: 25,     // Regola questo valore per spostare verticalmente
        width: 27,   // Regola questo valore per la larghezza
        height: 18   // Regola questo valore per l'altezza
    },
    // Occhio destro
    {
        left: 55,    // Regola questo valore per spostare orizzontalmente
        top: 25,     // Regola questo valore per spostare verticalmente
        width: 28,   // Regola questo valore per la larghezza
        height: 18   // Regola questo valore per l'altezza
    },
    // Bocca
    {
        left: 35,    // Regola questo valore per spostare orizzontalmente
        top: 65,     // Regola questo valore per spostare verticalmente
        width: 30,   // Regola questo valore per la larghezza
        height: 15   // Regola questo valore per l'altezza
    }
];

// Riferimenti agli Elementi DOM
const scoreDisplay = document.getElementById('score');
const pimplesCountDisplay = document.getElementById('pimples-count');
const timerDisplay = document.getElementById('timer');
const gameBoard = document.getElementById('game-board');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const gameOverMessage = document.getElementById('game-over-message');
const finalScoreDisplay = document.getElementById('final-score');

// Variabili di Stato del Gioco
let score = 0;
let pimplesSquashed = 0;
let timeRemaining = GAME_DURATION;
let gameInterval; // Per il timer principale
let moleInterval; // Per l'apparizione dei brufoli
let currentSpawnRate = INITIAL_SPAWN_RATE; // Velocità di spawn corrente

/**
 * Funzione per generare un numero casuale all'interno di un intervallo.
 * @param {number} min - Il valore minimo (incluso).
 * @param {number} max - Il valore massimo (incluso).
 * @returns {number} Un intero casuale.
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Verifica se una posizione si trova in una zona di esclusione.
 * @param {number} x - Coordinata X in pixel.
 * @param {number} y - Coordinata Y in pixel.
 * @param {number} containerWidth - Larghezza del contenitore in pixel.
 * @param {number} containerHeight - Altezza del contenitore in pixel.
 * @param {number} moleSize - Dimensione del brufolo in pixel.
 * @returns {boolean} True se la posizione è in una zona vietata.
 */
function isInExclusionZone(x, y, containerWidth, containerHeight, moleSize) {
    // Converti le coordinate del brufolo in percentuali
    const moleLeftPercent = (x / containerWidth) * 100;
    const moleTopPercent = (y / containerHeight) * 100;
    const moleSizeWidthPercent = (moleSize / containerWidth) * 100;
    const moleSizeHeightPercent = (moleSize / containerHeight) * 100;

    // Controlla se il brufolo si sovrappone a qualsiasi zona di esclusione
    for (const zone of EXCLUSION_ZONES) {
        // Verifica sovrapposizione rettangolare
        const overlapX = moleLeftPercent < (zone.left + zone.width) &&
            (moleLeftPercent + moleSizeWidthPercent) > zone.left;
        const overlapY = moleTopPercent < (zone.top + zone.height) &&
            (moleTopPercent + moleSizeHeightPercent) > zone.top;

        if (overlapX && overlapY) {
            return true; // Sovrapposizione trovata
        }
    }

    return false; // Nessuna sovrapposizione
}

/**
 * Crea e posiziona casualmente un brufolo sulla faccia.
 */
function createMole() {
    // Crea l'elemento brufolo
    const mole = document.createElement('div');
    mole.classList.add('mole');

    // Margini per tenere i brufoli all'interno della faccia ovale
    // La faccia ovale non riempie tutto il div 300x400
    const marginLeft = 50;   // Margine sinistro
    const marginRight = 50;  // Margine destro
    const marginTop = 40;    // Margine superiore
    const marginBottom = 40; // Margine inferiore
    const moleSize = 30;     // Dimensione del brufolo

    // Calcola l'area disponibile per i brufoli
    const availableWidth = gameBoard.offsetWidth - marginLeft - marginRight - moleSize;
    const availableHeight = gameBoard.offsetHeight - marginTop - marginBottom - moleSize;

    // Trova una posizione valida che non sia in una zona di esclusione
    let x, y;
    let attempts = 0;
    const maxAttempts = 50; // Previeni loop infinito

    do {
        // Genera posizione casuale
        x = getRandomInt(marginLeft, marginLeft + availableWidth);
        y = getRandomInt(marginTop, marginTop + availableHeight);
        attempts++;

        // Esci se trovata posizione valida o raggiunti i tentativi massimi
        if (!isInExclusionZone(x, y, gameBoard.offsetWidth, gameBoard.offsetHeight, moleSize)) {
            break;
        }
    } while (attempts < maxAttempts);

    mole.style.left = `${x}px`;
    mole.style.top = `${y}px`;

    // Aggiungi l'evento click per desktop
    mole.addEventListener('click', whackMole);

    // Aggiungi l'evento touch per mobile (previene il double-firing)
    mole.addEventListener('touchstart', (event) => {
        event.preventDefault(); // Previene il click successivo
        whackMole(event);
    }, { passive: false });

    // Aggiungi alla plancia di gioco
    gameBoard.appendChild(mole);

    // Rimuovi il brufolo dopo 1.5 secondi se non schiacciato
    setTimeout(() => {
        if (gameBoard.contains(mole)) {
            gameBoard.removeChild(mole);
        }
    }, 1500);
}

/**
 * Gestisce l'evento di schiacciamento del brufolo.
 * @param {Event} event - L'evento di click.
 */
function whackMole(event) {
    // Aumenta il punteggio
    score += POINTS_PER_MOLE;
    scoreDisplay.textContent = score;

    // Aumenta il contatore dei brufoli schiacciati
    pimplesSquashed++;
    pimplesCountDisplay.textContent = pimplesSquashed;

    // Rimuovi il brufolo cliccato
    const mole = event.target;
    gameBoard.removeChild(mole);
}

/**
 * Gestisce la logica di fine gioco.
 */
function endGame() {
    // 1. Ferma gli intervalli
    clearInterval(gameInterval);
    clearInterval(moleInterval);

    // 2. Rimuovi eventuali brufoli rimanenti
    gameBoard.innerHTML = '';

    // 3. Mostra il messaggio di Game Over
    finalScoreDisplay.textContent = score;
    gameOverMessage.classList.remove('hidden');

    // 4. Nascondi il pulsante di avvio se visibile, ma mostra il pulsante di riavvio
    startButton.classList.add('hidden');
    restartButton.classList.remove('hidden');

    // Opzionale: Rimuovi gli handler per evitare doppi click se il gioco non è resettato correttamente
    moleInterval = null;
    gameInterval = null;
}

/**
 * Avvia o riavvia il gioco.
 */
function startGame() {
    // 1. Resetta le variabili di stato
    score = 0;
    pimplesSquashed = 0;
    timeRemaining = GAME_DURATION;
    scoreDisplay.textContent = score;
    pimplesCountDisplay.textContent = pimplesSquashed;
    timerDisplay.textContent = timeRemaining;
    gameBoard.innerHTML = ''; // Pulisci la plancia

    // 2. Nascondi i messaggi e mostra la plancia
    gameOverMessage.classList.add('hidden');
    startButton.classList.add('hidden');

    // 3. Resetta la velocità di spawn
    currentSpawnRate = INITIAL_SPAWN_RATE;

    // 4. Funzione per aggiornare la velocità di spawn
    function updateSpawnRate() {
        clearInterval(moleInterval);
        moleInterval = setInterval(createMole, currentSpawnRate);
    }

    // 5. Avvia il timer iniziale per la creazione dei brufoli
    moleInterval = setInterval(createMole, currentSpawnRate);

    // 6. Avvia il timer principale del gioco
    gameInterval = setInterval(() => {
        timeRemaining--;
        timerDisplay.textContent = timeRemaining;

        // Aumenta la difficoltà ogni 5 secondi
        if (timeRemaining % DIFFICULTY_INCREASE_INTERVAL === 0 && currentSpawnRate > MIN_SPAWN_RATE) {
            currentSpawnRate = Math.max(MIN_SPAWN_RATE, currentSpawnRate - 50);
            updateSpawnRate();
        }

        if (timeRemaining <= 0) {
            endGame();
        }
    }, 1000); // Aggiorna ogni secondo
}


// Event Listeners per i pulsanti
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
