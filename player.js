(function () {
  class Player {
    constructor({ id, name, team, x, y, isLocal = false }) {
      this.id = id;
      this.name = name || `Jugador ${id}`;
      this.team = team;
      this.x = x;
      this.y = y;
      this.vx = 0;
      this.vy = 0;
      this.radius = 20;
      this.speed = 0.55;
      this.maxSpeed = 5;
      this.kickPower = 8;
      this.isLocal = isLocal;
      this.kickCooldown = 0;
    }

    update(keys) {
      if (this.isLocal && keys) {
        let ax = 0;
        let ay = 0;
        if (keys.KeyW) ay -= this.speed;
        if (keys.KeyS) ay += this.speed;
        if (keys.KeyA) ax -= this.speed;
        if (keys.KeyD) ax += this.speed;

        this.vx += ax;
        this.vy += ay;
      }

      const speed = Math.hypot(this.vx, this.vy);
      if (speed > this.maxSpeed) {
        const factor = this.maxSpeed / speed;
        this.vx *= factor;
        this.vy *= factor;
      }

      this.x += this.vx;
      this.y += this.vy;
      window.Physics.applyFriction(this, window.Physics.FIELD_FRICTION);

      if (this.kickCooldown > 0) this.kickCooldown -= 1;
    }

    kick(ball) {
      if (this.kickCooldown > 0) return false;
      const dist = window.Physics.distance(this.x, this.y, ball.x, ball.y);
      if (dist > this.radius + ball.radius + 16) return false;

      const dx = ball.x - this.x;
      const dy = ball.y - this.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = dx / len;
      const ny = dy / len;

      ball.vx += nx * this.kickPower;
      ball.vy += ny * this.kickPower;
      this.kickCooldown = 16;
      return true;
    }

    draw(ctx) {
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = this.team === "red" ? "#ef4a57" : "#58a7ff";
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(this.name, this.x, this.y - this.radius - 10);
      ctx.restore();
    }
  }

  window.Player = Player;
})();
