window.onload = () => {
  document.getElementById("newGameBtn").addEventListener("click", startNewGame);
};

/********************************************
 * Генерируем массив из 54 карт
 ********************************************/
const allImages = [];
for (let i = 1; i <= 54; i++) {
  allImages.push(`img${i}.jpg`);
}

/********************************************
 * Функция выбрать N карт (12,18,24)
 ********************************************/
function getRandomCards(selectedCount) {
  const pairs = selectedCount / 2;
  // Перемешиваем 54
  const shuffled = [...allImages].sort(() => Math.random() - 0.5);
  // Берём первые pairs
  const picked = shuffled.slice(0, pairs);
  // Дублируем => N
  const result = [...picked, ...picked];
  // Перемешаем
  result.sort(() => Math.random() - 0.5);
  return result;
}

/********************************************
 * setGrid(boardElement, selectedCount)
 * На десктоп:
 *   12 => 4 cols, 18 => 6, 24 => 8
 * На мобильных:
 *   24 => 4 cols
 *   (12/18) => 3 cols
 ********************************************/
function setGrid(boardElement, selectedCount) {
  const isMobile = (window.innerWidth <= 600);
  if (!isMobile) {
    // Десктоп
    let cols = 4;
    let rows = 3;
    let gap = 15;

    if (selectedCount === 18) cols = 6;
    if (selectedCount === 24) cols = 8;

    boardElement.style.gridTemplateColumns = `repeat(${cols}, 150px)`;
    boardElement.style.gridTemplateRows = `repeat(${rows}, 210px)`;
    boardElement.style.gridAutoRows = `auto`;  // не особо нужно, но оставим
    boardElement.style.gap = `${gap}px`;
  } else {
    // Мобильное
    let cols = 3; // для 12 или 18
    if (selectedCount === 24) cols = 4; // если 24 => 4 столбца

    // Убираем фикс rows => auto
    // grid-auto-rows => подстраивается под высоту карт
    boardElement.style.gridTemplateColumns = `repeat(${cols}, 80px)`;
    boardElement.style.gridTemplateRows = `auto`;
    boardElement.style.gridAutoRows = `80px`; 
    boardElement.style.gap = `5px`;
  }
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
  // Узнаем выбрано 12/18/24
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

  // Устанавливаем сетку
  setGrid(board, selectedCardCount);

  // Создаём массив карт
  const imagesArray = getRandomCards(selectedCardCount);
  const totalCards = imagesArray.length;
  let dealtCards = 0;

  // Мобильное?
  const isMobile = (window.innerWidth <= 600);

  imagesArray.forEach((imgSrc, index) => {
    setTimeout(() => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.image = imgSrc;

      // если мобильное => карта 80×112
      // иначе => 150×210
      if (isMobile) {
        card.style.width = "80px";
        card.style.height = "112px";
      } else {
        card.style.width = "150px";
        card.style.height = "210px";
      }

      const cardInner = document.createElement("div");
      cardInner.classList.add("card-inner");

      const backSide = document.createElement("div");
      backSide.classList.add("card-side", "card-back");

      const frontSide = document.createElement("div");
      frontSide.classList.add("card-side", "card-front");

      const faceImg = document.createElement("img");
      faceImg.src = `img/${imgSrc}`;
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
 * flipCard
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
 * finishGame
 ********************************************/
function finishGame() {
  const totalPairs = selectedCardCount / 2;
  const baseScore = totalPairs * 150;
  const penalty = (time * 2) + (attempts * 5);
  let score = baseScore - penalty;
  if (score < 0) score = 0;

  alert(
    `🎉 Congratulations!\nYou finished ${selectedCardCount} cards in ${time} seconds and ${attempts} attempts.\nYour score: ${score}`
  );
}
