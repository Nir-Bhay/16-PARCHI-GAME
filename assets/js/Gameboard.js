// Constants
const TOTAL_TYPES = 4;
const CARDS_PER_TYPE = 4;
const TOTAL_PLAYERS = 4;
const FRUIT_NAMES = ['आम', 'केला', 'सेब', 'अंगूर'];

// New player names
const PLAYER_NAMES = ['You', 'Rupali', 'Rohit', 'Dipu'];


// Array of emojis to use for computer players' cards
const EMOJIS = ['🍎', '🍌', '🍇', '🍉', '🍒', '🍓', '🍑', '🍍', '🥭', '🍊', '🍋', '🍈', '🍏', '🍐', '🍅', '🍆'];




// Player hands and game variables
let playerHands = Array.from({ length: TOTAL_PLAYERS }, () => []);
let currentPlayerIndex = -1; // Track turns (-1 = not started, 0 = player, 1-3 = AIs)
let winCounts = Array(TOTAL_PLAYERS).fill(0);

// Initialize deck with four types of parchis, each repeated four times
let deck = Array.from({ length: TOTAL_TYPES * CARDS_PER_TYPE }, (_, i) => Math.floor(i / CARDS_PER_TYPE));

// Shuffle function
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Distribute cards to players
function distributeCards() {
    shuffleDeck(deck);
    playerHands = Array.from({ length: TOTAL_PLAYERS }, () => []);

    // Ensure each player gets exactly 4 cards
    for (let i = 0; i < TOTAL_PLAYERS; i++) {
        for (let j = 0; j < CARDS_PER_TYPE; j++) {
            playerHands[i].push(deck[i * CARDS_PER_TYPE + j]);
        }
    }
}

// Function to display player's hand
function renderPlayerHand(playerIndex) {
    const playerHandDiv = document.getElementById(`player-${playerIndex + 1}-cards`);
    playerHandDiv.innerHTML = "";

    // Check if the player is the human player (index 0)
    if (playerIndex === 0) {
        // Display card names for the human player
        playerHands[playerIndex].forEach((card) => {
            const cardDiv = document.createElement("div");
            cardDiv.className = "card";
            cardDiv.textContent = FRUIT_NAMES[card];
            playerHandDiv.appendChild(cardDiv);
        });
    } else {
        
        // Hide card names for computer players and use random emojis
        playerHands[playerIndex].forEach(() => {
            const cardDiv = document.createElement("div");
            cardDiv.className = "card";
            cardDiv.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]; // Random emoji
            playerHandDiv.appendChild(cardDiv);
        });
    }

    // Highlight the current player's cards
    if (currentPlayerIndex === playerIndex) {
        playerHandDiv.classList.remove('highlight');
        
    } else {
        playerHandDiv.classList.add('highlight');
    }
}

// Function to display all players' hands
function renderAllHands() {
    for (let i = 0; i < TOTAL_PLAYERS; i++) {
        renderPlayerHand(i);
    }
}

// Message display
function displayMessage(message, type = '') {
    const messageArea = document.getElementById("message-area");
    messageArea.textContent = message;
    messageArea.className = type;
}

// Check win condition for any player
function checkWinCondition() {
    for (let i = 0; i < TOTAL_PLAYERS; i++) {
        const counts = Array(TOTAL_TYPES).fill(0);
        playerHands[i].forEach((parchi) => counts[parchi]++);

        if (counts.some((count) => count === CARDS_PER_TYPE)) {
            const winner = PLAYER_NAMES[i];

            const nextPlayerIndex = (i + 1) % TOTAL_PLAYERS;
            if (playerHands[i].length > CARDS_PER_TYPE) {
                const extraCard = playerHands[i].pop();
                playerHands[nextPlayerIndex].push(extraCard);
                displayMessage(`${winner} transferred a card to ${PLAYER_NAMES[nextPlayerIndex]}.`);
            }

            winCounts[i]++;
            updateWinnerDisplay();
            updatePointsDisplay();
            renderAllHands();

            displayMessage(`${winner} won the game!`, winner === "You" ? 'win' : 'lose');
            currentPlayerIndex = -1;
            setTimeout(showStartButton, 2000);
            return true;
        }
    }
    return false;
}

// Update winner display
function updateWinnerDisplay() {
    const winnerDisplay = document.getElementById('winner-display');
    winnerDisplay.innerText = `Wins: ${winCounts.join(', ')}`; // Update the display with win counts
    winnerDisplay.style.display = 'block';
}

function updatePointsDisplay() {
    const pointsDisplay = document.getElementById('points-display');
    pointsDisplay.innerText = `Points: ${winCounts.join(', ')}`; // Update the display with points
}

// Handle player's action
function playerPassParchi(type) {
    if (currentPlayerIndex !== 0) return;

    const parchiIndex = playerHands[0].indexOf(FRUIT_NAMES.indexOf(type));
    if (parchiIndex === -1) {
        displayMessage(`You don't have a ${type} card!`);
        return;
    }

    const parchi = playerHands[0].splice(parchiIndex, 1)[0];
    playerHands[1].push(parchi);

    renderPlayerHand(0);
    renderPlayerHand(1);

    displayMessage(`Passing ${FRUIT_NAMES[parchi]} to Rupali...`);

    if (checkWinCondition()) return;
    currentPlayerIndex = 1;
    setTimeout(computerTurn, 1000);
}

// Handle AI turns
let playerActions = Array.from({ length: TOTAL_PLAYERS }, () => ({
    passedTypes: Array(TOTAL_TYPES).fill(0)
}));

