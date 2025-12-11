// Costanti di Gioco
const GAME_DURATION = 30;
const POINTS_PER_MOLE = 25;
const INITIAL_SPAWN_RATE = 1000; // Spawn iniziale: 1 brufolo ogni 1000ms
const MIN_SPAWN_RATE = 400;      // Spawn minimo: 1 brufolo ogni 400ms
const DIFFICULTY_INCREASE_INTERVAL = 5; // Aumenta difficoltà ogni 5 secondi

// ========================================
// EXCLUSION ZONES - Aree dove i brufoli NON possono apparire
// ========================================
// 📋 COPIA QUI I VALORI CHE HAI REGOLATO IN debugShowZones() (STEP 3)
// ========================================

const EXCLUSION_ZONES = [
    // Occhio sinistro - COPIA i valori da leftEye in debugShowZones()
    {
        left: 16,    // ← REGOLA posizione orizzontale
        top: 38,     // ← REGOLA posizione verticale
        width: 28,   // ← REGOLA larghezza
        height: 21   // ← REGOLA altezza
    },
    // Occhio destro - COPIA i valori da rightEye in debugShowZones()
    {
        left: 56,    // ← da rightEye.left
        top: 38,     // ← da rightEye.top
        width: 28,   // ← da rightEye.width
        height: 21   // ← da rightEye.height
    },
    // Bocca - COPIA i valori da mouth in debugShowZones()
    {
        left: 35,    // ← da mouth.left
        top: 67,     // ← da mouth.top
        width: 30,   // ← da mouth.width
        height: 15   // ← da mouth.height
    }
];

// ========================================
// DEBUG: VISUALIZZAZIONE ZONE
// ========================================
// Per abilitare la visualizzazione delle zone, chiama debugShowZones() dopo startGame()
// Per disabilitare, commenta la chiamata a debugShowZones() e ricarica la pagina
// ========================================

/**
 * Mostra visivamente le zone di spawn e le zone di esclusione.
 * QUESTA FUNZIONE È SOLO PER DEBUG - RIMUOVERE IN PRODUZIONE
 */
function debugShowZones() {
    // Rimuovi eventuali zone di debug esistenti
    document.querySelectorAll('.debug-zone').forEach(el => el.remove());

    const containerWidth = gameBoard.offsetWidth;
    const containerHeight = gameBoard.offsetHeight;

    // ========================================
    // 📐 STEP 1: REGOLA QUESTI VALORI QUI PER VEDERE L'AREA DI SPAWN
    // ========================================
    const safetyMarginX = 80;  // ← MODIFICA QUESTO per vedere l'area più stretta orizzontalmente
    const safetyMarginY = 90;  // ← MODIFICA QUESTO per vedere l'area più stretta verticalmente

    const offsetY = 30;  // ← MODIFICA QUESTO per spostare l'area in alto/basso (+ = giù, - = su)

    // ========================================
    // 📋 STEP 2: QUANDO L'AREA TI PIACE, COPIA I VALORI SOPRA
    //            ALLA FUNZIONE isInsideOval() (righe 222-224)
    //            Esempio: se qui hai safetyMarginX = 30,
    //            scrivi radiusX = (containerWidth / 2) - 30
    // ========================================

    // Calcola i raggi dell'ellisse ridotta
    const radiusX = (containerWidth / 2) - safetyMarginX;
    const radiusY = (containerHeight / 2) - safetyMarginY;
    const centerX = containerWidth / 2;
    const centerY = (containerHeight / 2) + offsetY;  // Centro spostato verticalmente

    // Calcola posizione e dimensione del rettangolo contenitore dell'ellisse
    const ovalLeft = centerX - radiusX;
    const ovalTop = centerY - radiusY;
    const ovalWidth = radiusX * 2;
    const ovalHeight = radiusY * 2;

    // Mostra l'area ellittica di spawn con i margini applicati
    const spawnArea = document.createElement('div');
    spawnArea.className = 'debug-zone';
    spawnArea.style.cssText = `
        position: absolute;
        left: ${ovalLeft}px;
        top: ${ovalTop}px;
        width: ${ovalWidth}px;
        height: ${ovalHeight}px;
        border: 3px solid lime;
        background-color: rgba(0, 255, 0, 0.1);
        pointer-events: none;
        z-index: 1000;
        border-radius: 50%;
    `;
    gameBoard.appendChild(spawnArea);

    // ========================================
    // 👁️ STEP 3: REGOLA LE ZONE DI ESCLUSIONE (OCCHI E BOCCA)
    // ========================================
    // Ogni zona ha 4 valori (tutti in PERCENTUALE 0-100):
    // - left: distanza dal bordo sinistro
    // - top: distanza dall'alto
    // - width: larghezza
    // - height: altezza

    // OCCHIO SINISTRO
    const leftEye = {
        left: 16,    // ← REGOLA posizione orizzontale
        top: 38,     // ← REGOLA posizione verticale
        width: 28,   // ← REGOLA larghezza
        height: 21   // ← REGOLA altezza
    };

    // OCCHIO DESTRO
    const rightEye = {
        left: 56,    // ← REGOLA posizione orizzontale
        top: 38,     // ← REGOLA posizione verticale
        width: 28,   // ← REGOLA larghezza
        height: 21   // ← REGOLA altezza
    };

    // BOCCA
    const mouth = {
        left: 35,    // ← REGOLA posizione orizzontale
        top: 67,     // ← REGOLA posizione verticale
        width: 30,   // ← REGOLA larghezza
        height: 15   // ← REGOLA altezza
    };

    // ========================================
    // 📋 STEP 4: COPIA I VALORI FINALI ALL'ARRAY EXCLUSION_ZONES (righe 25-47)
    //            Sostituisci i valori nell'array con quelli che hai regolato qui sopra
    // ========================================

    // Mostra le zone
    const zones = [
        { zone: leftEye, label: 'Occhio SX' },
        { zone: rightEye, label: 'Occhio DX' },
        { zone: mouth, label: 'Bocca' }
    ];

    zones.forEach(({ zone, label }) => {
        const exclusionDiv = document.createElement('div');
        exclusionDiv.className = 'debug-zone';

        const zoneLeft = (zone.left / 100) * containerWidth;
        const zoneTop = (zone.top / 100) * containerHeight;
        const zoneWidth = (zone.width / 100) * containerWidth;
        const zoneHeight = (zone.height / 100) * containerHeight;

        exclusionDiv.style.cssText = `
            position: absolute;
            left: ${zoneLeft}px;
            top: ${zoneTop}px;
            width: ${zoneWidth}px;
            height: ${zoneHeight}px;
            border: 2px solid red;
            background-color: rgba(255, 0, 0, 0.2);
            pointer-events: none;
            z-index: 1001;
            display: flex;
            align-items: center;
            justify-content: center;
            color: red;
            font-weight: bold;
            font-size: 12px;
        `;
        exclusionDiv.textContent = label;
        gameBoard.appendChild(exclusionDiv);
    });
}

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
 * Verifica se una posizione si trova all'interno dell'ovale della faccia.
 * Usa la formula matematica dell'ellisse per verificare i confini.
 * @param {number} x - Coordinata X in pixel.
 * @param {number} y - Coordinata Y in pixel.
 * @param {number} containerWidth - Larghezza del contenitore in pixel.
 * @param {number} containerHeight - Altezza del contenitore in pixel.
 * @param {number} moleSize - Dimensione del brufolo in pixel.
 * @returns {boolean} True se la posizione è dentro l'ovale.
 */
