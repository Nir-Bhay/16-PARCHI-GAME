var defaultOption = document.getElementById('defaultOption');
var manualOption = document.getElementById('manualOption');
var manualInput = document.getElementById('manualNameInput');
var numberOfPlayers = document.getElementById('numberOfPlayers');
var manualNamesDisplay = document.getElementById('manualNamesDisplay');
var manualNames = [];

// Show/hide manual input based on radio button selection
defaultOption.addEventListener('change', function () {
    manualInput.style.display = 'none';
    manualNamesDisplay.innerHTML = '';
});

manualOption.addEventListener('change', function () {
    manualInput.style.display = 'block';
    manualNamesDisplay.innerHTML = '';
});

// Add manually entered names to the list
manualInput.addEventListener('change', function () {
    if (manualNames.length < parseInt(numberOfPlayers.value)) {
        manualNames.push(this.value);
        this.value = ''; // Clear input field
    } else {
        alert('You have entered the maximum number of names.');
    }
});

// Display manually entered names below the form
function displayManualNames() {
    var playerName = 'Manual Player Names:';
    manualNames.forEach(function (name, index) {
        playerName += '<br>' + (index + 1) + '. ' + name;
    });
    manualNamesDisplay.innerHTML = playerName;
}

// Generate default names based on the selected number of players
function generateDefaultNames() {
    var fruits = ['Apple', 'Banana', 'Orange', 'Strawberry', 'Mango'];
    var defaultNames = '';
    for (var i = 0; i < numberOfPlayers.value; i++) {
        var randomIndex = Math.floor(Math.random() * fruits.length);
        defaultNames += fruits[randomIndex] + ', ';
    }
    defaultNames = defaultNames.slice(0, -2); // Remove the last comma and space
    return defaultNames;
}

document.querySelector('button').addEventListener('click', function (event) {
    event.preventDefault();
    var playerName;
    if (defaultOption.checked) {
        playerName = 'Default Player Names: ' + generateDefaultNames();
    } else {
        displayManualNames();
    }
});