/**
 * Space Background — Animated Starfield with Nebula
 * Creates a full-screen canvas with floating stars, shooting stars, and nebula clouds
 */

(function () {
    'use strict';

    const canvas = document.getElementById('space-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    let stars = [];
    let shootingStars = [];
    let nebulae = [];
    let animFrame;

    const STAR_COUNT = 200;
    const SHOOTING_STAR_INTERVAL = 4000; // ms between shooting stars
    const NEBULA_COUNT = 5;

    // --- Resize ---
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    // --- Star class ---
    class Star {
        constructor() {
            this.reset();
            // Start at random position instead of center
            this.y = Math.random() * height;
        }

        reset() {
            this.x = Math.random() * width;
            this.y = -5;
            this.size = Math.random() * 2 + 0.3;
            this.speed = Math.random() * 0.3 + 0.05;
            this.opacity = Math.random() * 0.8 + 0.2;
            this.twinkleSpeed = Math.random() * 0.02 + 0.005;
            this.twinklePhase = Math.random() * Math.PI * 2;
            this.depth = Math.random(); // 0 = far, 1 = near (parallax)
            // Color tinting
            const colorChoice = Math.random();
            if (colorChoice < 0.7) {
                this.color = '255, 255, 255'; // white
            } else if (colorChoice < 0.85) {
                this.color = '180, 200, 255'; // blue-white
            } else if (colorChoice < 0.95) {
                this.color = '255, 220, 180'; // warm
            } else {
                this.color = '200, 180, 255'; // purple tint
            }
        }

        update(dt) {
            // Slowly drift downward (like drifting through space)
            this.y += this.speed * dt * 0.06;
            this._drawX = this.x;
            this._drawY = this.y;
            // Twinkle
            this.twinklePhase += this.twinkleSpeed * dt * 0.06;
            this._currentOpacity = this.opacity * (0.6 + 0.4 * Math.sin(this.twinklePhase));

            if (this.y > height + 10) {
                this.reset();
            }
        }

        draw() {
            const alpha = this._currentOpacity;
            ctx.beginPath();
            ctx.arc(this._drawX, this._drawY, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${alpha})`;
            ctx.fill();

            // Glow for bigger stars
            if (this.size > 1.2) {
                ctx.beginPath();
                ctx.arc(this._drawX, this._drawY, this.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.color}, ${alpha * 0.1})`;
                ctx.fill();
            }
        }
    }

    // --- Shooting Star class ---
    class ShootingStar {
        constructor() {
            this.reset();
        }

        reset() {
            this.active = false;
            this.x = 0;
            this.y = 0;
            this.length = 0;
            this.speed = 0;
            this.angle = 0;
            this.opacity = 0;
            this.life = 0;
            this.maxLife = 0;
        }

        activate() {
            this.active = true;
            this.x = Math.random() * width * 0.8;
            this.y = Math.random() * height * 0.4;
            this.length = Math.random() * 100 + 60;
            this.speed = Math.random() * 8 + 6;
            this.angle = (Math.random() * 0.5 + 0.2) * Math.PI; // going down-right
            this.opacity = 1;
            this.life = 0;
            this.maxLife = Math.random() * 40 + 30;
        }

        update(dt) {
            if (!this.active) return;
            const factor = dt * 0.06;
            this.x += Math.cos(this.angle) * this.speed * factor;
            this.y += Math.sin(this.angle) * this.speed * factor;
            this.life += factor;
            this.opacity = 1 - (this.life / this.maxLife);

            if (this.life >= this.maxLife || this.x > width + 50 || this.y > height + 50) {
                this.active = false;
            }
        }

        draw() {
            if (!this.active || this.opacity <= 0) return;
            const tailX = this.x - Math.cos(this.angle) * this.length;
            const tailY = this.y - Math.sin(this.angle) * this.length;

            const gradient = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
            gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
            gradient.addColorStop(1, `rgba(255, 255, 255, ${this.opacity})`);

            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Head glow
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fill();
        }
    }

    // --- Nebula class ---
    class Nebula {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.radius = Math.random() * 250 + 150;
            this.depth = Math.random() * 0.5;
            this.driftX = (Math.random() - 0.5) * 0.02;
            this.driftY = (Math.random() - 0.5) * 0.01;

            const colors = [
                { r: 80, g: 50, b: 180 },   // purple
                { r: 30, g: 70, b: 160 },   // blue
                { r: 120, g: 40, b: 140 },  // magenta
                { r: 20, g: 100, b: 160 },  // teal
                { r: 160, g: 50, b: 100 },  // pink
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.opacity = Math.random() * 0.04 + 0.02;
        }

        update(dt) {
            const factor = dt * 0.06;
            this.x += this.driftX * factor;
            this.y += this.driftY * factor;

            // Wrap around
            if (this.x < -this.radius) this.x = width + this.radius;
            if (this.x > width + this.radius) this.x = -this.radius;
            if (this.y < -this.radius) this.y = height + this.radius;
            if (this.y > height + this.radius) this.y = -this.radius;
        }

        draw() {
            const px = this.x;
            const py = this.y;

            const gradient = ctx.createRadialGradient(px, py, 0, px, py, this.radius);
            gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`);
            gradient.addColorStop(0.5, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity * 0.4})`);
            gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(px - this.radius, py - this.radius, this.radius * 2, this.radius * 2);
        }
    }

    // --- Initialize ---
    function init() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push(new Star());
        }

        shootingStars = [];
        for (let i = 0; i < 3; i++) {
            shootingStars.push(new ShootingStar());
        }

        nebulae = [];
        for (let i = 0; i < NEBULA_COUNT; i++) {
            nebulae.push(new Nebula());
        }
    }

    // --- Shooting star timer ---
    let lastShootingStar = 0;
    function maybeShootingStar(time) {
        if (time - lastShootingStar > SHOOTING_STAR_INTERVAL) {
            const inactive = shootingStars.find(s => !s.active);
            if (inactive) {
                inactive.activate();
                lastShootingStar = time;
            }
        }
    }

    // --- Animation Loop ---
    let lastTime = 0;
    function animate(time) {
        const dt = Math.min(time - lastTime, 50); // Cap delta
        lastTime = time;

        // Clear with a very slight trail for smoothness
        ctx.fillStyle = 'rgba(6, 6, 12, 0.3)';
        ctx.fillRect(0, 0, width, height);

        // Draw nebulae (background layer)
        nebulae.forEach(n => { n.update(dt); n.draw(); });

        // Draw stars
        stars.forEach(s => { s.update(dt); s.draw(); });

        // Shooting stars
        maybeShootingStar(time);
        shootingStars.forEach(s => { s.update(dt); s.draw(); });

        animFrame = requestAnimationFrame(animate);
    }

    // --- Initial clear & start ---
    ctx.fillStyle = '#06060c';
    ctx.fillRect(0, 0, width, height);
    init();

    // Use visibility API to pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animFrame);
        } else {
            lastTime = performance.now();
            animFrame = requestAnimationFrame(animate);
        }
    });

    animFrame = requestAnimationFrame(animate);

})();
