import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const BLOG_DATA = [
    { id: 1, title: "The Future of Sustainable Urban Living", date: "April 20, 2026", category: "Architecture", image: "/Gallery/Design & Advisory Services.png", excerpt: "Exploring how biophilic design is reshaping our modern cityscapes." },
    { id: 2, title: "Minimalism in Coastal Interior Design", date: "March 15, 2026", category: "Interiors", image: "/Gallery/ThomsonsCasa.png", excerpt: "How to bring the tranquility of the ocean into your living space." },
    { id: 3, title: "Reimagining Community Spaces for 2026", date: "Feb 10, 2026", category: "Community", image: "/Gallery/Hospitality & Lifetyle Spaces.png", excerpt: "Designing for connection in an increasingly digital world." },
    { id: 4, title: "Materials that Breathe: Clay & Wood", date: "Jan 22, 2026", category: "Build", image: "/Gallery/Thottam.png", excerpt: "Returning to ancestral building blocks for modern performance." },
    { id: 5, title: "Light & Shadow: The Dance of Geometry", date: "Dec 05, 2025", category: "Design", image: "/Gallery/Residential Spaces.png", excerpt: "Using natural light as a primary architectural material." },
    { id: 6, title: "Wellness-First Architecture Trends", date: "Nov 18, 2025", category: "Wellness", image: "/Gallery/Zaitoon.png", excerpt: "How your home environment impacts your mental and physical health." },
    { id: 7, title: "The Art of Vernacular Construction", date: "Oct 30, 2025", category: "Craft", image: "/Gallery/Design & Advisory Services.png", excerpt: "Local wisdom meets modern engineering in our latest projects." },
    { id: 8, title: "Urban Oases: Pocket Gardens", date: "Sept 12, 2025", category: "Sustainability", image: "/Gallery/ThomsonsCasa.png", excerpt: "Bringing nature back to the smallest city footprints." },
    { id: 9, title: "Circular Economy in the Building Industry", date: "Aug 05, 2025", category: "Build", image: "/Gallery/Hospitality & Lifetyle Spaces.png", excerpt: "Zero-waste construction is no longer a dream." },
    { id: 10, title: "Restoring Heritage: Modern Tech meets Stone", date: "July 20, 2025", category: "Heritage", image: "/Gallery/Residential Spaces.png", excerpt: "The delicate balance of preserving history while adding modern amenities." },
    { id: 11, title: "Lighting Design for Cognitive Wellness", date: "June 15, 2025", category: "Design", image: "/Gallery/Zaitoon.png", excerpt: "How light temperature and direction can improve focus and sleep." }
];

