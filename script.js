const gameBoard = document.getElementById('game-board');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const startButton = document.getElementById('start-button');
const resetButton = document.getElementById('reset-button');
const highScoreElement = document.getElementById('high-score').querySelector('span');

let atoms = [];
let centerAtom = null;
let movingInterval = null;
let score = 0;
let highScore = 0;
let isMoving = false;
let CIRCLE_RADIUS;

function initGame() {
    atoms = [];
    score = 0;
    gameBoard.innerHTML = '';
    CIRCLE_RADIUS = Math.min(gameBoard.offsetWidth, gameBoard.offsetHeight) / 2 - 20;
    generateNewCenterAtom();
}

function createAtom(value) {
    const atom = document.createElement('div');
    atom.className = 'atom';
    atom.textContent = value;
    return atom;
}

function createCenterAtom(value) {
    centerAtom = createAtom(value);
    gameBoard.appendChild(centerAtom);
    placeAtomInCenter(centerAtom);
    isMoving = false;
}

function placeAtomInCenter(atom) {
    const centerX = gameBoard.offsetWidth / 2;
    const centerY = gameBoard.offsetHeight / 2;
    atom.style.left = `${centerX}px`;
    atom.style.top = `${centerY}px`;
}

function moveAtom(dx, dy) {
    const speed = 15;
    const centerX = gameBoard.offsetWidth / 2;
    const centerY = gameBoard.offsetHeight / 2;
    
    let x = parseFloat(centerAtom.style.left || centerX) + dx * speed;
    let y = parseFloat(centerAtom.style.top || centerY) + dy * speed;

    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

    if (distance >= CIRCLE_RADIUS) {
        clearInterval(movingInterval);
        isMoving = false;
        handleAtomPlacement(Math.atan2(y - centerY, x - centerX));
        return;
    }

    centerAtom.style.left = `${x}px`;
    centerAtom.style.top = `${y}px`;
}

function handleAtomPlacement(angle) {
    const normalizedAngle = normalizeAngle(angle);
    
    if (atoms.length === 0) {
        placeFirstAtom(normalizedAngle);
    } else {
        insertAtomAtAngle(normalizedAngle);
    }
    
    generateNewCenterAtom();
}

function normalizeAngle(angle) {
    while (angle < 0) {
        angle += 2 * Math.PI;
    }
    while (angle >= 2 * Math.PI) {
        angle -= 2 * Math.PI;
    }
    return angle;
}

function placeFirstAtom(angle) {
    const centerX = gameBoard.offsetWidth / 2;
    const centerY = gameBoard.offsetHeight / 2;
    const newX = centerX + CIRCLE_RADIUS * Math.cos(angle);
    const newY = centerY + CIRCLE_RADIUS * Math.sin(angle);

    centerAtom.style.left = `${newX}px`;
    centerAtom.style.top = `${newY}px`;
    atoms.push(centerAtom);
}

function insertAtomAtAngle(angle) {
    angle = normalizeAngle(angle);
    
    const atomAngles = atoms.map((atom) => {
        const atomX = parseFloat(atom.style.left) - gameBoard.offsetWidth / 2;
        const atomY = parseFloat(atom.style.top) - gameBoard.offsetHeight / 2;
        let atomAngle = Math.atan2(atomY, atomX);
        return normalizeAngle(atomAngle);
    });

    let insertIndex = 0;
    if (atoms.length > 0) {
        let minAngleDiff = 2 * Math.PI;
        
        for (let i = 0; i < atoms.length; i++) {
            const currentAngle = atomAngles[i];
            const nextAngle = (i < atoms.length - 1) ? atomAngles[i + 1] : atomAngles[0] + 2 * Math.PI;
            
            if (angle >= currentAngle && angle < nextAngle) {
                insertIndex = i + 1;
                break;
            }
            
            if (i === atoms.length - 1 && angle >= atomAngles[i]) {
                insertIndex = atoms.length;
            }
        }
    }

    atoms.splice(insertIndex, 0, centerAtom);
    redistributeAtoms();
}

function redistributeAtoms() {
    const totalAtoms = atoms.length;
    if (totalAtoms === 0) return;

    const angleStep = (2 * Math.PI) / totalAtoms;

    atoms.forEach((atom, index) => {
        const angle = index * angleStep;
        const centerX = gameBoard.offsetWidth / 2;
        const centerY = gameBoard.offsetHeight / 2;
        
        const newX = centerX + CIRCLE_RADIUS * Math.cos(angle);
        const newY = centerY + CIRCLE_RADIUS * Math.sin(angle);
        
        atom.style.transition = 'left 0.3s ease-out, top 0.3s ease-out';
        atom.style.left = `${newX}px`;
        atom.style.top = `${newY}px`;
    });
}

function generateNewCenterAtom() {
    const value = Math.floor(Math.random() * 3) + 1;
    createCenterAtom(value);
}

function handleTouch(event) {
    if (isMoving) return;

    isMoving = true;
    if (movingInterval) clearInterval(movingInterval);

    const rect = gameBoard.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const touchX = event.touches[0].clientX - rect.left;
    const touchY = event.touches[0].clientY - rect.top;
    
    const dx = touchX - centerX;
    const dy = touchY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;

    movingInterval = setInterval(() => moveAtom(normalizedDx, normalizedDy), 16);
}

function startGame() {
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    initGame();
}

function resetGame() {
    startScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
    initGame();
}

startButton.addEventListener('click', startGame);
resetButton.addEventListener('click', resetGame);
gameBoard.addEventListener('touchstart', handleTouch);

highScoreElement.textContent = highScore;