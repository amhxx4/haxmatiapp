(function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const field = {
    x: 40,
    y: 40,
    width: canvas.width - 80,
    height: canvas.height - 80,
    goalHeight: 190,
  };

  const gameState = {
    mode: "menu",
    room: null,
    teams: { red: 0, blue: 0 },
    timeLeft: 180,
    players: [],
    keys: {},
  };

  const ui = new window.UI();
  const ball = new window.Ball(canvas.width / 2, canvas.height / 2);

  function createLocalMatch() {
    const name = ui.getPlayerName();
    gameState.players = [
      new window.Player({ id: 1, name, team: "red", x: field.x + 160, y: canvas.height / 2, isLocal: true }),
      new window.Player({ id: 2, name: "Bot Azul", team: "blue", x: field.x + field.width - 160, y: canvas.height / 2 }),
    ];

    gameState.teams.red = 0;
    gameState.teams.blue = 0;
    gameState.timeLeft = 180;
    ball.reset(canvas.width / 2, canvas.height / 2);
    gameState.mode = "playing";
    ui.updateScore(0, 0);
    ui.updateTimer(gameState.timeLeft);
    ui.setMenuMessage("Partido local iniciado. Usa WASD y ESPACIO para patear.");
    ui.addChatMessage("Sistema", "Partido iniciado. Equipo Rojo vs Equipo Azul.");
  }

  function createRoom() {
    gameState.room = `sala-${Math.floor(Math.random() * 9999)}`;
    ui.setMenuMessage(`Sala creada: ${gameState.room} (simulación local).`);
    ui.addChatMessage("Sistema", `Has creado ${gameState.room}.`);
  }

  function joinRoom() {
    if (!gameState.room) {
      ui.setMenuMessage("No hay sala activa. Crea una sala primero.");
      return;
    }
    ui.setMenuMessage(`Te uniste a ${gameState.room}. Equipo asignado: Rojo.`);
    ui.addChatMessage("Sistema", `Unido a ${gameState.room}.`);
  }

  function showSettings() {
    ui.setMenuMessage("Ajustes: física suave, estadio clásico, duración 3 minutos.");
  }

  function showControls() {
    ui.setMenuMessage("Controles: WASD para mover, ESPACIO para patear.");
  }

  document.getElementById("playBtn").addEventListener("click", createLocalMatch);
  document.getElementById("createRoomBtn").addEventListener("click", createRoom);
  document.getElementById("joinRoomBtn").addEventListener("click", joinRoom);
  document.getElementById("settingsBtn").addEventListener("click", showSettings);
  document.getElementById("controlsBtn").addEventListener("click", showControls);

  ui.onChatSubmit((text) => {
    const local = gameState.players.find((p) => p.isLocal);
    ui.addChatMessage(local ? local.name : "Tú", text);
  });

  window.addEventListener("keydown", (event) => {
    gameState.keys[event.code] = true;
    if (event.code === "Space") {
      const local = gameState.players.find((p) => p.isLocal);
      if (local && gameState.mode === "playing") {
        local.kick(ball);
      }
    }
  });

  window.addEventListener("keyup", (event) => {
    gameState.keys[event.code] = false;
  });

  function updateBot(bot) {
    const dx = ball.x - bot.x;
    const dy = ball.y - bot.y;
    const dist = Math.hypot(dx, dy) || 1;
    bot.vx += (dx / dist) * 0.3;
    bot.vy += (dy / dist) * 0.3;

    if (dist < bot.radius + ball.radius + 20) {
      bot.kick(ball);
    }
  }

  function handleGoal() {
    const goalTop = canvas.height / 2 - field.goalHeight / 2;
    const goalBottom = canvas.height / 2 + field.goalHeight / 2;
    const inGoalRange = ball.y > goalTop && ball.y < goalBottom;

    if (!inGoalRange) return;

    if (ball.x - ball.radius <= field.x) {
      gameState.teams.blue += 1;
      ui.updateScore(gameState.teams.red, gameState.teams.blue);
      ui.addChatMessage("Sistema", "¡Gol del equipo Azul!");
      ball.reset(canvas.width / 2, canvas.height / 2);
    }

    if (ball.x + ball.radius >= field.x + field.width) {
      gameState.teams.red += 1;
      ui.updateScore(gameState.teams.red, gameState.teams.blue);
      ui.addChatMessage("Sistema", "¡Gol del equipo Rojo!");
      ball.reset(canvas.width / 2, canvas.height / 2);
    }
  }

  function update() {
    if (gameState.mode === "playing") {
      gameState.players.forEach((player) => {
        if (!player.isLocal) updateBot(player);
        player.update(gameState.keys);
        window.Physics.keepInsideField(player, field, window.Physics.PLAYER_BOUNCE);
      });

      window.Physics.resolveCircleCollision(
        gameState.players[0],
        gameState.players[1],
        window.Physics.PLAYER_BOUNCE
      );

      gameState.players.forEach((player) => {
        window.Physics.resolveCircleCollision(player, ball, window.Physics.BALL_BOUNCE);
      });

      ball.update();
      window.Physics.keepInsideField(ball, field, window.Physics.BALL_BOUNCE);
      handleGoal();

      if (gameState.timeLeft > 0 && frameCount % 60 === 0) {
        gameState.timeLeft -= 1;
        ui.updateTimer(gameState.timeLeft);
      }

      if (gameState.timeLeft <= 0) {
        gameState.mode = "menu";
        ui.addChatMessage("Sistema", "Partido terminado. Presiona Jugar para reiniciar.");
        ui.setMenuMessage("Partido finalizado. Puedes iniciar otro desde Jugar.");
      }
    }
  }

  function drawField() {
    const camTarget = gameState.players.find((p) => p.isLocal) || { x: canvas.width / 2, y: canvas.height / 2 };
    const offsetX = (camTarget.x - canvas.width / 2) * 0.06;
    const offsetY = (camTarget.y - canvas.height / 2) * 0.06;

    ctx.save();
    ctx.translate(-offsetX, -offsetY);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#16863d";
    ctx.fillRect(field.x, field.y, field.width, field.height);

    ctx.strokeStyle = "rgba(255,255,255,0.86)";
    ctx.lineWidth = 4;
    ctx.strokeRect(field.x, field.y, field.width, field.height);

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, field.y);
    ctx.lineTo(canvas.width / 2, field.y + field.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 92, 0, Math.PI * 2);
    ctx.stroke();

    const goalTop = canvas.height / 2 - field.goalHeight / 2;
    ctx.fillStyle = "rgba(220,235,255,0.42)";
    ctx.fillRect(field.x - 10, goalTop, 10, field.goalHeight);
    ctx.fillRect(field.x + field.width, goalTop, 10, field.goalHeight);

    gameState.players.forEach((player) => player.draw(ctx));
    ball.draw(ctx);

    ctx.restore();
  }

  let frameCount = 0;
  function loop() {
    frameCount += 1;
    update();
    drawField();
    requestAnimationFrame(loop);
  }

  ui.setMenuMessage("Bienvenido a HaxMati App. Crea una sala o inicia un partido local.");
  ui.addChatMessage("Sistema", "¡Bienvenido! Esta versión corre totalmente en navegador.");
  loop();
})();
