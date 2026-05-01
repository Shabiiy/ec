import React, { useState } from 'react';
import Preloader from './components/Preloader';
import CustomCursor from './components/CustomCursor';
import Header from './components/Header';
import OverlayMenu from './components/OverlayMenu';
import HeroSequence from './components/HeroSequence';
import GalleryIntro from './components/GalleryIntro';
import FloatingGallery from './components/FloatingGallery';
import JourneyTimeline from './components/JourneyTimeline';
import ContactPortal from './components/ContactPortal';

function App() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    return (
        <>
            {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
            
            <img className="global-bg" src="/bg.png?v=2" alt="" loading="eager" fetchPriority="high" decoding="async" />
            
            <CustomCursor />
            
            <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            <OverlayMenu isOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            <main className="main-content">
                <div id="about">
                    <HeroSequence />
                </div>
                
                <div className="native-content">
                    <div id="people">
                        <GalleryIntro />
                    </div>
                    <div id="updates">
                        <FloatingGallery />
                    </div>
                    <div id="journey">
                        <JourneyTimeline />
                    </div>
                    <div id="contacts">
                        <ContactPortal />
                    </div>
                </div>
            </main>
        </>
    );
}

export default App;
