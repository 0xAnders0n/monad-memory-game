window.onload = () => {
  document.getElementById("newGameBtn").addEventListener("click", startNewGame);
};

/********************************************
 * Массив из 54 карт (img1...img54)
 ********************************************/
const allImages = [];
for (let i = 1; i <= 54; i++) {
  allImages.push(`img${i}.jpg`);
}

/********************************************
 * Выбрать N карт (12,18,24)
 ********************************************/
function getRandomCards(selectedCount) {
  const pairs = selectedCount / 2;
  const shuffled = [...allImages].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, pairs);
  const result = [...picked, ...picked];
  result.sort(() => Math.random() - 0.5);
  return result;
}

/********************************************
 * Установить grid (4x3, 6x3, 8x3)
 ********************************************/
function setGrid(boardElement, selectedCount) {
  let cols = 4; // default for 12
  let rows = 3;
  if (selectedCount === 18) cols = 6;
  if (selectedCount === 24) cols = 8;

  boardElement.style.gridTemplateColumns = `repeat(${cols}, 150px)`;
  boardElement.style.gridTemplateRows = `repeat(${rows}, 210px)`;

  // Поднимаем ещё выше => 60px auto 40px
  boardElement.style.margin = "60px auto 40px";
}

/********************************************
 * Фон, музыка, etc
 ********************************************/
const backgrounds = [
  "background/bg1.jpg",
  "background/bg2.jpg",
  "background/bg3.jpg"
];
const musicTracks = [
  "background/music1.mp3",
  "background/music2.mp3",
  "background/music3.mp3"
];

let flippedCards = [];
let matchedPairs = 0;
let attempts = 0;
let time = 0;
let timerInterval;
let currentBackgroundIndex = 0;
let currentMusicIndex = 0;
let canFlip = false;

let selectedCardCount = 24;

const board = document.getElementById("gameBoard");
const backgroundMusic = new Audio();

document.addEventListener("click", () => {
  if (backgroundMusic.paused) {
    playBackgroundMusic();
  }
});

function playBackgroundMusic() {
  backgroundMusic.src = musicTracks[currentMusicIndex];
  backgroundMusic.volume = 0.25;
  backgroundMusic.play().catch(err => console.log("Autoplay prevented:", err));

  backgroundMusic.onended = () => fadeOutMusic();
}

function fadeOutMusic() {
  let fadeOutInterval = setInterval(() => {
    if (backgroundMusic.volume > 0.05) {
      backgroundMusic.volume -= 0.05;
    } else {
      clearInterval(fadeOutInterval);
      switchTrack();
    }
  }, 300);
}

function switchTrack() {
  currentMusicIndex = (currentMusicIndex + 1) % musicTracks.length;
  backgroundMusic.src = musicTracks[currentMusicIndex];
  backgroundMusic.play();

  let fadeInInterval = setInterval(() => {
    if (backgroundMusic.volume < 0.25) {
      backgroundMusic.volume += 0.05;
    } else {
      clearInterval(fadeInInterval);
    }
  }, 300);
}

function changeBackground() {
  document.body.style.backgroundImage = `url('${backgrounds[currentBackgroundIndex]}')`;
  currentBackgroundIndex = (currentBackgroundIndex + 1) % backgrounds.length;
}
setInterval(changeBackground, 10000);

/********************************************
 * Новая игра
 ********************************************/
function startNewGame() {
  // Считываем выбранное кол-во карт
  const radios = document.getElementsByName("cardCount");
  for (let radio of radios) {
    if (radio.checked) {
      selectedCardCount = parseInt(radio.value);
      break;
    }
  }

  board.innerHTML = "";
  document.getElementById("shuffleSound").play();

  flippedCards = [];
  matchedPairs = 0;
  attempts = 0;
  time = 0;
  document.getElementById("attempts").textContent = attempts;
  document.getElementById("timer").textContent = time;
  canFlip = false;

  clearInterval(timerInterval);
  changeBackground();

  // Устанавливаем сетку (4x3, 6x3, 8x3)
  setGrid(board, selectedCardCount);

  const imagesArray = getRandomCards(selectedCardCount);
  const totalCards = imagesArray.length;
  let dealtCards = 0;

  // Раздача
  imagesArray.forEach((imgSrc, index) => {
    setTimeout(() => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.image = imgSrc;

      const cardInner = document.createElement("div");
      cardInner.classList.add("card-inner");

      const backSide = document.createElement("div");
      backSide.classList.add("card-side", "card-back");

      const frontSide = document.createElement("div");
      frontSide.classList.add("card-side", "card-front");

      const faceImg = document.createElement("img");
      faceImg.src = `img/${imgSrc}`;
      faceImg.style.width = "100%";
      faceImg.style.height = "100%";
      faceImg.style.borderRadius = "8px";

      frontSide.appendChild(faceImg);
      cardInner.appendChild(backSide);
      cardInner.appendChild(frontSide);
      card.appendChild(cardInner);
      board.appendChild(card);

      setTimeout(() => {
        card.classList.add("show");
        dealtCards++;
        if (dealtCards === totalCards) {
          startTimer();
          canFlip = true;
        }
        card.addEventListener("click", () => flipCard(card));
      }, 200);
    }, index * 600);
  });

  playBackgroundMusic();
}

/********************************************
 * Таймер
 ********************************************/
function startTimer() {
  time = 0;
  document.getElementById("timer").textContent = time;
  timerInterval = setInterval(() => {
    time++;
    document.getElementById("timer").textContent = time;
  }, 1000);
}

/********************************************
 * Переворот
 ********************************************/
function flipCard(card) {
  if (!canFlip || flippedCards.length >= 2 || card.classList.contains("flipped")) return;
  card.classList.add("flipped");
  document.getElementById("flipSound").play();
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    setTimeout(checkMatch, 500);
  }
}

/********************************************
 * Проверка совпадений
 ********************************************/
function checkMatch() {
  attempts++;
  document.getElementById("attempts").textContent = attempts;

  const [card1, card2] = flippedCards;
  if (card1.dataset.image === card2.dataset.image) {
    document.getElementById("successSound").play();
    flippedCards = [];
    matchedPairs++;

    if (matchedPairs === selectedCardCount / 2) {
      clearInterval(timerInterval);
      setTimeout(finishGame, 500);
    }
  } else {
    document.getElementById("failSound").play();
    setTimeout(() => {
      flippedCards.forEach(c => c.classList.remove("flipped"));
      flippedCards = [];
    }, 500);
  }
}

/********************************************
 * Завершение игры (формула очков)
 ********************************************/
function finishGame() {
  const totalPairs = selectedCardCount / 2;
  const baseScore = totalPairs * 150;
  const penalty = (time * 2) + (attempts * 5);

  let score = baseScore - penalty;
  if (score < 0) score = 0;

  alert(
    `🎉 Congratulations!\n` +
    `You finished ${selectedCardCount} cards in ${time} seconds and ${attempts} attempts.\n` +
    `Your score: ${score}`
  );
}
