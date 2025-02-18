// Wordle, but with whatever you want
// Original by wissamfawaz: https://github.com/wissamfawaz/wordle-clone
// Custom features added by Ben Valentine on February 2025


// given a json filename, 
// set the last known wordlist in case of a page refresh
function set_wordlist(filename) {
  // store json filename as a string
  localStorage.setItem("wordlist", filename);
  // update the game parameters
  fetch_wordlist_and_dictionary();
}

// initialize global variables for the game
let dictionary = null;
let targetWord = null;

// fetch word list, find a target word, and fetch the respective dictionary.
function fetch_wordlist_and_dictionary() {

  // get the last known wordlist
  let wordlistFile = localStorage.getItem("wordlist");
  
  // fetch target wordlist JSON
  fetch(wordlistFile, { cache: 'no-store' }) // Do not cache the file
    .then(response => response.json())  // Parse the JSON data
    .then(targetWords => {

      // get the target wordlist length
      const targetWordsLength = targetWords.length;
      console.log(`Loaded wordlist with ${targetWordsLength} words.`);

      // pick a random target word
      const randomIndex = Math.floor(Math.random() * targetWordsLength);
      targetWord = targetWords[randomIndex];  // store globally
      console.log('Selected random target word:', targetWord);

      // get the length of the selected target word
      const wordLength = targetWord.length;
      console.log(`Selected word has ${wordLength} letters.`);

      // choose the respective dictionary based on the word length
      const dictionaryFile = `dictionary${wordLength}.json`;
      console.log(`Loading dictionary from ${dictionaryFile}...`);

      // fetch the appropriate dictionary JSON based on word length
      fetch(dictionaryFile, { cache: 'no-store' })
        .then(response => response.json()) // Parse the dictionary
        .then(data => {
          dictionary = data;  // store globally
          console.log(`Loaded dictionary with ${dictionary.length} words.`);
          
          // Start the game with the target word and dictionary
          // startGame(targetWord, dictionary);
        })
        .catch(error => {
          console.error('Error loading dictionary:', error);
        });
    })
    .catch(error => {
      console.error('Error loading targetWords.json:', error);
    });
}


// run the game with the selected targetWord and dictionary
window.onload = fetch_wordlist_and_dictionary();

const keyboard = document.querySelector("[data-keyboard]");
const guessGrid = document.querySelector("[data-guess-grid]");
const alertContainer = document.querySelector("[data-alert-container]");

const WORD_LENGTH = 5;
const FLIP_ANIMATION_DURATION = 500;
const DANCE_ANIMATION_DURATION = 500;

startInteraction();

function startInteraction() {
  document.addEventListener("click", handleMouseClick);
  document.addEventListener("keydown", handleKeyPress);
}

function stopInteraction() {
  document.removeEventListener("click", handleMouseClick);
  document.removeEventListener("keydown", handleKeyPress);
}

function handleMouseClick(e) {
  if (e.target.matches("[data-key]")) {
    pressKey(e.target.dataset.key);
    return;
  }

  if (e.target.matches("[data-enter]")) {
    submitGuess();
    return;
  }

  if (e.target.matches("[data-delete]")) {
    deleteKey();
    return;
  }
}

function handleKeyPress(e) {
  if (e.key === "Enter") {
    submitGuess();
    return;
  }

  if (e.key === "Backspace" || e.key === "Delete") {
    deleteKey();
    return;
  }

  if (e.key.match(/^[a-z]$/)) {
    pressKey(e.key);
    return;
  }
}

function pressKey(key) {
  const activeTiles = getActiveTiles();
  if (activeTiles.length >= WORD_LENGTH) {
    return;
  }
  const nextTile = guessGrid.querySelector(":not([data-letter])");
  nextTile.dataset.letter = key.toLowerCase();
  nextTile.textContent = key;
  nextTile.dataset.state = "active";
}

function deleteKey() {
  const activeTiles = getActiveTiles();
  const lastTile = activeTiles[activeTiles.length - 1];
  if (lastTile === null) return;
  lastTile.textContent = "";
  delete lastTile.dataset.state;
  delete lastTile.dataset.letter;
}

function submitGuess() {
  const activeTiles = [...getActiveTiles()];
  if (activeTiles.length !== WORD_LENGTH) {
    showAlert("Not enough letters!");
    shakeTiles(activeTiles);
    return;
  }

  const guess = activeTiles.reduce((word, tile) => {
    return word + tile.dataset.letter;
  }, "");
  if (!dictionary.includes(guess)) {
    showAlert("Not in word list");
    shakeTiles(activeTiles);
    return;
  }

  stopInteraction();
  activeTiles.forEach((...params) => flipTile(...params, guess));
}

function flipTile(tile, index, array, guess) {
  const letter = tile.dataset.letter;
  const key = keyboard.querySelector(`[data-key="${letter}"i]`);
  setTimeout(() => {
    tile.classList.add("flip");
  }, (index * FLIP_ANIMATION_DURATION) / 2);

  tile.addEventListener(
    "transitionend",
    () => {
      tile.classList.remove("flip");
      if (targetWord[index] === letter) {
        tile.dataset.state = "correct";
        key.classList.add("correct");
      } else if (targetWord.includes(letter)) {
        tile.dataset.state = "wrong-location";
        key.classList.add("wrong-location");
      } else {
        tile.dataset.state = "wrong";
        key.classList.add("wrong");
      }

      if (index === array.length - 1) {
        tile.addEventListener(
          "transitionend",
          () => {
            startInteraction();
            checkWinLose(guess, array);
          },
          { once: true }
        );
      }
    },
    { once: true }
  );
}

function getActiveTiles() {
  return guessGrid.querySelectorAll('[data-state="active"]');
}

function showAlert(message, duration = 1000) {
  const alert = document.createElement("div");
  alert.textContent = message;
  alert.classList.add("alert");
  alertContainer.prepend(alert);
  if (duration == null) {
    return;
  }
  setTimeout(() => {
    alert.classList.add("hide");
    alert.addEventListener("transitionend", () => {
      alert.remove();
    });
  }, duration);
}

function shakeTiles(tiles) {
  tiles.forEach((tile) => {
    tile.classList.add("shake");
    tile.addEventListener(
      "animationend",
      () => {
        tile.classList.remove("shake");
      },
      { once: true }
    );
  });
}

function checkWinLose(guess, tiles) {
  if (guess === targetWord) {
    showAlert("You Win!!! 🎉🎉", 6000);
    danceTiles(tiles);
    stopInteraction();
    return;
  }

  const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])");
  if (remainingTiles.length === 0) {
    showAlert("Correct word: " + targetWord.toUpperCase(), null);
    stopInteraction();
  }
}
function danceTiles(tiles) {
  tiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add("dance");
      tile.addEventListener(
        "animationend",
        () => {
          tile.classList.remove("dance");
        },
        { once: true }
      );
    }, (index * DANCE_ANIMATION_DURATION) / 5);
  });
}
