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
        const playerHandElement = document.getElementById(`player-hand-${i}`);
        if (playerHandElement) {
            playerHandElement.innerHTML = playerHands[i].map(card => `<div class="card">${card}</div>`).join('');
        }
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

            // Transfer the extra card to the next player
            const nextPlayerIndex = (i + 1) % TOTAL_PLAYERS;
            if (playerHands[i].length > 0) {
                const extraCard = playerHands[i].pop(); // Remove the last card from the winner
                playerHands[nextPlayerIndex].push(extraCard); // Transfer it to the next player
                displayMessage(`${winner} transferred a card to ${nextPlayerIndex === 0 ? "You" : `Computer ${nextPlayerIndex}`}.`);
                
            }
            displayMessage(`${winner} won the game!`, winner === "You" ? 'win' : 'lose');
            currentPlayerIndex = -1; // End game
            setTimeout(startGame, 3000); // Show the start/reset button for a new match
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
    setTimeout(computerTurn, 3000);
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

    // Count the number of each parchi type the AI has
    const parchiCounts = Array(TOTAL_TYPES).fill(0);
    playerHands[aiIndex].forEach((parchi) => parchiCounts[parchi]++);

    // Determine the type with the maximum count
    const maxCount = Math.max(...parchiCounts);
    const parchiToFocusOn = parchiCounts.findIndex(count => count === maxCount);

    // Check if the AI can disguise its intentions
    let parchiToPassIndex;
    const mixedTypes = playerHands[aiIndex].filter(parchi => parchi !== parchiToFocusOn);

    // If there are mixed types, randomly choose one to pass
    if (mixedTypes.length > 0) {
        parchiToPassIndex = playerHands[aiIndex].indexOf(mixedTypes[Math.floor(Math.random() * mixedTypes.length)]);
    } else {
        // If no mixed types, pass the type it has the most of
        parchiToPassIndex = playerHands[aiIndex].findIndex((parchi) => parchiCounts[parchi] === maxCount);
    }

    const parchiToPass = playerHands[aiIndex].splice(parchiToPassIndex, 1)[0]; // Remove the selected parchi
    playerHands[nextPlayerIndex].push(parchiToPass); // Pass to next player

    // Update actions after passing
    updatePlayerActions(aiIndex, parchiToPass);

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



function showStartButton() {
    const existingButton = document.getElementById('start-button');
    if (existingButton) {
        existingButton.remove(); // Remove existing button if it exists
    }

    const startButton = document.createElement('button');
    startButton.id = 'start-button'; // Assign an ID for easy reference
    startButton.innerText = 'Start New Match';
    startButton.onclick = startNewMatch; // Function to reset the game state
    document.body.appendChild(startButton); // Append the button to the body or a specific container
}

function startNewMatch() {
    // Reset game state and player hands
    playerHands = Array.from({ length: TOTAL_PLAYERS }, () => initializePlayerHand());
    currentPlayerIndex = 0; // Reset to the first player
    winCounts = Array(TOTAL_PLAYERS).fill(0); // Reset win counts

    // Remove the start button
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.remove();
    }

    // Reset UI and prepare for a new game
    resetGameUI();
    displayMessage("New match started! Your turn.");
}

function resetGameUI() {
    // Clear all player hands from the UI
    for (let i = 0; i < TOTAL_PLAYERS; i++) {
        const playerHandElement = document.getElementById(`player-hand-${i}`);
        if (playerHandElement) {
            playerHandElement.innerHTML = ''; // Clear the player's hand display
        }
    }

    // Reset scores displayed on the UI
    for (let i = 0; i < TOTAL_PLAYERS; i++) {
        const scoreElement = document.getElementById(`player-score-${i}`);
        if (scoreElement) {
            scoreElement.innerText = '0'; // Reset scores to zero
        }
    }

    // Clear any messages displayed on the UI
    const messageElement = document.getElementById('game-message');
    if (messageElement) {
        messageElement.innerText = ''; // Clear any previous game messages
    }

    // Reset any other UI elements as necessary
    const gameBoardElement = document.getElementById('game-board');
    if (gameBoardElement) {
        gameBoardElement.innerHTML = ''; // Clear the game board if applicable
    }

    // Optionally, reset any visual effects or animations
    const highlightedElements = document.querySelectorAll('.highlight');
    highlightedElements.forEach(element => {
        element.classList.remove('highlight'); // Remove highlights
    });

    // Reset turn indicator if needed
    const turnIndicator = document.getElementById('turn-indicator');
    if (turnIndicator) {
        turnIndicator.innerText = 'Your turn!'; // Reset turn indicator
    }
}





function initializePlayerHand() {
    // Logic to initialize a player's hand with cards
    return []; // Return an empty array or an array of cards as needed
}



// Start the game on load
updateWinnerDisplay();