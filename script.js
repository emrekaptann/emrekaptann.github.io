// =============================================
// NETWORK / CONSTELLATION PARTICLE BACKGROUND
// Görseldeki gibi: birbirine çizgiyle bağlı
// noktalar + mouse'a tam tepki
// =============================================
(function () {
    const canvas = document.getElementById('particleCanvas');
    const ctx    = canvas.getContext('2d');

    // --- Ayarlar ---
    const CONFIG = {
        count        : 180,       // Parçacık sayısı
        maxDist      : 180,       // Bağlantı çizgisi için max mesafe (px)
        mouseRadius  : 200,       // Mouse etki alanı (px)
        mouseForce   : 6,         // İtme kuvveti
        speed        : 0.55,      // Temel hareket hızı
        dotMinR      : 1.8,       // Min nokta boyutu
        dotMaxR      : 3.5,       // Max nokta boyutu
        // Turuncu palet
        dotColor     : 'rgba(249,115,22,',
        lineColor    : 'rgba(249,115,22,',
        mouseGlowR   : 240,
    };

    let W, H;
    let mouse = { x: -9999, y: -9999, active: false };
    let particles = [];

    // --- Canvas boyutlandırma (viewport'a sabitli) ---
    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    // --- Parçacık sınıfı ---
    class Node {
        constructor() {
            this.init();
        }
        init() {
            this.x  = Math.random() * W;
            this.y  = Math.random() * H;
            this.vx = (Math.random() - 0.5) * CONFIG.speed;
            this.vy = (Math.random() - 0.5) * CONFIG.speed;
            this.r  = CONFIG.dotMinR + Math.random() * (CONFIG.dotMaxR - CONFIG.dotMinR);
            this.alpha = 0.55 + Math.random() * 0.4;
        }
        update() {
            // Mouse itme kuvveti
            if (mouse.active) {
                const dx   = this.x - mouse.x;
                const dy   = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONFIG.mouseRadius && dist > 0) {
                    const force  = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
                    const angle  = Math.atan2(dy, dx);
                    const push   = force * force * CONFIG.mouseForce;
                    this.vx += Math.cos(angle) * push * 0.08;
                    this.vy += Math.sin(angle) * push * 0.08;
                }
            }

            // Hız sınırla
            const maxSpeed = CONFIG.speed * 3;
            const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (spd > maxSpeed) {
                this.vx = (this.vx / spd) * maxSpeed;
                this.vy = (this.vy / spd) * maxSpeed;
            }

            // Hareket et
            this.x += this.vx;
            this.y += this.vy;

            // Yavaşla (sürtünme)
            this.vx *= 0.97;
            this.vy *= 0.97;

            // Kenarlarda yansı (wrap-around)
            if (this.x < -10) this.x = W + 10;
            if (this.x > W + 10) this.x = -10;
            if (this.y < -10) this.y = H + 10;
            if (this.y > H + 10) this.y = -10;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = CONFIG.dotColor + this.alpha + ')';
            ctx.fill();
        }
    }

    // --- Başlat ---
    function init() {
        particles = [];
        for (let i = 0; i < CONFIG.count; i++) {
            particles.push(new Node());
        }
    }

    // --- Çizgi bağlantıları ---
    function drawEdges() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx   = particles[i].x - particles[j].x;
                const dy   = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONFIG.maxDist) {
                    // Uzaktakiler daha şeffaf
                    const alpha = (1 - dist / CONFIG.maxDist) * 0.65;
                    ctx.beginPath();
                    ctx.strokeStyle = CONFIG.lineColor + alpha + ')';
                    ctx.lineWidth   = 0.7;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    // --- Mouse glow ---
    function drawMouseGlow() {
        if (!mouse.active) return;
        const r    = CONFIG.mouseGlowR;
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, r);
        grad.addColorStop(0,   'rgba(249,115,22,0.12)');
        grad.addColorStop(0.4, 'rgba(249,115,22,0.05)');
        grad.addColorStop(1,   'rgba(249,115,22,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Mouse'a yakın noktalarla da çizgi bağ
        particles.forEach(p => {
            const dx   = p.x - mouse.x;
            const dy   = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONFIG.mouseRadius * 1.2) {
                const alpha = (1 - dist / (CONFIG.mouseRadius * 1.2)) * 0.75;
                ctx.beginPath();
                ctx.strokeStyle = `rgba(251,146,60,${alpha})`;
                ctx.lineWidth   = 0.9;
                ctx.moveTo(mouse.x, mouse.y);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
            }
        });
    }

    // --- Ana döngü ---
    function animate() {
        ctx.clearRect(0, 0, W, H);
        drawMouseGlow();
        drawEdges();
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }

    // --- Olaylar ---
    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    });
    window.addEventListener('mouseleave', () => {
        mouse.active = false;
    });
    window.addEventListener('resize', () => {
        resize();
        init();
    });

    resize();
    init();
    animate();
})();

// =============================================
// CURSOR GLOW EFFECT
// =============================================
const cursorGlow = document.getElementById('cursorGlow');
window.addEventListener('mousemove', (e) => {
    cursorGlow.style.left    = e.clientX + 'px';
    cursorGlow.style.top     = e.clientY + 'px';
    cursorGlow.style.opacity = '0.2';
});
window.addEventListener('mouseleave', () => {
    cursorGlow.style.opacity = '0';
});

// =============================================
// NAVBAR SCROLL EFFECT
// =============================================
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// =============================================
// ACTIVE NAV LINK TRACKING
// =============================================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 200) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// =============================================
// SMOOTH SCROLL FOR NAV LINKS
// =============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});