// Update player actions
function updatePlayerActions(playerIndex, parchiType) {
    playerActions[playerIndex].passedTypes[parchiType]++;
}

// Analyze player behavior and adjust AI strategy
function analyzePlayerBehavior() {
    playerActions.forEach((actions, index) => {
        const frequentType = actions.passedTypes.findIndex(count => count > 2); // Arbitrary threshold
        if (frequentType !== -1) {
            console.log(`Player ${index} frequently passes type ${frequentType}`);
        }
    });
}

// Modify computerTurn to use adaptive strategy
function computerTurn() {
    if (currentPlayerIndex === -1) return; // Game over

    const aiIndex = currentPlayerIndex;
    const nextPlayerIndex = (currentPlayerIndex + 1) % TOTAL_PLAYERS;

    const parchiCounts = Array(TOTAL_TYPES).fill(0);
    playerHands[aiIndex].forEach((parchi) => parchiCounts[parchi]++);

    const maxCount = Math.max(...parchiCounts);
    const parchiToFocusOn = parchiCounts.findIndex(count => count === maxCount);

    let parchiToPassIndex;
    const mixedTypes = playerHands[aiIndex].filter(parchi => parchi !== parchiToFocusOn);

    if (mixedTypes.length > 0) {
        parchiToPassIndex = playerHands[aiIndex].indexOf(mixedTypes[Math.floor(Math.random() * mixedTypes.length)]);
    } else {
        parchiToPassIndex = playerHands[aiIndex].findIndex((parchi) => parchiCounts[parchi] === maxCount);
    }

    const parchiToPass = playerHands[aiIndex].splice(parchiToPassIndex, 1)[0];
    playerHands[nextPlayerIndex].push(parchiToPass);

    updatePlayerActions(aiIndex, parchiToPass);

    renderPlayerHand(aiIndex);
    renderPlayerHand(nextPlayerIndex);

    displayMessage(`Computer ${PLAYER_NAMES[aiIndex]} passed a ${FRUIT_NAMES[parchiToPass]} to ${PLAYER_NAMES[nextPlayerIndex]}...`);

    if (checkWinCondition()) return;

    currentPlayerIndex = nextPlayerIndex;
    if (currentPlayerIndex === 0) {
        displayMessage("Your turn! Select a parchi type to pass.");
    } else {
        setTimeout(computerTurn, 3000);
    }
}

// Initial setup
function startGame() {
    playerHands = Array.from({ length: TOTAL_PLAYERS }, () => []);
    winCounts = Array(TOTAL_PLAYERS).fill(0);
    currentPlayerIndex = -1;
    updateWinnerDisplay();
    updatePointsDisplay();
    displayMessage("Click 'Shuffle' to shuffle and distribute cards.");
    document.getElementById("shuffle-button").style.display = 'block';
    document.getElementById("start-game-button").style.display = 'none';
}

// Shuffle and distribute cards, then start the game
function shuffleAndStartGame() {
    distributeCards();
    renderAllHands();
    currentPlayerIndex = Math.floor(Math.random() * TOTAL_PLAYERS);
    document.getElementById("shuffle-button").style.display = 'none';
    if (currentPlayerIndex === 0) {
        displayMessage("Your turn! Select a parchi type to pass.");
    } else {
        displayMessage(`${PLAYER_NAMES[currentPlayerIndex]} starts the game.`);
        setTimeout(computerTurn, 1000);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
    const startGameButton = document.getElementById('start-game-button');
    const shuffleButton = document.getElementById('shuffle-button');
    const messageArea = document.getElementById('message-area');

    startGameButton.addEventListener('click', function () {
        startGame();
        this.style.display = 'none';
        shuffleButton.style.display = 'inline-block';
        messageArea.textContent = "Click 'Shuffle Cards' to begin the game.";
    });

    shuffleButton.addEventListener('click', function () {
        shuffleAndStartGame();
        this.style.display = 'none';
    });
});

/**
 * Creates and displays a "Start New Match" button on the page.
 * When clicked, the button triggers the start of a new match.
 */
function showStartButton() {
    const startButton = document.getElementById('start-button');
    startButton.innerText = 'Start New Match';
    if (startButton) {
        startButton.onclick = startNewMatch;
    }
}

function startNewMatch() {
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.remove();
    }
    startGame();
}

function resetGameUI() {
    for (let i = 0; i < TOTAL_PLAYERS; i++) {
        const playerHandElement = document.getElementById(`player-hand-${i}`);
        if (playerHandElement) {
            playerHandElement.innerHTML = '';
        }
    }

    for (let i = 0; i < TOTAL_PLAYERS; i++) {
        const scoreElement = document.getElementById(`player-score-${i}`);
        if (scoreElement) {
            scoreElement.innerText = '0';
        }
    }

    const messageElement = document.getElementById('game-message');
    if (messageElement) {
        messageElement.innerText = '';
    }

    const gameBoardElement = document.getElementById('game-board');
    if (gameBoardElement) {
        gameBoardElement.innerHTML = '';
    }

    const highlightedElements = document.querySelectorAll('.highlight');
    highlightedElements.forEach(element => {
        element.classList.remove('highlight');
    });

    const turnIndicator = document.getElementById('turn-indicator');
    if (turnIndicator) {
        turnIndicator.innerText = 'Your turn!';
    }
}

function initializePlayerHand() {
    return [];
}

// Start the game on load
updateWinnerDisplay();
