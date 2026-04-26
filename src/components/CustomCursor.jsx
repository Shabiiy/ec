import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const CustomCursor = () => {
    const cursorRef = useRef(null);
    const glowRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        const glow = glowRef.current;
        const canvas = canvasRef.current;

        if (!cursor || !glow || !canvas) return;

        // Canvas Setup
        const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        window.addEventListener('resize', handleResize, { passive: true });

        // Define global pause function expected by other components
        window.pauseSplashCursor = (paused) => {
            if (paused) {
                gsap.to([cursor, glow], { opacity: 0, duration: 0.2 });
            } else {
                gsap.to([cursor, glow], { opacity: 1, duration: 0.3 });
            }
        };

        // Position tracking
        const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const mouse = { x: pos.x, y: pos.y };
        let lastMouse = { x: pos.x, y: pos.y };

        // Optimized Particle System
        const particles = [];
        const maxParticles = 80;
        const colors = ['#6C6B3C', '#7F401C', '#CD8737', '#3D4022', '#063A51'];

        class Particle {
            constructor(x, y, vx, vy) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 6 + 3;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.speedX = vx * 0.15 + (Math.random() * 4 - 2);
                this.speedY = vy * 0.15 + (Math.random() * 4 - 2);
                this.life = 1;
                this.decay = Math.random() * 0.03 + 0.02;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.speedX *= 0.92; // Friction
                this.speedY *= 0.92;
                this.life -= this.decay;
                this.size *= 0.94; // Shrink
            }
            draw() {
                ctx.globalAlpha = Math.max(0, this.life);
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, Math.max(0, this.size), 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const updateMouse = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            
            // Emit particles based on velocity
            const dx = mouse.x - lastMouse.x;
            const dy = mouse.y - lastMouse.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist > 3) {
                const numParticles = Math.min(Math.floor(dist / 8), 4); // Capped to keep it lightweight
                for(let i = 0; i < numParticles; i++) {
                    if (particles.length < maxParticles) {
                        particles.push(new Particle(mouse.x, mouse.y, dx, dy));
                    } else {
                        // Reuse oldest particle to prevent memory garbage collection spikes
                        const p = particles.shift();
                        particles.push(new Particle(mouse.x, mouse.y, dx, dy));
                    }
                }
                lastMouse.x = mouse.x;
                lastMouse.y = mouse.y;
            }
        };

        window.addEventListener('mousemove', updateMouse, { passive: true });

        // Smooth follow logic using GSAP ticker
        const xSetCursor = gsap.quickSetter(cursor, "x", "px");
        const ySetCursor = gsap.quickSetter(cursor, "y", "px");
        const xSetGlow = gsap.quickSetter(glow, "x", "px");
        const ySetGlow = gsap.quickSetter(glow, "y", "px");

        const tick = () => {
            const dt = 1.0 - Math.pow(1.0 - 0.2, gsap.ticker.deltaRatio());
            pos.x += (mouse.x - pos.x) * dt;
            pos.y += (mouse.y - pos.y) * dt;

            xSetCursor(mouse.x - 2.5);
            ySetCursor(mouse.y - 2.5);
            xSetGlow(mouse.x - 17.5);
            ySetGlow(mouse.y - 17.5);

            // Render Particles
            ctx.clearRect(0, 0, width, height);
            for(let i = particles.length - 1; i >= 0; i--) {
                particles[i].update();
                particles[i].draw();
                if(particles[i].life <= 0 || particles[i].size <= 0.1) {
                    particles.splice(i, 1);
                }
            }
        };

        gsap.ticker.add(tick);

        // Hover effect logic
        const handleMouseEnter = () => {
            cursor.classList.add('hover');
            glow.classList.add('hover');
        };

        const handleMouseLeave = () => {
            cursor.classList.remove('hover');
            glow.classList.remove('hover');
        };

        const updateInteractions = () => {
            const elements = document.querySelectorAll('a, button, .pill, .gallery-item, .pc-card-wrapper, .minimal-submit');
            elements.forEach(el => {
                el.removeEventListener('mouseenter', handleMouseEnter);
                el.removeEventListener('mouseleave', handleMouseLeave);
                el.addEventListener('mouseenter', handleMouseEnter);
                el.addEventListener('mouseleave', handleMouseLeave);
            });
        };

        const observer = new MutationObserver(updateInteractions);
        observer.observe(document.body, { childList: true, subtree: true });
        updateInteractions();

        return () => {
            window.removeEventListener('mousemove', updateMouse);
            window.removeEventListener('resize', handleResize);
            gsap.ticker.remove(tick);
            observer.disconnect();
            delete window.pauseSplashCursor;
        };
    }, []);

    return (
        <>
            <canvas 
                ref={canvasRef} 
                style={{ 
                    pointerEvents: 'none', 
                    position: 'fixed', 
                    top: 0, left: 0, 
                    width: '100vw', height: '100vh', 
                    zIndex: 200001 
                }} 
            />
            <div ref={cursorRef} className="custom-cursor" style={{ zIndex: 200003 }}></div>
            <div ref={glowRef} className="cursor-glow" style={{ zIndex: 200002 }}></div>
        </>
    );
};

export default CustomCursor;
