// Constants
const TOTAL_TYPES = 4;
const CARDS_PER_TYPE = 4;
const TOTAL_PLAYERS = 4;

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

// Distribute cards to players// Distribute cards to players
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
    playerHands[playerIndex].forEach((card) => {
        const cardDiv = document.createElement("div");
        cardDiv.className = "card";
        cardDiv.textContent = `Type ${card + 1}`;
        playerHandDiv.appendChild(cardDiv);
    });
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
            const winner = i === 0 ? "You" : `Computer ${i}`;
            displayMessage(`${winner} won the game!`, winner === "You" ? 'win' : 'lose');
            winCounts[i]++;
            updateWinnerDisplay();
            updatePointsDisplay();
            renderAllHands(); // Show all players' hands
            currentPlayerIndex = -1; // End game
            setTimeout(startGame, 3000); // Automatically start a new game after 3 seconds
            return true;
        }
    }
    return false;
}

// Update winner display
function updateWinnerDisplay() {
    const winnerDisplay = document.getElementById("winner-display");
    winnerDisplay.innerHTML = `Wins: <br>Player: ${winCounts[0]}<br>Computer 1: ${winCounts[1]}<br>Computer 2: ${winCounts[2]}<br>Computer 3: ${winCounts[3]}`;
    winnerDisplay.style.display = 'block';
}

// Update points display
function updatePointsDisplay() {
    const playerPoints = document.getElementById("player-points");
    playerPoints.textContent = winCounts[0];
}

// Handle player's action
// Handle player's action
function playerPassParchi(type) {
    if (currentPlayerIndex !== 0) return; // Ignore if not player's turn

    const parchiIndex = playerHands[0].indexOf(type);
    if (parchiIndex === -1) {
        displayMessage("You don't have this parchi type!");
        return;
    }

    const parchi = playerHands[0].splice(parchiIndex, 1)[0]; // Remove the selected parchi
    playerHands[1].push(parchi); // Pass to next player (Computer 1)

    renderPlayerHand(0);
    renderPlayerHand(1);

    displayMessage("Passing parchi to Computer 1...");

    if (checkWinCondition()) return;
    currentPlayerIndex = 1; // Move to next player's turn
    setTimeout(computerTurn, 1000);
}

// Handle AI turns
// Track player actions
let playerActions = Array.from({ length: TOTAL_PLAYERS }, () => ({
    passedTypes: Array(TOTAL_TYPES).fill(0)
}));

// Update player actions
function updatePlayerActions(playerIndex, parchiType) {
    playerActions[playerIndex].passedTypes[parchiType]++;
}

// Analyze player behavior and adjust AI strategy
function analyzePlayerBehavior() {
    // Example: Identify if any player frequently passes a specific type
    playerActions.forEach((actions, index) => {
        const frequentType = actions.passedTypes.findIndex(count => count > 2); // Arbitrary threshold
        if (frequentType !== -1) {
            console.log(`Player ${index} frequently passes type ${frequentType}`);
            // AI can adjust strategy based on this information
        }
    });
}

// Modify computerTurn to use adaptive strategy
// Modify computerTurn to use adaptive strategy and pass only one card
function computerTurn() {
    if (currentPlayerIndex === -1) return; // Game over

    const aiIndex = currentPlayerIndex;
    const nextPlayerIndex = (currentPlayerIndex + 1) % TOTAL_PLAYERS;

    // AI strategy: Pass the parchi type it has the most of
    const parchiCounts = Array(TOTAL_TYPES).fill(0);
    playerHands[aiIndex].forEach((parchi) => parchiCounts[parchi]++);
    const maxCount = Math.max(...parchiCounts);
    const parchiToPassIndex = playerHands[aiIndex].findIndex((parchi) => parchiCounts[parchi] === maxCount);

    const parchiToPass = playerHands[aiIndex].splice(parchiToPassIndex, 1)[0]; // Remove the selected parchi
    playerHands[nextPlayerIndex].push(parchiToPass); // Pass to next player

    renderPlayerHand(aiIndex);
    renderPlayerHand(nextPlayerIndex);

    displayMessage(`Computer ${aiIndex} passed a parchi to ${nextPlayerIndex === 0 ? "You" : `Computer ${nextPlayerIndex}`}...`);

    if (checkWinCondition()) return;

    currentPlayerIndex = nextPlayerIndex;
    if (currentPlayerIndex === 0) {
        displayMessage("Your turn! Select a parchi type to pass.");
    } else {
        setTimeout(computerTurn, 1000); // Proceed to next computer's turn
    }
}
// Initial setup
function startGame() {
    renderAllHands(); // Show all cards before shuffling
    displayMessage("Click 'Shuffle' to shuffle and distribute cards.");
    document.getElementById("shuffle-button").style.display = 'block';
}

// Shuffle and distribute cards, then start the game
function shuffleAndStartGame() {
    distributeCards();
    renderAllHands();
    currentPlayerIndex = Math.floor(Math.random() * TOTAL_PLAYERS); // Randomly select starting player
    if (currentPlayerIndex === 0) {
        displayMessage("Your turn! Select a parchi type to pass.");
    } else {
        displayMessage(`Computer ${currentPlayerIndex} starts the game.`);
        setTimeout(computerTurn, 1000);
    }
}

// Event listeners
document.getElementById("start-game-button").addEventListener("click", () => {
    startGame();
    document.getElementById("start-game-button").style.display = 'none';
});

document.getElementById("shuffle-button").addEventListener("click", () => {
    shuffleAndStartGame();
    document.getElementById("shuffle-button").style.display = 'none';
});

// Start the game on load
updateWinnerDisplay();