function isInsideOval(x, y, containerWidth, containerHeight, moleSize) {
    // Centro dell'ellisse
    const centerX = containerWidth / 2;

    // ⚙️ REGOLA QUESTI VALORI PER RIDURRE/AUMENTARE/SPOSTARE L'AREA DI SPAWN ⚙️
    const radiusX = (containerWidth / 2) - 80;   // ← AUMENTA questo numero per ridurre l'area orizzontalmente
    const radiusY = (containerHeight / 2) - 90;  // ← AUMENTA questo numero per ridurre l'area verticalmente
    const offsetY = 32;  // ← MODIFICA questo per spostare l'area verticalmente (+ = giù, - = su)
    // Esempio: cambiare 5 in 30 renderà l'area più piccola
    //          cambiare offsetY da 0 a 20 sposterà l'area di 20px verso il basso

    const centerY = (containerHeight / 2) + offsetY;  // Centro con offset verticale

    // Centro del brufolo (considerando la sua dimensione)
    const moleCenterX = x + (moleSize / 2);
    const moleCenterY = y + (moleSize / 2);

    // Formula dell'ellisse: ((x-h)²/a²) + ((y-k)²/b²) <= 1
    const normalizedX = (moleCenterX - centerX) / radiusX;
    const normalizedY = (moleCenterY - centerY) / radiusY;

    return (normalizedX * normalizedX + normalizedY * normalizedY) <= 1;
}

/**
 * Crea e posiziona casualmente un brufolo sulla faccia.
 */
function createMole() {
    // Crea l'elemento brufolo
    const mole = document.createElement('div');
    mole.classList.add('mole');

    const moleSize = 30; // Dimensione del brufolo
    const containerWidth = gameBoard.offsetWidth;
    const containerHeight = gameBoard.offsetHeight;

    // Trova una posizione valida che sia dentro l'ovale e non in una zona di esclusione
    let x, y;
    let attempts = 0;
    const maxAttempts = 100; // Aumentato per maggiore sicurezza

    do {
        // Genera posizione casuale in tutto il contenitore
        x = getRandomInt(0, containerWidth - moleSize);
        y = getRandomInt(0, containerHeight - moleSize);
        attempts++;

        // Verifica che sia dentro l'ovale E non in una zona di esclusione
        const insideOval = isInsideOval(x, y, containerWidth, containerHeight, moleSize);
        const inExclusionZone = isInExclusionZone(x, y, containerWidth, containerHeight, moleSize);

        if (insideOval && !inExclusionZone) {
            break; // Posizione valida trovata!
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

    // ========================================
    // DEBUG: Rimuovi o commenta questa riga per nascondere le zone
    // debugShowZones();
    // ========================================
}

// Event Listeners per i pulsanti
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
