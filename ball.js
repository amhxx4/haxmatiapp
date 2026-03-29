(function () {
  class Ball {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = 0;
      this.vy = 0;
      this.radius = 13;
    }

    reset(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = (Math.random() - 0.5) * 2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      window.Physics.applyFriction(this, window.Physics.BALL_FRICTION);
    }

    draw(ctx) {
      ctx.save();
      const gradient = ctx.createRadialGradient(this.x - 4, this.y - 4, 3, this.x, this.y, this.radius);
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(1, "#d7e1ee");

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#71869e";
      ctx.stroke();
      ctx.restore();
    }
  }

  window.Ball = Ball;
})();
