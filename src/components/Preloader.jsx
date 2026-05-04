import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const TOTAL_FRAMES = 241;
export const EXTRA_ASSETS = [
    "/EC logo.png",
    "/Gallery/Design & Advisory Services.png?v=2",
    "/Gallery/ThomsonsCasa.png?v=2",
    "/Gallery/Hospitality & Lifetyle Spaces.png?v=2",
    "/Gallery/Thottam.png?v=2",
    "/Gallery/Residential Spaces.png?v=2",
    "/Gallery/Zaitoon.png?v=2",
    "/assets/CEO.png"
];
export const TOTAL_ASSETS = TOTAL_FRAMES + EXTRA_ASSETS.length;
export const globalImageCache = [];

const Preloader = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const preloaderRef = useRef(null);
    const hasUnblocked = useRef(false);

    useEffect(() => {
        let assetsLoaded = 0;

        const trackProgress = () => {
            assetsLoaded++;
            const progressPercentage = Math.floor((assetsLoaded / TOTAL_ASSETS) * 100);
            setProgress(progressPercentage);

            if (assetsLoaded === TOTAL_ASSETS && !hasUnblocked.current) {
                hasUnblocked.current = true;
                revealSite();
            }
        };

        const loadFrame = async (i) => {
            const img = new Image();
            const paddedIndex = i.toString().padStart(4, '0');
            const extension = i >= 239 ? 'png' : 'jpg';
            img.src = `/HeroSequence/frame_${paddedIndex}.${extension}?v=2`;
            
            try {
                await img.decode();
                globalImageCache[i - 1] = img;
            } catch (err) {
                globalImageCache[i - 1] = img;
            } finally {
                trackProgress();
            }
        };

        const loadExtra = async (src) => {
            const img = new Image();
            img.src = src;
            try {
                await img.decode();
            } catch (err) {
            } finally {
                trackProgress();
            }
        };

        const revealSite = () => {
            gsap.to(preloaderRef.current, { 
                autoAlpha: 0, 
                duration: 1.2, 
                ease: "power2.inOut",
                onComplete: () => {
                    if (preloaderRef.current) preloaderRef.current.style.display = 'none';
                    ScrollTrigger.refresh();
                    if (window.pauseSplashCursor) window.pauseSplashCursor(false);
                    if (onComplete) onComplete();
                }
            });
        };

        const startLoading = async () => {
            // 1. Load Frames
            const framePromises = [];
            for (let i = 1; i <= TOTAL_FRAMES; i++) {
                framePromises.push(loadFrame(i));
            }

            // 2. Load Extra Assets
            const extraPromises = EXTRA_ASSETS.map(src => loadExtra(src));

            await Promise.all([...framePromises, ...extraPromises]);
        };

        startLoading();

    }, [onComplete]);

    return (
        <div ref={preloaderRef} id="site-preloader" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000', zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <img src="/EC logo.png" alt="Earthcraft" style={{ width: '120px', marginBottom: '20px', opacity: 0.8 }} />
            <div id="preloader-progress" style={{ fontSize: '1.2rem', fontWeight: 300, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.7)' }}>
                {progress}%
            </div>
            <div style={{ width: '200px', height: '2px', background: 'rgba(255,255,255,0.1)', marginTop: '15px', position: 'relative', overflow: 'hidden' }}>
                <div id="preloader-bar" style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${progress}%`, background: '#fff', transition: 'width 0.1s linear' }}></div>
            </div>
        </div>
    );
};

export default Preloader;
