const gameContainer = document.getElementById("game");
const clickCount = document.querySelector("#count span");
const playTime = document.querySelector("#time span");
const start = document.querySelector("#start");
const reset = document.querySelector("#reset");
const clickRecord = document.querySelector("#clickRecord");
const timeRecord = document.querySelector("#timeRecord");

let card1 = null;
let card2 = null;
let isProcessing = false;
let count = 0;
let time = 0;
let timeId;
let flipCount = 0;

let COLORS = [];

function UniqueRandoms(targetCount) {
    let randoms = [];
    while (randoms.length < targetCount) {
        let temp = Math.round(Math.random() * 10) * 25;
        if (randoms.indexOf(temp) == -1)
            randoms.push(temp);
    }
    return randoms;
}

function createColor() {
    let rs = UniqueRandoms(6);
    let gs = UniqueRandoms(6);
    let bs = UniqueRandoms(6);
    COLORS = [];
    for (let i = 0; i < 6; i++) {
        let rgb = `rgb(${rs[i]},${gs[i]},${bs[i]})`;
        COLORS.push(rgb);
    }
    COLORS = COLORS.concat(COLORS);
}
createColor();

// here is a helper function to shuffle an array
// it returns the same array with values shuffled
// it is based on an algorithm called Fisher Yates if you want ot research more
function shuffle(array) {
    let counter = array.length;
    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);
        // Decrease counter by 1
        counter--;
        // And swap the last element with it
        let lastCard = array[counter];
        array[counter] = array[index];
        array[index] = lastCard;
    }
    return array;
}

let shuffledColors = shuffle(COLORS);

function createDivsForColors(colorArray) {
    for (let color in colorArray) {
        // create a new div
        const newBox = document.createElement("div");
        newBox.classList.add("box");
        const front = document.createElement("div");
        front.index = color;
        front.classList.add("front", colorArray[color]);
        const back = document.createElement("div");
        back.classList.add("back");
        newBox.append(back, front);
        gameContainer.append(newBox);

        // click start to activate the div click
        start.addEventListener("click", function() {
            newBox.addEventListener("click", handleCardClick);
            if (!start.classList.contains("started")) {
                start.classList.add("started");
                timeId = setInterval(myTimer, 1000);
            }
        })
    }
}

function myTimer() {
    time++;
    playTime.innerHTML = `${time}S`;
}

function handleCardClick(event) {
    if (isProcessing) return;
    if (event.target.parentElement.classList.contains("flipped")) return;
    let currentCard = event.target;
    currentCard.previousSibling.style.backgroundColor = currentCard.classList[1];
    currentCard.parentElement.classList.add("flipped");
    count++;
    clickCount.innerHTML = count;
    if (!card1) {
        card1 = currentCard;
    } else if (!card2) {
        card2 = currentCard;
    }
    if (!card2) return;
    if (card1.className === card2.className) {
        flipCount += 2;
        card1 = null;
        card2 = null;
    } else {
        showProcessing();
        setTimeout(function() {
            card1.parentElement.classList.remove("flipped");
            card2.parentElement.classList.remove("flipped");
            card1 = null;
            card2 = null;
            hideProcessing();
        }, 1000);
    }
    if (flipCount === shuffledColors.length) {
        clearInterval(timeId);
        setTimeout(showGameOver, 500);
        updateScore();
    }
}

function showGameOver() {
    document.getElementById('divGameOver').style.display = 'block';
}

function hideGameOver() {
    document.getElementById('divGameOver').style.display = 'none';
}

function showProcessing() {
    isProcessing = true;
    document.getElementById('divProcessing').style.display = 'block';
}

function hideProcessing() {
    isProcessing = false;
    document.getElementById('divProcessing').style.display = 'none';
}

// when the DOM loads
createDivsForColors(shuffledColors);

function updateScore() {
    // get high score
    let score = getScore();
    if (score.length === 0) {
        score.push({ click: count, time: time });
    } else {
        if (count !== 0) {
            if (count <= score[0].click || score[0].click === 0) {
                score[0].click = count;
            }
            if (time <= score[0].time || score[0].time === 0) {
                score[0].time = time;
            }
        }
    }
    localStorage.setItem("score", JSON.stringify(score));
    clickRecord.textContent = score[0].click ? `${score[0].click} clicks!` : "";
    timeRecord.textContent = score[0].time ? `${score[0].time} seconds!` : "";
}
updateScore();

function getScore() {
    const score = localStorage.getItem("score");
    if (score) {
        return JSON.parse(score);
    } else {
        return [];
    }
}

reset.addEventListener("click", function() {
    if (!isProcessing) {
        gameContainer.innerHTML = "";
        start.classList.remove("started");
        count = 0;
        time = 0;
        clearInterval(timeId);
        clickCount.innerHTML = "";
        playTime.innerHTML = "";
        createColor();
        shuffledColors = shuffle(COLORS);
        createDivsForColors(shuffledColors);
        card1 = null;
        card2 = null;
        flipCount = 0;
        hideGameOver();
    }
})