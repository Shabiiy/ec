import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CircularText from '../CircularText';

gsap.registerPlugin(ScrollTrigger);

const ContactPortal = () => {
    const wrapperRef = useRef(null);
    const cardRef = useRef(null);
    const portalSecRef = useRef(null);
    const contactSecRef = useRef(null);
    const textWrapRef = useRef(null);

    useEffect(() => {
        let portalTl = gsap.timeline({
            scrollTrigger: {
                id: 'contacts-trigger',
                trigger: wrapperRef.current,
                start: "top top",
                end: "+=100%",
                pin: true,
                pinSpacing: false,
                scrub: 0.5,
                fastScrollEnd: true,
                preventOverlaps: true
            }
        });

        // Calculate proportional scale to cover screen
        const maxDimension = Math.hypot(window.innerWidth, window.innerHeight);
        const endScale = maxDimension / 80; // 80px is the original initial hole radius

        // Animate the radial mask "hole" expansion
        portalTl.to(cardRef.current, {
            '--hole-radius': `${80 * endScale}px`,
            duration: 2,
            ease: "power2.in"
        }, 0);

        // Expand the circular text proportionally
        portalTl.to(textWrapRef.current, {
            scale: endScale,
            opacity: 0,
            duration: 2,
            ease: "power2.in"
        }, 0);

        // Reveal the contact section contents as the hole expands
        portalTl.to(contactSecRef.current, {
            opacity: 1,
            duration: 1.5,
            ease: "power2.out"
        }, 0.5);

        // Fade out the mask section at the end
        portalTl.to(portalSecRef.current, {
            opacity: 0,
            duration: 0.5
        }, 1.8);

        return () => {
            if (portalTl.scrollTrigger) portalTl.scrollTrigger.kill();
            portalTl.kill();
        };
    }, []);

    return (
        <div className="portal-and-contact-wrapper" style={{ position: 'relative', width: '100%', height: '200vh' }} ref={wrapperRef}>
            <section className="native-sec contact-sec" ref={contactSecRef}>
                <h2 className="contact-title">CONTACT</h2>
                <form className="contact-form" onSubmit={e => e.preventDefault()}>
                    <input type="text" className="minimal-input" placeholder="Full Name" />
                    <input type="email" className="minimal-input" placeholder="Email Address" />
                    <div className="inline-inputs">
                        <input type="text" className="minimal-input" placeholder="Country" />
                        <input type="text" className="minimal-input" placeholder="City" />
                    </div>
                    <textarea className="minimal-input context-area" placeholder="Context for Admission"></textarea>
                    
                    <label className="custom-checkbox">
                        <input type="checkbox" />
                        <span className="checkmark"></span>
                        I understand that details is reviewed selectively...
                    </label>
                    
                    <button type="submit" className="minimal-submit">SUBMIT</button>
                </form>

                <div style={{ marginTop: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                    <a href="https://www.instagram.com/intellex.web?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px 25px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '30px',
                        color: 'white',
                        textDecoration: 'none',
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '12px',
                        letterSpacing: '1px',
                        transition: 'all 0.3s ease',
                        background: 'rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    }}>
                        MEET THE DEVELOPERS
                        <span style={{ marginLeft: '12px', display: 'flex', alignItems: 'center' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.036 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/>
                            </svg>
                        </span>
                    </a>
                </div>
            </section>

            <section className="native-sec portal-sequence overlay-portal" ref={portalSecRef}>
                <div className="bg-portal-card" id="contact-door" ref={cardRef} />
                <div className="portal-text-wrapper" ref={textWrapRef} style={{ 
                    position: 'absolute', 
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 61,
                    width: '210px',
                    height: '210px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    pointerEvents: 'none'
                }}>
                    <CircularText text="EARTHCRAFT • ARCHITECTURE • DESIGN • BUILD • " spinDuration={25} />
                </div>
            </section>

        </div>
    );
};

export default ContactPortal;
