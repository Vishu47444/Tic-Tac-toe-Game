let boxes = document.querySelectorAll(".box");
let resetBtn = document.querySelector("#reset-btn");
let newGameBtn = document.querySelector("#new-btn");
let msgContainer = document.querySelector(".msg-container");
let msg = document.querySelector("#msg");
let heading = document.querySelector("#heading");

let turnO = true; //playerX, playerO
let count = 0; //To Track Draw
let gameActive = true;

const winPatterns = [
  [0, 1, 2],
  [0, 3, 6],
  [0, 4, 8],
  [1, 4, 7],
  [2, 5, 8],
  [2, 4, 6],
  [3, 4, 5],
  [6, 7, 8],
];

// Sound effects using Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const playSound = (frequency, duration, type = 'sine') => {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

// Create particle effect
const createParticles = (x, y, color) => {
  const particleCount = 12;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'absolute';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.width = '6px';
    particle.style.height = '6px';
    particle.style.backgroundColor = color;
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '1000';
    
    document.body.appendChild(particle);
    
    const angle = (i * 360 / particleCount) * Math.PI / 180;
    const velocity = 100 + Math.random() * 50;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    
    let posX = x;
    let posY = y;
    let opacity = 1;
    
    const animate = () => {
      posX += vx * 0.02;
      posY += vy * 0.02;
      opacity -= 0.02;
      
      particle.style.left = posX + 'px';
      particle.style.top = posY + 'px';
      particle.style.opacity = opacity;
      
      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        document.body.removeChild(particle);
      }
    };
    
    requestAnimationFrame(animate);
  }
};

// Update current player indicator
const updatePlayerIndicator = () => {
  heading.textContent = `Tic Tac Toe - Player ${turnO ? 'O' : 'X'}'s Turn`;
  heading.style.color = turnO ? '#3498db' : '#e74c3c';
};

const resetGame = () => {
  turnO = true;
  count = 0;
  gameActive = true;
  enableBoxes();
  msgContainer.classList.add("hide");
  updatePlayerIndicator();
  playSound(440, 0.2);
  
  // Add reset animation
  document.querySelector('.game').style.animation = 'none';
  setTimeout(() => {
    document.querySelector('.game').style.animation = 'slideIn 0.8s ease-out';
  }, 10);
};

boxes.forEach((box, index) => {
  box.addEventListener("click", () => {
    if (!gameActive) return;
    
    const rect = box.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    if (turnO) {
      //playerO
      box.innerText = "O";
      box.classList.add("player-o");
      box.classList.add("clicked");
      playSound(523, 0.15); // C5 note
      createParticles(x, y, '#3498db');
      turnO = false;
    } else {
      //playerX
      box.innerText = "X";
      box.classList.add("player-x");
      box.classList.add("clicked");
      playSound(659, 0.15); // E5 note
      createParticles(x, y, '#e74c3c');
      turnO = true;
    }
    
    box.disabled = true;
    count++;
    updatePlayerIndicator();

    let isWinner = checkWinner();

    if (count === 9 && !isWinner) {
      setTimeout(gameDraw, 500);
    }
  });
  
  // Add hover sound effect
  box.addEventListener("mouseenter", () => {
    if (!box.disabled && gameActive) {
      playSound(800, 0.05);
    }
  });
});

const gameDraw = () => {
  msg.innerHTML = `🤝 Game was a Draw! 🤝`;
  msgContainer.classList.remove("hide");
  gameActive = false;
  playSound(220, 0.5, 'triangle');
  
  // Add confetti effect for draw
  setTimeout(() => {
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const x = Math.random() * window.innerWidth;
        const y = -10;
        createParticles(x, y, `hsl(${Math.random() * 360}, 70%, 60%)`);
      }, i * 100);
    }
  }, 500);
};

const disableBoxes = () => {
  for (let box of boxes) {
    box.disabled = true;
  }
};

const enableBoxes = () => {
  for (let box of boxes) {
    box.disabled = false;
    box.innerText = "";
    box.classList.remove("player-x", "player-o", "clicked");
  }
};

const showWinner = (winner) => {
  const emoji = winner === 'X' ? '🎉' : '🎊';
  msg.innerHTML = `${emoji} Congratulations! Player ${winner} Wins! ${emoji}`;
  msgContainer.classList.remove("hide");
  gameActive = false;
  disableBoxes();
  
  // Play victory sound
  playSound(523, 0.2);
  setTimeout(() => playSound(659, 0.2), 200);
  setTimeout(() => playSound(784, 0.3), 400);
  
  // Create celebration particles
  setTimeout(() => {
    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        const x = Math.random() * window.innerWidth;
        const y = -10;
        const colors = ['#f39c12', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6'];
        createParticles(x, y, colors[Math.floor(Math.random() * colors.length)]);
      }, i * 50);
    }
  }, 500);
};

const checkWinner = () => {
  for (let pattern of winPatterns) {
    let pos1Val = boxes[pattern[0]].innerText;
    let pos2Val = boxes[pattern[1]].innerText;
    let pos3Val = boxes[pattern[2]].innerText;

    if (pos1Val != "" && pos2Val != "" && pos3Val != "") {
      if (pos1Val === pos2Val && pos2Val === pos3Val) {
        // Highlight winning combination
        pattern.forEach(index => {
          boxes[index].style.background = 'linear-gradient(145deg, #f39c12, #e67e22)';
          boxes[index].style.transform = 'scale(1.1)';
          boxes[index].style.boxShadow = '0 0 20px rgba(243, 156, 18, 0.6)';
        });
        
        setTimeout(() => showWinner(pos1Val), 300);
        return true;
      }
    }
  }
  return false;
};

// Add keyboard support
document.addEventListener('keydown', (e) => {
  if (!gameActive) return;
  
  const keyMap = {
    '1': 0, '2': 1, '3': 2,
    '4': 3, '5': 4, '6': 5,
    '7': 6, '8': 7, '9': 8
  };
  
  if (keyMap.hasOwnProperty(e.key)) {
    const box = boxes[keyMap[e.key]];
    if (!box.disabled) {
      box.click();
    }
  }
  
  if (e.key === 'r' || e.key === 'R') {
    resetGame();
  }
});

// Initialize game
updatePlayerIndicator();

// Add button event listeners
newGameBtn.addEventListener("click", resetGame);
resetBtn.addEventListener("click", resetGame);

// Add welcome animation
window.addEventListener('load', () => {
  playSound(440, 0.3);
  setTimeout(() => playSound(523, 0.3), 150);
  setTimeout(() => playSound(659, 0.4), 300);
});