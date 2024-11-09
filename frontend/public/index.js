const screen = document.getElementById('screen');
const context = screen.getContext('2d')

const ballImage = new Image();
ballImage.src = './assets/ball3.png';

ballImage.onload = function() {
  renderScreen();
};

const state = {
  players: {
    'player1': {
      x: 0,
      y: 110,
      width: 40,
      height: 10,
      horizontal: true
    }
  },
  balls: {
    'balls1': { 
      x: 250,
      y: 250 ,
      dx: (Math.random() - 0.5) * 3,
      dy: (Math.random() - 0.5) * 3,
      radius: 8,
    }
  },
  screen: {
      width: 600,
      height: 400
  },
  fieldLines: {
    topLeft: { x1: 0, y1: 100, x2: 200, y2: 100 },
    topRight: { x1: 400, y1: 100, x2: 600, y2: 100 },
    bottomLeft: { x1: 0, y1: 300, x2: 200, y2: 300 },
    bottomRight: { x1: 400, y1: 300, x2: 600, y2: 300 }
  }
}



document.addEventListener('keydown', handleKeydown);

function handleKeydown(event) {
  const keyPressed = event.key;

  if (keyPressed === 'ArrowLeft') {
    if (state.players.player1.horizontal) {
      if (state.players.player1.x === 0) return
      state.players.player1.x -= 10;
      return;
    }
  
    state.players.player1.y += 10;
    if (state.players.player1.y >= 90) {
      state.players.player1.horizontal = true;
      state.players.player1.y += 20
      state.players.player1.x -= 50
    }
  }
  
  if (keyPressed === 'ArrowRight') {
    if (!state.players.player1.horizontal) {
      if (state.players.player1.y === 0) return
      state.players.player1.y -= 10;
      return;
    }

    state.players.player1.x += 10;
    if (state.players.player1.x >= 190) {
      state.players.player1.horizontal = false;
      state.players.player1.y -= 30
      state.players.player1.x += 40
    }

  }
}


function renderScreen() {
  context.clearRect(0, 0, screen.width, screen.height);

  for(const playerId in state.players) {
    const player = state.players[playerId]

    context.save();

    context.translate(player.x, player.y);

    if (!state.players.player1.horizontal) context.rotate(Math.PI / 2);

    context.fillStyle = 'black';
    //context.fillRect(player.x, player.y, player.width, player.height);
    context.fillRect(-player.width / 2 + 20, -player.height / 2 + 10, player.width, player.height);

    context.angle = 5
  
    context.restore();
  }

  for(const ballId in state.balls) {
    const ball = state.balls[ballId]

    context.drawImage(ballImage, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
/* 
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fillStyle = "red";
    context.fill();
    context.closePath(); */

    if (ball.x + ball.dx > screen.width - ball.radius || ball.x + ball.dx < ball.radius) {
      ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy > screen.height - ball.radius || ball.y + ball.dy < ball.radius) {
      ball.dy = -ball.dy;
    }


    ball.x += ball.dx;
    ball.y += ball.dy;

  }



  drawFieldLines();

  requestAnimationFrame(() => {
    renderScreen()
  })
  
}

function drawFieldLines() {
  context.beginPath();
  context.moveTo(0, 100);
  context.lineTo(200, 100);
  context.lineTo(200, 0);
  context.strokeStyle = '#dfdfdf';
  context.lineWidth = 3;
  context.stroke();
  context.closePath();

  context.beginPath();
  context.moveTo(600, 100);
  context.lineTo(400, 100);
  context.lineTo(400, -600);
  context.strokeStyle = '#dfdfdf';
  context.lineWidth = 3;
  context.stroke();
  context.closePath();

  context.beginPath();
  context.moveTo(0, 300);
  context.lineTo(200, 300);
  context.lineTo(200, 400);
  context.strokeStyle = '#dfdfdf';
  context.lineWidth = 3;
  context.stroke();
  context.closePath();

  context.beginPath();
  context.moveTo(600, 300);
  context.lineTo(400, 300);
  context.lineTo(400, 400);
  context.strokeStyle = '#dfdfdf';
  context.lineWidth = 3;
  context.stroke();
  context.closePath();

}

  renderScreen();



