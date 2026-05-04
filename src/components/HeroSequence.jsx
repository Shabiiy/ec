import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TOTAL_FRAMES, globalImageCache } from './Preloader';

gsap.registerPlugin(ScrollTrigger);

const HeroSequence = () => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    
    // Performance & Smoothness State
    const targetFrame = useRef(0);
    const currentFrame = useRef(0);
    const text1Ref = useRef(null);
    const haze1Ref = useRef(null);
    const text2Ref = useRef(null);
    const hazeRef = useRef(null);
    const text3Ref = useRef(null);
    const lastTime = useRef(performance.now());
    const lastRenderedBase = useRef(-1);
    const idleTimer = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { 
            alpha: false,
            desynchronized: true
        });
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        

        const getDrawParams = (img) => {
            const hRatio = canvas.width / img.width;
            const vRatio = canvas.height / img.height;
            const ratio = Math.max(hRatio, vRatio);
            return {
                ratio,
                shiftX: (canvas.width - img.width * ratio) / 2,
                shiftY: (canvas.height - img.height * ratio) / 2,
                w: img.width,
                h: img.height
            };
        };

        const renderFrames = (frame) => {
            const base = Math.floor(frame);
            const next = Math.min(base + 1, TOTAL_FRAMES - 1);
            const alpha = frame - base;

            const imgBase = globalImageCache[base];
            const imgNext = globalImageCache[next];

            if (!imgBase || !imgBase.complete) return;

            // Render Base Frame
            const b = getDrawParams(imgBase);
            ctx.globalAlpha = 1;
            ctx.drawImage(imgBase, 0, 0, b.w, b.h, b.shiftX, b.shiftY, b.w * b.ratio, b.h * b.ratio);

            // Blend Next Frame if available and ready
            if (alpha > 0.01 && imgNext && imgNext.complete) {
                const n = getDrawParams(imgNext);
                ctx.globalAlpha = alpha;
                ctx.drawImage(imgNext, 0, 0, n.w, n.h, n.shiftX, n.shiftY, n.w * n.ratio, n.h * n.ratio);
            }
            
            lastRenderedBase.current = base;
        };


        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            lastRenderedBase.current = -1;
            renderFrames(currentFrame.current);
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Visibility tracking to pause animation when off-screen
        let isVisible = true;
        const observer = new IntersectionObserver(([entry]) => {
            isVisible = entry.isIntersecting;
        }, { threshold: 0 });
        observer.observe(containerRef.current);

        let rafId;
        const animate = (now) => {
            if (!isVisible) {
                rafId = requestAnimationFrame(animate);
                return;
            }

            const dt = now - lastTime.current;
            lastTime.current = now;

            const deltaProgress = targetFrame.current - currentFrame.current;
            if (Math.abs(deltaProgress) > 0.0001) {
                // Dynamic speed: faster when further away to handle rapid multiple scrolls
                const baseSpeed = 0.3 * (dt / 16.67);
                let step = deltaProgress * Math.min(baseSpeed, 1);
                
                // Cap the maximum frame jump but allow higher values for faster scrolls
                // This makes it feel smoother and more responsive during heavy scrolling
                if (step > 3.5) step = 3.5;
                if (step < -3.5) step = -3.5;

                currentFrame.current += step;
                renderFrames(currentFrame.current);
            }
            
            rafId = requestAnimationFrame(animate);
        };
        rafId = requestAnimationFrame(animate);

        // Initial render check: Ensure frame 0 is drawn as soon as it's available
        const checkInitialFrame = setInterval(() => {
            if (globalImageCache[0] && globalImageCache[0].complete) {
                renderFrames(0);
                clearInterval(checkInitialFrame);
            }
        }, 100);

        let ctxAnim = gsap.context(() => {
            const frameObj = { frame: 0 };
            
            const tl = gsap.timeline({
                scrollTrigger: {
                    id: 'hero-trigger',
                    trigger: containerRef.current,
                    start: 'top top',
                    end: '+=4000%', // 4000% to provide plenty of scroll space for 4 smooth segments
                    pin: true,
                    scrub: 0.4,
                    snap: {
                        snapTo: "labels", // Enforce snapping to our defined section locks
                        duration: {min: 0.4, max: 1.0},
                        delay: 0.1,
                        ease: "power2.inOut",
                        directional: true // Ensures partial scrolls lock gracefully to the next/prev segment
                    },
                    onUpdate: (self) => {
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
                    }
                }
            });

            tl.addLabel("start", 0);

            // --- Segment 1: frames 0 -> 64 ---
            tl.to(frameObj, { 
                frame: 64, 
                duration: 2, 
                ease: "none", 
                onUpdate: () => targetFrame.current = frameObj.frame 
            }, "start");
            
            // 1st text fades out during Segment 1
            gsap.set([text1Ref.current, haze1Ref.current], { opacity: 1, y: 0 });
            tl.to([text1Ref.current, haze1Ref.current], 
                { opacity: 0, y: -40, duration: 0.8, ease: "power2.inOut" }, 
                0.2
            );

            // Lock 1 Pause
            tl.addLabel("lock1", 2);
            tl.to({}, { duration: 0.6 }); 

            // --- Segment 2: frames 64 -> 121 ---
            tl.to(frameObj, { 
                frame: 121, 
                duration: 2, 
                ease: "none", 
                onUpdate: () => targetFrame.current = frameObj.frame 
            }, 2.6); 
            
            // 2nd text fades in at the end of Segment 2
            gsap.set([text2Ref.current, hazeRef.current], { opacity: 0, y: 40 });
            tl.to([text2Ref.current, hazeRef.current], 
                { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, 
                4.0 
            );

            // Lock 2 Pause
            tl.addLabel("lock2", 4.6);
            tl.to({}, { duration: 0.6 });

            // --- Segment 3: frames 121 -> 180 ---
            tl.to(frameObj, { 
                frame: 180, 
                duration: 2, 
                ease: "none", 
                onUpdate: () => targetFrame.current = frameObj.frame 
            }, 5.2); 
            
            // 2nd text fades out at the start of Segment 3
            tl.to([text2Ref.current, hazeRef.current], 
                { opacity: 0, y: -40, duration: 0.8, ease: "power2.in" }, 
                5.4 
            );

            // Lock 3 Pause
            tl.addLabel("lock3", 7.2);
            tl.to({}, { duration: 0.6 });

            // --- Segment 4: frames 180 -> 240 ---
            tl.to(frameObj, { 
                frame: 240, 
                duration: 2, 
                ease: "none", 
                onUpdate: () => targetFrame.current = frameObj.frame 
            }, 7.8);
            
            // 3rd text fades in at the end of Segment 4
            gsap.set(text3Ref.current, { opacity: 0, y: 20 });
            tl.to(text3Ref.current, 
                { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, 
                9.2
            );

            // Final minor pause to establish the lock4 end state
            tl.addLabel("lock4", 9.8);
            tl.to({}, { duration: 0.2 }); 

        }, containerRef);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(rafId);
            clearInterval(checkInitialFrame);
            observer.disconnect();
            ctxAnim.revert();
            if (idleTimer.current) clearTimeout(idleTimer.current);
            if (window.pauseSplashCursor) window.pauseSplashCursor(false);
        };
    }, []);

    return (
        <section ref={containerRef} className="hero-canvas-sequence" style={{ position: 'relative', width: '100%', minHeight: '100vh', backgroundColor: '#000', overflow: 'hidden', contain: 'layout paint' }}>
            <canvas 
                ref={canvasRef} 
                style={{ 
                    display: 'block', 
                    width: '100vw', 
                    height: '100vh', 
                    backgroundColor: '#000',
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                    contain: 'strict'
                }} 
            />

            <div className="abs-text top-right">
                <div className="branding-block">
                    <div ref={haze1Ref} className="text-haze" />
                    <h1 ref={text1Ref} className="sequence-title small color-green">
                        Building with nature,<br />Crafting the future
                    </h1>
                </div>
            </div>

            <div className="abs-text center-middle">
                <div ref={hazeRef} className="text-haze" />
                <h2 ref={text2Ref} className="sequence-title color-brown">
                    Where Space Breathe,<br />and souls belong
                </h2>
            </div>

            <div className="abs-text bottom-right">
                <div ref={text3Ref} className="about-block" style={{ position: 'relative' }}>
                    <h3 className="about-title" style={{ color: '#E6D6BC' }}>About Us</h3>
                    <p className="about-desc" style={{ color: '#E6D6BC' }}>
                        Earthcraft is a design and construction studio focused on creating sustainable, low-impact homes and lifestyle spaces. It combines thoughtful design, functionality, and wellness to shape modern living environments. The brand guides clients toward eco-conscious choices while emphasizing comfort and community. With a strong commitment to sustainability, Earthcraft aims to redefine how style and responsibility coexist.
                    </p>
                </div>
            </div>
        </section>
    );

};



export default HeroSequence;
