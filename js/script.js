window.onload = () => {
  document.getElementById("newGameBtn").addEventListener("click", startNewGame);
};

const images = [
  "img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg",
  "img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg"
];

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

// Параметры игры
let flippedCards = [];
let matchedPairs = 0;
let attempts = 0;
let time = 0;
let timerInterval;
let currentBackgroundIndex = 0;
let currentMusicIndex = 0;
let canFlip = false;

const board = document.getElementById("gameBoard");
const backgroundMusic = new Audio();

/********************************************
 *   ФОН МУЗЫКА
 ********************************************/
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

document.addEventListener("click", () => {
  if (backgroundMusic.paused) {
    playBackgroundMusic();
  }
});

/********************************************
 *   СМЕНА ФОНА КАЖДЫЕ 10 СЕК
 ********************************************/
function changeBackground() {
  document.body.style.backgroundImage = `url('${backgrounds[currentBackgroundIndex]}')`;
  currentBackgroundIndex = (currentBackgroundIndex + 1) % backgrounds.length;
}
setInterval(changeBackground, 10000);

/********************************************
 *   НОВАЯ ИГРА
 ********************************************/
function startNewGame() {
  board.innerHTML = "";
  images.sort(() => Math.random() - 0.5);
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

  let dealtCards = 0;
  const totalCards = images.length;

  images.forEach((imgSrc, index) => {
    setTimeout(() => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.image = imgSrc;

      const cardInner = document.createElement("div");
      cardInner.classList.add("card-inner");

      // Рубашка
      const backSide = document.createElement("div");
      backSide.classList.add("card-side", "card-back");

      // Лицевая сторона
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

      // "Прилет" карты
      setTimeout(() => {
        card.classList.add("show");
        dealtCards++;
        if (dealtCards === totalCards) {
          startTimer();
          canFlip = true;
        }
        card.addEventListener("click", () => flipCard(card));
      }, 200);
    }, index * 1000);
  });

  playBackgroundMusic();
}

/********************************************
 *   ТАЙМЕР
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
 *   ПЕРЕВОРОТ КАРТЫ
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
 *   ПРОВЕРКА СОВПАДЕНИЙ
 ********************************************/
function checkMatch() {
  attempts++;
  document.getElementById("attempts").textContent = attempts;

  const [card1, card2] = flippedCards;
  if (card1.dataset.image === card2.dataset.image) {
    document.getElementById("successSound").play();
    flippedCards = [];
    matchedPairs++;

    if (matchedPairs === images.length / 2) {
      clearInterval(timerInterval);
      setTimeout(() => {
        finishGame();
      }, 500);
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
 *   ОКОНЧАНИЕ ИГРЫ + ПОДСЧЁТ ОЧКОВ (EN)
 ********************************************/
function finishGame() {
  // Формула очков: max(0, 1000 - (time * 2 + attempts * 5))
  const base = 1000;
  const timePenalty = time * 2;
  const attemptPenalty = attempts * 5;
  let score = base - (timePenalty + attemptPenalty);
  if (score < 0) score = 0;

  alert(`🎉 Congratulations! You finished the game in ${time} seconds with ${attempts} attempts.\nYour score: ${score}`);
}
