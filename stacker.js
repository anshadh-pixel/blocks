// 1. DOM Elements, Constants, and Initial Variables
const gameArea = document.getElementById('game-area');
const scoreDisplay = document.getElementById('score');
const finalScoreDisplay = document.getElementById('final-score');
const gameOverScreen = document.getElementById('game-over-screen');
const tapArea = document.getElementById('tap-area');

const CONTAINER_WIDTH = 450;
const BLOCK_HEIGHT = 30;
const INITIAL_WIDTH = 250;

let currentLevel = 0; 
let blockWidth = INITIAL_WIDTH; 
let blockSpeed = 2; 
let animationId; 
let isMoving = false;
let isRightward = true; 
let movingBlock = null; 

// 2. Game Initialization
function startGame() {
    // Reset state
    currentLevel = 0;
    scoreDisplay.textContent = 0;
    blockWidth = INITIAL_WIDTH;
    blockSpeed = 2;
    gameOverScreen.style.display = 'none';
    isMoving = false;
    
    // Remove old blocks (except base)
    document.querySelectorAll('.block:not(#base-block)').forEach(b => b.remove());
    
    // Reset base block
    const baseBlock = document.getElementById('base-block');
    baseBlock.style.width = INITIAL_WIDTH + 'px';
    baseBlock.style.left = (CONTAINER_WIDTH / 2 - INITIAL_WIDTH / 2) + 'px';
    baseBlock.style.bottom = '0px'; // Ensure base block is at bottom
    
    // Reset game area transform
    gameArea.style.transform = `translateY(0px)`; 

    // Create new block and start game
    createNewBlock();
    
    // Add tap area listener
    tapArea.addEventListener('click', dropBlock, { once: true });
}

// 3. Block Creation
function createNewBlock() {
    isMoving = false;
    
    // Fix: Stack blocks from bottom to top
    const MAX_VISIBLE_HEIGHT = 15; // Number of blocks visible on screen
    
    if (currentLevel > MAX_VISIBLE_HEIGHT) {
        // Move gameArea up to keep new blocks visible at bottom
        const offset = currentLevel - MAX_VISIBLE_HEIGHT;
        gameArea.style.transform = `translateY(${offset * BLOCK_HEIGHT}px)`;
    } else {
        gameArea.style.transform = `translateY(0px)`;
    }
    
    const nextWidth = blockWidth;
    
    movingBlock = document.createElement('div');
    movingBlock.classList.add('block');
    
    movingBlock.style.width = nextWidth + 'px';
    movingBlock.style.height = BLOCK_HEIGHT + 'px';
    
    // Fix: Stack blocks from bottom to top
    movingBlock.style.bottom = ((currentLevel + 1) * BLOCK_HEIGHT) + 'px';
    
    // Starting position for movement
    movingBlock.style.left = isRightward ? (-nextWidth) + 'px' : CONTAINER_WIDTH + 'px'; 

    gameArea.appendChild(movingBlock);
    
    isMoving = true;
    
    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(gameLoop);
}

// 4. Game Loop
function gameLoop() {
    if (!isMoving) return; 

    const currentX = parseFloat(movingBlock.style.left);
    let newX;

    if (isRightward) {
        newX = currentX + blockSpeed;
        if (newX > CONTAINER_WIDTH) {
            isRightward = false;
            newX = CONTAINER_WIDTH;
        }
    } else {
        newX = currentX - blockSpeed;
        if (newX < -blockWidth) {
            isRightward = true;
            newX = -blockWidth;
        }
    }

    movingBlock.style.left = newX + 'px';
    
    animationId = requestAnimationFrame(gameLoop);
}

// 5. Drop Block / Cut Block
function dropBlock() {
    if (!isMoving) return;

    cancelAnimationFrame(animationId); 
    isMoving = false;

    // Get previous block's info
    const allBlocks = document.querySelectorAll('.block');
    const lastBlock = allBlocks[allBlocks.length - 2]; 
    
    const referenceLeft = parseFloat(lastBlock.style.left);
    const referenceWidth = parseFloat(lastBlock.style.width);

    const currentLeft = parseFloat(movingBlock.style.left);
    const currentWidth = parseFloat(movingBlock.style.width);

    // Calculate Overlap and Miss 
    const offset = currentLeft - referenceLeft;
    let overlap = referenceWidth - Math.abs(offset);

    if (overlap <= 0 || currentWidth <= 5) {
        endGame();
        return;
    }
    
    const newWidth = overlap;
    
    let newLeft;
    if (offset > 0) {
        newLeft = currentLeft;
    } else {
        newLeft = referenceLeft;
    }
    
    // Create cut piece for visual effect
    if (Math.abs(offset) > 0) {
        createCutPiece(currentWidth, newWidth, newLeft, currentLeft, offset);
    }

    // Update current block
    movingBlock.style.width = newWidth + 'px';
    movingBlock.style.left = newLeft + 'px';
    
    blockWidth = newWidth;
    
    currentLevel++;
    scoreDisplay.textContent = currentLevel;
    
    blockSpeed = Math.min(blockSpeed + 0.2, 8); 
    
    tapArea.addEventListener('click', dropBlock, { once: true });
    createNewBlock();
}

// 6. Visual Cut Piece
function createCutPiece(oldW, newW, newL, currentL, offset) {
    const cutPiece = document.createElement('div');
    cutPiece.classList.add('block');
    
    const cutWidth = Math.abs(oldW - newW);
    cutPiece.style.width = cutWidth + 'px';
    cutPiece.style.height = BLOCK_HEIGHT + 'px';
    cutPiece.style.bottom = ((currentLevel + 1) * BLOCK_HEIGHT) + 'px';

    if (offset > 0) {
        cutPiece.style.left = currentL + 'px';
    } else {
        cutPiece.style.left = (newL + newW) + 'px';
    }

    cutPiece.style.transition = 'bottom 0.5s ease-in, opacity 0.5s';
    gameArea.appendChild(cutPiece);

    setTimeout(() => {
        cutPiece.style.bottom = '-100px'; 
        cutPiece.style.opacity = '0';
        setTimeout(() => cutPiece.remove(), 600);
    }, 50);
}

// 7. Game Over
function endGame() {
    isMoving = false;
    cancelAnimationFrame(animationId);
    
    finalScoreDisplay.textContent = currentLevel;
    gameOverScreen.style.display = 'flex';
    
    tapArea.removeEventListener('click', dropBlock);
}

// Start the game
startGame();