import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const OverlayMenu = ({ isOpen, setIsMenuOpen }) => {
    const menuRef = useRef(null);

    const handleNavigate = (e, targetId) => {
        e.preventDefault();
        
        // 1. Close menu first so user sees it fading
        if (setIsMenuOpen) setIsMenuOpen(false);
        
        const targetElement = document.getElementById(targetId);
        
        // 2. We fade out the main content immediately
        gsap.to('.main-content', {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                // 3. Jump to the section instantly while hidden
                let targetScroll = -1;
                
                if (targetId === 'updates' || targetId === 'contacts') {
                    const st = ScrollTrigger.getById(`${targetId}-trigger`);
                    if (st) {
                        targetScroll = st.end - 5; // Stop just before unpinning so content is fully visible
                    }
                }
                
                if (targetScroll !== -1) {
                    window.scrollTo({ top: targetScroll, behavior: 'instant' });
                } else if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'auto' });
                }
                
                ScrollTrigger.refresh();
                
                // 4. Fade it back in!
                gsap.to('.main-content', {
                    opacity: 1,
                    duration: 0.8,
                    ease: 'power2.out',
                    clearProps: 'opacity'
                });
            }
        });
    };

    useEffect(() => {
        const menuItems = menuRef.current.querySelectorAll('.menu__item');
        
        menuItems.forEach(item => {
            const text = item.getAttribute('data-text');
            const image = item.getAttribute('data-img');
            
            // Check if marquee already created to prevent strict mode dups
            if (item.querySelector('.marquee')) return;

            const marquee = document.createElement('div');
            marquee.className = 'marquee';
            marquee.style.backgroundColor = 'var(--primary-green)';
            
            const innerWrap = document.createElement('div');
            innerWrap.className = 'marquee__inner-wrap';
            
            const inner = document.createElement('div');
            inner.className = 'marquee__inner';
            
            for(let i=0; i<6; i++) {
                const part = document.createElement('div');
                part.className = 'marquee__part';
                part.innerHTML = `<span>${text}</span><div class="marquee__img" style="background-image: url('${image}')"></div>`;
                inner.appendChild(part);
            }
            
            innerWrap.appendChild(inner);
            marquee.appendChild(innerWrap);
            item.appendChild(marquee);
            
            setTimeout(() => {
                const firstPart = inner.querySelector('.marquee__part');
                if(firstPart) {
                    gsap.to(inner, { x: -firstPart.offsetWidth, duration: 10, ease: 'none', repeat: -1 });
                }
            }, 100);
            
            const findClosestEdge = (x, y, w, h) => {
                const topDist = (x - w/2)**2 + (y - 0)**2;
                const bottomDist = (x - w/2)**2 + (y - h)**2;
                return topDist < bottomDist ? 'top' : 'bottom';
            };
            
            item.addEventListener('mouseenter', e => {
                const rect = item.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const edge = findClosestEdge(x, y, rect.width, rect.height);
                
                gsap.timeline({ defaults: { duration: 0.6, ease: 'expo.out' } })
                    .set(marquee, { y: edge === 'top' ? '-101%' : '101%' }, 0)
                    .set(innerWrap, { y: edge === 'top' ? '101%' : '-101%' }, 0)
                    .to([marquee, innerWrap], { y: '0%' }, 0);
            });
            
            item.addEventListener('mouseleave', e => {
                const rect = item.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const edge = findClosestEdge(x, y, rect.width, rect.height);
                
                gsap.timeline({ defaults: { duration: 0.6, ease: 'expo.out' } })
                    .to(marquee, { y: edge === 'top' ? '-101%' : '101%' }, 0)
                    .to(innerWrap, { y: edge === 'top' ? '101%' : '-101%' }, 0);
            });
        });
    }, []);

    return (
        <div className={`overlay ${isOpen ? 'active' : ''}`} id="nav-overlay">
            <div className="menu-wrap">
                <nav className="menu" ref={menuRef}>
                    <div className="menu__item" data-text="ABOUT" data-img="/EC logo.png" onClick={(e) => handleNavigate(e, 'about')}>
                        <a className="menu__item-link" href="#about">ABOUT</a>
                    </div>
                    <div className="menu__item" data-text="PEOPLE" data-img="/EC logo.png" onClick={(e) => handleNavigate(e, 'people')}>
                        <a className="menu__item-link" href="#people">PEOPLE</a>
                    </div>
                    <div className="menu__item" data-text="UPDATES" data-img="/EC logo.png" onClick={(e) => handleNavigate(e, 'updates')}>
                        <a className="menu__item-link" href="#updates">UPDATES</a>
                    </div>
                    <div className="menu__item" data-text="JOURNEY" data-img="/EC logo.png" onClick={(e) => handleNavigate(e, 'journey')}>
                        <a className="menu__item-link" href="#journey">JOURNEY</a>
                    </div>
                    <div className="menu__item" data-text="CONTACTS" data-img="/EC logo.png" onClick={(e) => handleNavigate(e, 'contacts')}>
                        <a className="menu__item-link" href="#contacts">CONTACTS</a>
                    </div>
                </nav>
            </div>
        </div>
    );
};

export default OverlayMenu;
