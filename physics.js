(function () {
  const Physics = {
    FIELD_FRICTION: 0.988,
    BALL_FRICTION: 0.994,
    PLAYER_BOUNCE: 0.82,
    BALL_BOUNCE: 0.92,

    applyFriction(body, friction) {
      body.vx *= friction;
      body.vy *= friction;
      if (Math.abs(body.vx) < 0.005) body.vx = 0;
      if (Math.abs(body.vy) < 0.005) body.vy = 0;
    },

    distance(ax, ay, bx, by) {
      return Math.hypot(bx - ax, by - ay);
    },

    resolveCircleCollision(a, b, bounce = 0.95) {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.hypot(dx, dy) || 0.0001;
      const minDistance = a.radius + b.radius;

      if (distance >= minDistance) return;

      const nx = dx / distance;
      const ny = dy / distance;
      const overlap = minDistance - distance;

      a.x -= nx * overlap * 0.5;
      a.y -= ny * overlap * 0.5;
      b.x += nx * overlap * 0.5;
      b.y += ny * overlap * 0.5;

      const relativeVelocityX = b.vx - a.vx;
      const relativeVelocityY = b.vy - a.vy;
      const velocityAlongNormal = relativeVelocityX * nx + relativeVelocityY * ny;

      if (velocityAlongNormal > 0) return;

      const impulse = -(1 + bounce) * velocityAlongNormal / 2;
      const ix = impulse * nx;
      const iy = impulse * ny;

      a.vx -= ix;
      a.vy -= iy;
      b.vx += ix;
      b.vy += iy;
    },

    keepInsideField(body, field, bounce = 0.9) {
      if (body.x - body.radius < field.x) {
        body.x = field.x + body.radius;
        body.vx = Math.abs(body.vx) * bounce;
      }
      if (body.x + body.radius > field.x + field.width) {
        body.x = field.x + field.width - body.radius;
        body.vx = -Math.abs(body.vx) * bounce;
      }
      if (body.y - body.radius < field.y) {
        body.y = field.y + body.radius;
        body.vy = Math.abs(body.vy) * bounce;
      }
      if (body.y + body.radius > field.y + field.height) {
        body.y = field.y + field.height - body.radius;
        body.vy = -Math.abs(body.vy) * bounce;
      }
    },
  };

  window.Physics = Physics;
})();
