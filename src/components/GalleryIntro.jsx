import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const GalleryIntro = () => {
    const secRef = useRef(null);
    const wrapRef = useRef(null);
    const textRef = useRef(null);
    const doorTextBgRef = useRef(null);
    const doorTextFgRef = useRef(null);
    const cardRef = useRef(null);
    const cardImgRef = useRef(null);
    const narrativeBoxRef = useRef(null);
    const bioBoxRef = useRef(null);

    useEffect(() => {
        const wrap = wrapRef.current;
        
        // GSAP Scroll Animations
        let expandTl = gsap.timeline({
            scrollTrigger: {
                id: 'updates-trigger',
                trigger: secRef.current,
                start: "top top", 
                end: "+=220%",        
                pin: true,            
                scrub: 0.5, 
                fastScrollEnd: true,
                preventOverlaps: true,
                overwrite: 'auto'
            }
        });

        // GPU Acceleration
        gsap.set([wrap, textRef.current, doorTextBgRef.current, doorTextFgRef.current, narrativeBoxRef.current, bioBoxRef.current], { 
            willChange: 'transform, opacity' 
        });

        expandTl.to(wrap, { scale: 18, duration: 2, ease: "power2.in", force3D: true }, 0);
        
        // Fade out narratives as portal opens
        expandTl.to([narrativeBoxRef.current, bioBoxRef.current], { 
            opacity: 0, 
            y: -20, 
            duration: 0.8, 
            ease: "power2.inOut" 
        }, 0);

        expandTl.to(cardRef.current, { backgroundColor: '#ffffff', duration: 1.5, ease: "power2.in" }, 0.5);
        expandTl.to([doorTextBgRef.current, doorTextFgRef.current], { opacity: 0, scale: 1.5, duration: 1, ease: "power2.in", force3D: true }, 0);
        expandTl.to(cardImgRef.current, { opacity: 0, duration: 0.8, ease: "power2.in" }, 0.2);
        gsap.set(textRef.current, { xPercent: -50, yPercent: -50, scale: 0.95 });
        expandTl.to(textRef.current, { opacity: 1, scale: 1, duration: 1.5, ease: "power3.out", force3D: true }, 1);

        return () => {
            if (expandTl.scrollTrigger) expandTl.scrollTrigger.kill();
            expandTl.kill();
        };
    }, []);

    return (
        <section className="native-sec gallery-intro-sequence" ref={secRef} style={{ position: 'relative' }}>
            {/* Narratives: Left Side Title */}
            <div className="narrative-box left-top" ref={narrativeBoxRef} style={{ 
                position: 'absolute', 
                top: '15%', 
                left: '5%', 
                maxWidth: '400px', 
                zIndex: 12,
                color: '#E6D6BC'
            }}>
                <h2 style={{ 
                    fontFamily: 'var(--font-heading)', 
                    fontSize: '3.5rem', 
                    margin: 0, 
                    lineHeight: 1 
                }}>Akash Anand</h2>
                <h3 style={{ 
                    fontFamily: 'var(--font-body)', 
                    fontSize: '1rem', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.2em', 
                    marginTop: '10px',
                    opacity: 0.8
                }}>Founder & CEO</h3>
            </div>

            {/* Narratives: Right Side Bottom Description */}
            <div className="narrative-box right-bottom" ref={bioBoxRef} style={{ 
                position: 'absolute', 
                bottom: '10%', 
                right: '2%', 
                maxWidth: '450px', 
                zIndex: 12,
                color: '#E6D6BC',
                textAlign: 'left'
            }}>
                <p style={{ 
                    fontFamily: 'var(--font-body)', 
                    fontSize: '1.1rem', 
                    lineHeight: 1.6,
                    fontWeight: 400
                }}>
                    With an energetic and entrepreneurial spirit, Akash drives overall vision, growth, and business strategy of Earthcraft. He brings a dynamic approach to scaling the brand while ensuring that design, purpose, and people stay at the core of every project. Akash plays a key role in client engagement, partnerships, and building a culture of collaboration across teams.
                </p>
            </div>

            <div className="door-text-bg split-text-container" ref={doorTextBgRef} style={{ pointerEvents: 'none', zIndex: 10 }}>
                <div className="text-row">
                    <span className="formed-by-serif" style={{ marginRight: '-20px' }}>FOR</span>
                    <span className="formed-by-serif">MED</span>
                </div>
            </div>

            <div className="static-card-wrapper" ref={wrapRef} style={{ zIndex: 5 }}>
                <div className="static-card" ref={cardRef}>
                    <div className="pc-inside" ref={cardImgRef}></div>
                </div>
            </div>
            
            <div className="door-text-fg" ref={doorTextFgRef} style={{ pointerEvents: 'none', zIndex: 10 }}>
                <span className="by-script">By</span>
                <span className="people-script">People</span>
            </div>

            <h2 id="gallery-reveal-text" className="sequence-title" ref={textRef} style={{ position: 'absolute', top: '50%', left: '50%', opacity: 0 }}>OUR UPDATES</h2>
        </section>
    );
};

export default GalleryIntro;