const FloatingGallery = () => {
    const [isWallOpen, setIsWallOpen] = useState(false);
    const galleryRef = useRef(null);
    const wallRef = useRef(null);
    const cardsRef = useRef([]);

    useEffect(() => {
        // Subtle entrance animation for the initial 6 blogs
        gsap.fromTo(cardsRef.current, 
            { opacity: 0, y: 50 },
            { 
                opacity: 1, y: 0, 
                duration: 1, 
                stagger: 0.1, 
                ease: "power3.out",
                scrollTrigger: {
                    trigger: galleryRef.current,
                    start: "top 80%",
                }
            }
        );

        // Pill Hover Animation Logic for 'View All' button
        const layoutPills = () => {
            if (!galleryRef.current) return;
            galleryRef.current.querySelectorAll('.pill').forEach(pill => {
                const circle = pill.querySelector('.hover-circle');
                if (!circle) return;
                
                const rect = pill.getBoundingClientRect();
                const w = rect.width;
                const h = rect.height;
                const R = ((w * w) / 4 + h * h) / (2 * h);
                const D = Math.ceil(2 * R) + 2;
                const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
                const originY = D - delta;

                circle.style.width = `${D}px`;
                circle.style.height = `${D}px`;
                circle.style.bottom = `-${delta}px`;

                gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` });

                const label = pill.querySelector('.pill-label');
                const white = pill.querySelector('.pill-label-hover');

                if (label) gsap.set(label, { y: 0 });
                if (white) gsap.set(white, { y: h + 12, opacity: 0 });
                
                pill._animTl = gsap.timeline({ paused: true });
                pill._animTl.to(circle, { scale: 1.2, xPercent: -50, duration: 0.45, ease: "power3.out", overwrite: 'auto' }, 0);
                if (label) pill._animTl.to(label, { y: -(h + 8), duration: 0.45, ease: "power3.out", overwrite: 'auto' }, 0);
                if (white) pill._animTl.to(white, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out", overwrite: 'auto' }, 0);
            });
        };

        const handleMouseEnter = (e) => {
            const pill = e.currentTarget;
            if(pill._animTl) pill._animTl.play();
        };
        const handleMouseLeave = (e) => {
            const pill = e.currentTarget;
            if(pill._animTl) pill._animTl.reverse();
        };

        layoutPills();
        const pills = galleryRef.current.querySelectorAll('.pill');
        pills.forEach(pill => {
            pill.addEventListener("mouseenter", handleMouseEnter);
            pill.addEventListener("mouseleave", handleMouseLeave);
        });

        return () => {
            pills.forEach(pill => {
                pill.removeEventListener("mouseenter", handleMouseEnter);
                pill.removeEventListener("mouseleave", handleMouseLeave);
            });
        };
    }, []);

    const toggleWall = (open) => {
        if (open) {
            setIsWallOpen(true);
            // We'll trigger the animation via useEffect when isWallOpen changes
        } else {
            // Close animation first then state change
            const wall = wallRef.current;
            if (wall) {
                gsap.to(wall, {
                    opacity: 0,
                    scale: 0.95,
                    duration: 0.5,
                    ease: "power2.inOut",
                    onComplete: () => {
                        setIsWallOpen(false);
                        document.body.style.overflow = 'auto';
                    }
                });
            } else {
                setIsWallOpen(false);
                document.body.style.overflow = 'auto';
            }
        }
    };

    useEffect(() => {
        if (isWallOpen && wallRef.current) {
            document.body.style.overflow = 'hidden';
            gsap.fromTo(wallRef.current, 
                { opacity: 0, scale: 0.98 }, 
                { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" }
            );
        }
    }, [isWallOpen]);

    return (
        <section className="native-sec updates-section" ref={galleryRef}>
            <div className="updates-grid">
                {BLOG_DATA.slice(0, 6).map((blog, i) => (
                    <div 
                        key={blog.id} 
                        className="blog-card" 
                        ref={el => cardsRef.current[i] = el}
                    >
                        <div className="blog-img-wrap">
                            <img src={blog.image} alt={blog.title} className="blog-img" loading="lazy" />
                            <span className="blog-tag">{blog.category}</span>
                        </div>
                        <div className="blog-info">
                            <span className="blog-date">{blog.date}</span>
                            <h3 className="blog-title-text">{blog.title}</h3>
                            <p className="blog-excerpt">{blog.excerpt}</p>
                            <button className="blog-read-more">Read Entry</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="view-all-wrap">
                <button className="view-all-btn pill" onClick={() => toggleWall(true)}>
                    <span className="hover-circle"></span>
                    <span className="label-stack">
                        <span className="pill-label">VIEW ALL UPDATES</span>
                        <span className="pill-label-hover">VIEW ALL UPDATES</span>
                    </span>
                </button>
            </div>

            {isWallOpen && createPortal(
                <div className="ui-takeover-modal" ref={wallRef}>
                    <div className="modal-header">
                        <h2 className="modal-title">Our Updates</h2>
                        <button className="modal-close-btn" onClick={() => toggleWall(false)}>×</button>
                    </div>
                    <div className="modal-scroll-area">
                        <div className="modal-content-grid">
                            {BLOG_DATA.map(blog => (
                                <div key={blog.id} className="blog-card takeover-card">
                                    <div className="blog-img-wrap">
                                        <img src={blog.image} alt={blog.title} className="blog-img" />
                                        <span className="blog-tag">{blog.category}</span>
                                    </div>
                                    <div className="blog-info">
                                        <span className="blog-date">{blog.date}</span>
                                        <h3 className="blog-title-text">{blog.title}</h3>
                                        <p className="blog-excerpt">{blog.excerpt}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </section>
    );
};

export default FloatingGallery;
