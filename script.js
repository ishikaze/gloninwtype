let highlightIndex = 0;
let score = 0;
let timer = 5;
let tuto = true;
let restartTimer = false;
let gameEnd = false;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function switchToPage(name) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        if (page.classList.contains(name)) {
            page.style.opacity = '1';
            page.style.pointerEvents = 'auto';
        } else {
            page.style.opacity = '0';
            page.style.pointerEvents = 'none';
        }
    });
}

switchToPage('main-menu');

function closeTuto() {
    const pages = document.querySelectorAll('.game-rule');
    pages.forEach(page => {
        page.style.opacity = '0';
        page.style.pointerEvents = 'none';
    });
    tuto = false;
    startTimer()
    setTimeout(() => {
        document.querySelector('input[name="answer"]').focus();
    }, 10);
}

function setRandomGlon() {
    highlightIndex = 0;
    gameEnd = false;
    // const randomGlon = glons[Math.floor(Math.random() * glons.length)];
    const randomGlon = glons[0];
    localStorage.setItem('currentGlon', JSON.stringify(randomGlon));
    const glonElement = document.getElementById('glon-section');
    const glonSet = document.getElementById('glon-set');
    const glonTopic = document.getElementById('glon-topic');

    glonElement.innerHTML = ''; // Clear existing content

    for (let i = 0; i < randomGlon["บทประพันธ์"].length; i++) {
        const line = document.createElement('p'); // Create a new paragraph element
        line.textContent = randomGlon["บทประพันธ์"][i]; // Set its text content

        // Check if it's the first line (index 0)
        if (i === 0) {
            line.style.textIndent = '2em'; // Add indentation, adjust value as needed
    
        }

        glonElement.appendChild(line); // Append it to the glonElement
    }
    highlight()
}

function highlight() {
    const randomGlon = JSON.parse(localStorage.getItem('currentGlon'));
    document.querySelector('input[name="answer"]').value = '';
    setTimeout(() => {
        document.querySelector('input[name="answer"]').focus();
    }, 10);

    if (highlightIndex > 6) {
        highlightIndex = 0;
        setRandomGlon();
        return; // After resetting, exit to let setRandomGlon call highlight
    }

    const paragraph = document.getElementById('glon-section');
    // Clear previous highlights and store original HTML
    const originalHTML = paragraph.innerHTML.replace(/<mark class="highlight">(.*?)<\/mark>/gi, '$1');

    let desiredIndex = highlightIndex;
    const textToHighlight = randomGlon["highlight"][desiredIndex];
    const regex = new RegExp(textToHighlight, 'gi');
    let matches = [];
    let match;

    // Find all matches
    while ((match = regex.exec(originalHTML)) !== null) {
        matches.push({ index: match.index, length: match[0].length });
    }

    if (matches.length > 0) {
        // If desired index is out of bounds, lower it until valid
        while (desiredIndex >= matches.length) {
            desiredIndex--;
        }
        const matchToHighlight = matches[desiredIndex];
        const before = originalHTML.substring(0, matchToHighlight.index);
        const highlighted = `<mark class="highlight">` + originalHTML.substr(matchToHighlight.index, matchToHighlight.length) + `</mark>`;
        const after = originalHTML.substring(matchToHighlight.index + matchToHighlight.length);
        paragraph.innerHTML = before + highlighted + after;
    }

    highlightIndex++;
    restartTimer = true;
}

function checkAnswer() {
    const randomGlon = JSON.parse(localStorage.getItem('currentGlon'));
    const userInput = document.getElementById('answer-input').value.trim();
    const resultElement = document.getElementById('result');

    if (userInput === randomGlon["answers"][highlightIndex - 1]) {
        showResult('ถูกต้อง!', "#46ff40")
        score++;
        document.getElementById('score').textContent = `คะแนน: ${score}`;
        highlight();
    } else {
        showResult('ผิด!', "#FF0000")
        console.log(`Expected: ${randomGlon["answers"][highlightIndex - 1]}, but got: ${userInput}`); // For debugging
    }
}

function showResult(text, color) {
    const resultElement = document.getElementById('result');
    resultElement.textContent = text;
    resultElement.style.color = color;
    resultElement.style.opacity = '1';

    setTimeout(() => {
        resultElement.style.opacity = '0';
    }, 1000);
}

async function startTimer() {
    const timerElement = document.getElementById('timer');
    timerElement.style.display = 'block';

    for (let i = timer; i > -1; i--) {
        if (tuto) {
            return
        }
        if (restartTimer) {
            restartTimer = false;
            i = 5
        }
        if (gameEnd) {
            return
        }
        timerElement.textContent = `เหลือเวลา ${i}s`;
        await sleep(1000);
    }

    timerElement.style.display = 'none';
    switchToPage('end');
    document.getElementById('final-score').textContent = score;
    score = 0;
    document.getElementById('score').textContent = `คะแนน: ${score}`;
    gameEnd = true;
}
