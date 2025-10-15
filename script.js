let highlightIndex = 0;
let score = 0;
let timer = 5;
let tuto = true;
let restartTimer = false;
let gameEnd = false;
let isResetting = false;

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

function setRandomGlon(skipHighlight = false) {
    const randomGlon = glons[Math.floor(Math.random() * glons.length)];
    localStorage.setItem('currentGlon', JSON.stringify(randomGlon));
    const glonElement = document.getElementById('glon-section');

    glonElement.innerHTML = ''; // Clear existing content

    for (let i = 0; i < randomGlon["บทประพันธ์"].length; i++) {
        const line = document.createElement('p');
        line.textContent = randomGlon["บทประพันธ์"][i];

        if (i === 0) {
            line.style.textIndent = '2em';
        }
        glonElement.appendChild(line);
    }
    if (!skipHighlight) {
        // This is for initial load or when setRandomGlon is called without skipHighlight
        setTimeout(() => { highlight(); }, 100);
    }
}

/* CORRECTED highlight function for glon change highlighting */
function highlight() {
    // Check if a reset is in progress. If so, only allow the *final* highlight call
    // after the reset flag is cleared.
    if (isResetting && highlightIndex === 0) { // Allow the initial highlight after reset
        // This means it's the highlight call that was explicitly made *after* setRandomGlon(true)
        // and after isResetting was set to false.
        // Or, more simply, just prevent other calls while resetting, and trust the final call.
    } else if (isResetting) {
        return; // Prevent any other highlight calls while reset is active
    }


    const randomGlon = JSON.parse(localStorage.getItem('currentGlon'));
    document.querySelector('input[name="answer"]').value = '';
    setTimeout(() => {
        document.querySelector('input[name="answer"]').focus();
    }, 10);

    // If highlightIndex has gone past the available words to highlight, reset the glon
    if (highlightIndex >= randomGlon["highlight"].length) {
        isResetting = true; // Set the flag immediately
        setTimeout(() => {
            highlightIndex = 0;
            setRandomGlon(true); // Load a new glon without immediately calling highlight

            // *** CRUCIAL CHANGE HERE ***
            // Reset isResetting to false *before* calling highlight for the new glon
            isResetting = false; 
            highlight();        // Then call highlight to show the first word of the new glon
            // No need to set isResetting to false again, as it's done above
        }, 200);
        return;
    }

    const glonElement = document.getElementById('glon-section');
    const paragraphs = glonElement.querySelectorAll('p');

    // First, remove any existing highlights from all paragraphs
    paragraphs.forEach(p => {
        p.innerHTML = p.innerHTML.replace(/<mark class="highlight">(.*?)<\/mark>/gi, '$1');
    });

    // Get the word to highlight based on the current highlightIndex
    const textToHighlight = randomGlon["highlight"][highlightIndex];
    
    // Escape special characters for regex
    const escapedTextToHighlight = textToHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTextToHighlight})`, 'g'); // Capture group for replacement

    let foundHighlight = false;
    // Iterate through paragraphs to find and highlight the word
    for (let i = 0; i < paragraphs.length; i++) {
        const p = paragraphs[i];
        const originalText = p.textContent; // Use textContent to avoid issues with existing HTML

        // Check if the word exists in this paragraph
        if (regex.test(originalText)) {
            p.innerHTML = originalText.replace(regex, '<mark class="highlight">$1</mark>');
            foundHighlight = true;
            break; // Stop after highlighting the first match for the current word
        }
    }

    if (!foundHighlight) {
        console.warn(`Text to highlight "${textToHighlight}" for index ${highlightIndex} not found in current glon.`);
    }

    highlightIndex++;
    restartTimer = true;
}

function checkAnswer() {
    const randomGlon = JSON.parse(localStorage.getItem('currentGlon'));
    const userInput = document.getElementById('answer-input').value.trim();

    if (userInput === randomGlon["answers"][highlightIndex - 1]) {
        showResult('ถูกต้อง!', "#46ff40")
        score++;
        document.getElementById('score').textContent = `คะแนน: ${score}`;
        highlight();
    } else {
        showResult('ผิด!', "#FF0000")
        console.log(`Expected: ${randomGlon["answers"][highlightIndex - 1]}, but got: ${userInput}`);
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