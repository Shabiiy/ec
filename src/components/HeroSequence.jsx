import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TOTAL_FRAMES, globalImageCache } from './Preloader';

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────────────────────────────────────
// SEGMENT DEFINITION (0-indexed frame numbers)
// Segment 1 : frames  0 →  64  (user sees frames  1 →  65)
// Segment 2 : frames 64 → 121  (user sees frames 65 → 122)
// Segment 3 : frames 121 → 180 (user sees frames 122 → 181)
// Segment 4 : frames 180 → 240 (user sees frames 181 → 241)
// ─────────────────────────────────────────────────────────────────────────────
const SEGMENTS = [
    { start: 0,   end: 64  },
    { start: 64,  end: 121 },
    { start: 121, end: 180 },
    { start: 180, end: 240 },
];
const NUM_SEGMENTS = SEGMENTS.length;

// Snap points at each segment boundary (normalised 0 → 1)
const SNAP_POINTS = [0, 1 / 4, 2 / 4, 3 / 4, 1];

/**
 * Maps overall scroll progress (0 → 1) to a frame index.
 * Each segment occupies an equal 25 % of total scroll so that
 * locking / snapping at segment end-frames feels balanced.
 */
const progressToFrame = (progress) => {
    const scaled   = Math.min(Math.max(progress, 0), 1) * NUM_SEGMENTS;
    const segIndex = Math.min(Math.floor(scaled), NUM_SEGMENTS - 1);
    const segP     = scaled - segIndex;                    // 0 → 1 within segment
    const { start, end } = SEGMENTS[segIndex];
    return start + segP * (end - start);
};

// ─────────────────────────────────────────────────────────────────────────────

