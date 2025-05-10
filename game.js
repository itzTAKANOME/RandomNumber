let playersProgress = JSON.parse(localStorage.getItem("playersProgress")) || {};
let guessedNumbers = []; // Track guessed numbers for each round
let currentLevel;
let secretNumber;
let attemptsLeft;
let playerName;

document.getElementById("startGame").addEventListener("click", startGame);
document.getElementById("startRound").addEventListener("click", startRound);
document.getElementById("submitGuess").addEventListener("click", submitGuess);
document.getElementById("saveProgressBtn").addEventListener("click", saveProgressToFile);
document.getElementById("loadProgressBtn").addEventListener("click", loadProgressFromFile); // New button to load progress

// Add event listener to trigger "startGame" on pressing Enter after entering player name
document.getElementById("playerName").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();  // Prevent form submission or other default behaviors
        startGame();
    }
});

// Add event listener to trigger "submitGuess" on pressing Enter after entering a guess
document.getElementById("guess").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();  // Prevent form submission or other default behaviors
        submitGuess();
    }
});

function startGame() {
    playerName = document.getElementById("playerName").value.trim();
    if (!playerName) {
        alert("Masukkan nama Anda terlebih dahulu!");
        return;
    }

    if (!playersProgress[playerName]) {
        playersProgress[playerName] = {
            easy: { wins: 0, losses: 0 },
            medium: { wins: 0, losses: 0 },
            hard: { wins: 0, losses: 0 },
        };
    }

    document.getElementById("playerDisplayName").textContent = playerName;
    displayProgress(playerName);

    document.getElementById("player-section").style.display = "none";
    document.getElementById("game-section").style.display = "block";
}

function startRound() {
    // Reset guessed numbers and inputs when starting a new round
    guessedNumbers = [];
    document.getElementById("guessedNumbers").textContent = "";

    // Reset the guess input and message
    document.getElementById("guess").value = '';
    document.getElementById("message").textContent = '';

    let level = document.getElementById("difficulty").value;
    currentLevel = level;
    let levelData = getLevelData(level);

    // Reset attempts when a new round starts or the difficulty level changes
    attemptsLeft = levelData.attempts;
    document.getElementById("attempts-left").textContent = attemptsLeft;

    // Generate a new random number for the game
    secretNumber = Math.floor(Math.random() * levelData.range) + 1;

    document.getElementById("game-play").style.display = "block";
}

function submitGuess() {
    let guess = parseInt(document.getElementById("guess").value);

    if (isNaN(guess)) {
        document.getElementById("message").textContent = "Masukkan angka yang valid!";
        return;
    }

    guessedNumbers.push(guess);
    document.getElementById("guessedNumbers").textContent = "Angka yang sudah ditebak: " + guessedNumbers.join(", ");

    if (guess < secretNumber) {
        document.getElementById("message").textContent = "Tebakan Anda terlalu kecil.";
    } else if (guess > secretNumber) {
        animateLargeGuessMessage();
    } else {
        // Player wins, only increase the win count
        document.getElementById("message").textContent = `Selamat! Anda menebak angka ${secretNumber} dengan benar!`;
        playersProgress[playerName][currentLevel].wins += 1;  // Increment wins only
        saveProgress();
        askToPlayAgain();
        return;
    }

    attemptsLeft--;
    document.getElementById("attempts-left").textContent = attemptsLeft;

    if (attemptsLeft === 0) {
        // Player loses, only increase the loss count
        document.getElementById("message").textContent = `Sayang sekali! Anda kehabisan percobaan. Angka yang benar adalah ${secretNumber}.`;
        playersProgress[playerName][currentLevel].losses += 1;  // Increment losses only
        saveProgress();
        askToPlayAgain();
    }
}

function getLevelData(level) {
    let levelData = {
        easy: { range: 100, attempts: 10 },
        medium: { range: 1000, attempts: 15 },
        hard: { range: 10000, attempts: 20 },
    };

    return levelData[level];
}

function displayProgress(playerName) {
    let progressDisplay = document.getElementById("progressDisplay");
    let playerData = playersProgress[playerName];

    progressDisplay.innerHTML = `
        Easy: ${playerData.easy.wins} wins, ${playerData.easy.losses} losses<br>
        Medium: ${playerData.medium.wins} wins, ${playerData.medium.losses} losses<br>
        Hard: ${playerData.hard.wins} wins, ${playerData.hard.losses} losses
    `;
}

function saveProgress() {
    localStorage.setItem("playersProgress", JSON.stringify(playersProgress));
    displayProgress(playerName); // Update live progress display
}

function saveProgressToFile() {
    let playerData = playersProgress[playerName];
    let fileContent = "";

    // Create a formatted string to represent the player's progress
    fileContent += `Progress untuk ${playerName}:\n`;
    for (let level in playerData) {
        fileContent += `${level.charAt(0).toUpperCase() + level.slice(1)}: ${playerData[level].wins} wins, ${playerData[level].losses} losses\n`;
    }

    // Create a Blob from the text content
    let blob = new Blob([fileContent], { type: "text/plain" });

    // Create a temporary link element to trigger the download
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${playerName}_progress.txt`; // Set the filename
    link.click();
}

function loadProgressFromFile() {
    // Prompt user to upload a JSON file
    let fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.click();

    fileInput.addEventListener("change", function () {
        const file = fileInput.files[0];
        if (!file) {
            alert("No file selected.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);
                // Validate and merge the loaded progress
                if (data && data[playerName]) {
                    playersProgress[playerName] = data[playerName];
                    saveProgress();
                    displayProgress(playerName);
                } else {
                    alert("Invalid progress file.");
                }
            } catch (err) {
                alert("Error reading the file.");
            }
        };
        reader.readAsText(file);
    });
}

function animateLargeGuessMessage() {
    const messageElement = document.getElementById("message");
    messageElement.textContent = "Tebakan Anda terlalu besar.";
    messageElement.classList.add("animate-message");

    setTimeout(() => {
        messageElement.classList.remove("animate-message");
    }, 1000); // Duration of animation
}

function askToPlayAgain() {
    let playAgain = confirm("Selamat! Anda berhasil menebak angka dengan benar. Apakah Anda ingin bermain lagi?");

    if (playAgain) {
        startRound(); // Start a new round with the current level
    } else {
        displayProgress(playerName); // Show final progress and allow the user to see their performance
        alert("Terima kasih telah bermain!");
    }
}

function exposeProgress() {
    // Log the current player progress to the console in a readable format
    console.log(playersProgress);
}

// You can now call `exposeProgress()` from the browser console to log progress data.
// playersProgress['Test'].easy.losses = 0; saveProgress();