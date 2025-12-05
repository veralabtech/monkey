// Costanti di Gioco
const GAME_DURATION = 30;
const POINTS_PER_MOLE = 25;
const INITIAL_SPAWN_RATE = 1000; // Spawn iniziale: 1 brufolo ogni 1000ms
const MIN_SPAWN_RATE = 400;      // Spawn minimo: 1 brufolo ogni 400ms
const DIFFICULTY_INCREASE_INTERVAL = 5; // Aumenta difficoltà ogni 5 secondi

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

    // Assegna una posizione casuale all'interno della faccia ovale
    const x = getRandomInt(marginLeft, marginLeft + availableWidth);
    const y = getRandomInt(marginTop, marginTop + availableHeight);

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