const HeroSequence = () => {
    const containerRef      = useRef(null);
    const canvasRef         = useRef(null);
    const targetFrame       = useRef(0);
    const currentFrame      = useRef(0);
    const text1Ref          = useRef(null);
    const haze1Ref          = useRef(null);
    const text2Ref          = useRef(null);
    const hazeRef           = useRef(null);
    const text3Ref          = useRef(null);
    const lastTime          = useRef(performance.now());
    const idleTimer         = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx    = canvas.getContext('2d', { alpha: false, desynchronized: true });
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // ── Helpers ──────────────────────────────────────────────────────────

        const getDrawParams = (img) => {
            const hRatio = canvas.width  / img.width;
            const vRatio = canvas.height / img.height;
            const ratio  = Math.max(hRatio, vRatio);
            return {
                ratio,
                shiftX : (canvas.width  - img.width  * ratio) / 2,
                shiftY : (canvas.height - img.height * ratio) / 2,
                w: img.width,
                h: img.height,
            };
        };

        /**
         * Renders `frame` with sub-frame blending between base and next.
         */
        const renderFrame = (frame) => {
            const base  = Math.floor(frame);
            const next  = Math.min(base + 1, TOTAL_FRAMES - 1);
            const alpha = frame - base;

            const imgBase = globalImageCache[base];
            const imgNext = globalImageCache[next];

            if (!imgBase?.complete) return;

            const b = getDrawParams(imgBase);
            ctx.globalAlpha = 1;
            ctx.drawImage(imgBase, 0, 0, b.w, b.h, b.shiftX, b.shiftY, b.w * b.ratio, b.h * b.ratio);

            // Blend next frame for smooth interpolation
            if (alpha > 0.005 && imgNext?.complete) {
                const n = getDrawParams(imgNext);
                ctx.globalAlpha = alpha;
                ctx.drawImage(imgNext, 0, 0, n.w, n.h, n.shiftX, n.shiftY, n.w * n.ratio, n.h * n.ratio);
            }
        };

        // ── Canvas resize ────────────────────────────────────────────────────

        const resizeCanvas = () => {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
            renderFrame(currentFrame.current);
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // ── Visibility guard (saves GPU when hero is off-screen) ─────────────

        let isVisible = true;
        const observer = new IntersectionObserver(
            ([entry]) => { isVisible = entry.isIntersecting; },
            { threshold: 0 }
        );
        observer.observe(containerRef.current);

        // ── RAF lerp loop ────────────────────────────────────────────────────

        let rafId;
        const animate = (now) => {
            const dt    = now - lastTime.current;
            lastTime.current = now;

            const delta = targetFrame.current - currentFrame.current;

            if (isVisible && Math.abs(delta) > 0.005) {
                // Adaptive lerp — tighter when far, smooth near target
                const speed = 0.18 * (dt / 16.67);
                let step    = delta * Math.min(speed, 1);

                // Hard cap to prevent skipping more than 2 frames per tick
                step = Math.max(-2, Math.min(2, step));

                currentFrame.current += step;
                renderFrame(currentFrame.current);
            }

            rafId = requestAnimationFrame(animate);
        };
        rafId = requestAnimationFrame(animate);

        // Poll until first frame is decoded and ready
        const checkInitial = setInterval(() => {
            if (globalImageCache[0]?.complete) {
                renderFrame(0);
                clearInterval(checkInitial);
            }
        }, 100);

        // ── GSAP ScrollTrigger ───────────────────────────────────────────────
        //
        //  • 4 scroll lengths (400 %) — one per segment
        //  • Scrub: 1 → smooth but responsive
        //  • Snap at [0, 0.25, 0.5, 0.75, 1] → locks at each segment boundary
        //  • onUpdate maps progress through progressToFrame()

        let ctxAnim = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    id      : 'hero-trigger',
                    trigger : containerRef.current,
                    start   : 'top top',
                    end     : '+=400%',
                    pin     : true,
                    scrub   : 1,
                    snap    : {
                        snapTo   : SNAP_POINTS,
                        duration : { min: 0.5, max: 1.0 },
                        delay    : 0.05,
                        ease     : 'power2.inOut',
                    },
                    onUpdate: (self) => {
                        // Segment-aware frame mapping
                        targetFrame.current = progressToFrame(self.progress);

                        if (window.pauseSplashCursor) window.pauseSplashCursor(true);
                        if (idleTimer.current) clearTimeout(idleTimer.current);
                        idleTimer.current = setTimeout(() => {
                            if (window.pauseSplashCursor) window.pauseSplashCursor(false);
                        }, 150);
                    },
                    onToggle: (self) => {
                        if (!self.isActive && window.pauseSplashCursor) {
                            window.pauseSplashCursor(false);
                        }
                    },
                },
            });

            // ── Text choreography ────────────────────────────────────────────
            //  Positions are in tl progress (0 → 1), matching segment snap points.

            // Text 1 — visible on load, exits before snap point 1 (0.25)
            gsap.set([text1Ref.current, haze1Ref.current], { opacity: 1, y: 0 });
            tl.to([text1Ref.current, haze1Ref.current],
                { opacity: 0, y: -40, duration: 0.08, ease: 'power2.in' },
                0.05          // fades while still in segment 1
            );

            // Text 2 — rises in during segment 2, exits during segment 3
            gsap.set([text2Ref.current, hazeRef.current], { opacity: 0, y: 40 });
            tl.to([text2Ref.current, hazeRef.current],
                { opacity: 1, y: 0, duration: 0.08, ease: 'power2.out' },
                0.30          // enters around segment 2 midpoint
            );
            tl.to([text2Ref.current, hazeRef.current],
                { opacity: 0, y: -40, duration: 0.08, ease: 'power2.in' },
                0.58          // exits before segment 3 snap
            );

            // Text 3 (About Us) — fades in at end of segment 4
            gsap.set(text3Ref.current, { opacity: 0, y: 20 });
            tl.to(text3Ref.current,
                { opacity: 1, y: 0, duration: 0.04, ease: 'power2.out' },
                0.95
            );
        }, containerRef);

        // ── Cleanup ──────────────────────────────────────────────────────────

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(rafId);
            clearInterval(checkInitial);
            observer.disconnect();
            ctxAnim.revert();
            if (idleTimer.current) clearTimeout(idleTimer.current);
            if (window.pauseSplashCursor) window.pauseSplashCursor(false);
        };
    }, []);

    return (
        <section
            ref={containerRef}
            className="hero-canvas-sequence"
            style={{
                position       : 'relative',
                width          : '100%',
                minHeight      : '100vh',
                backgroundColor: '#000',
                overflow       : 'hidden',
                contain        : 'layout paint',
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    display        : 'block',
                    width          : '100vw',
                    height         : '100vh',
                    backgroundColor: '#000',
                    willChange     : 'transform',
                    transform      : 'translateZ(0)',
                    contain        : 'strict',
                }}
            />

            {/* Segment 1 overlay — "Building with nature" */}
            <div className="abs-text top-right">
                <div className="branding-block">
                    <div ref={haze1Ref} className="text-haze" />
                    <h1 ref={text1Ref} className="sequence-title small color-green">
                        Building with nature,<br />Crafting the future
                    </h1>
                </div>
            </div>

            {/* Segment 2 overlay — "Where Space Breathe" */}
            <div className="abs-text center-middle">
                <div ref={hazeRef} className="text-haze" />
                <h2 ref={text2Ref} className="sequence-title color-brown">
                    Where Space Breathe,<br />and souls belong
                </h2>
            </div>

            {/* Segment 4 overlay — "About Us" */}
            <div className="abs-text bottom-right">
                <div ref={text3Ref} className="about-block" style={{ position: 'relative' }}>
                    <h3 className="about-title" style={{ color: '#E6D6BC' }}>About Us</h3>
                    <p className="about-desc" style={{ color: '#E6D6BC' }}>
                        Earthcraft is a design and construction studio focused on creating sustainable,
                        low-impact homes and lifestyle spaces. It combines thoughtful design,
                        functionality, and wellness to shape modern living environments. The brand
                        guides clients toward eco-conscious choices while emphasizing comfort and
                        community. With a strong commitment to sustainability, Earthcraft aims to
                        redefine how style and responsibility coexist.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default HeroSequence;
