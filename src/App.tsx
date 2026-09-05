import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Starfield } from './components/3d/Starfield';
import { Navbar } from './components/layout/Navbar';
import { HeroSection } from './components/home/HeroSection';
import { GlobeExplorerSection } from './components/home/GlobeExplorerSection';
import { DestinationCarousel } from './components/home/DestinationCarousel';
import { CorePillarsBento } from './components/home/CorePillarsBento';
import { InteractiveSimulator } from './components/home/InteractiveSimulator';
import { BudgetSplitDemo } from './components/home/BudgetSplitDemo';
import { PlatformShowcase } from './components/home/PlatformShowcase';
import { TravelerCommunity } from './components/home/TravelerCommunity';
import { PricingComparison } from './components/home/PricingComparison';
import { FaqSection } from './components/home/FaqSection';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/home/AuthModal';
import { LegalModal, LegalTab } from './components/home/LegalModal';

// Register GSAP plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function App() {
  const mainRef = useRef<HTMLDivElement>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [legalModalState, setLegalModalState] = useState<{
    isOpen: boolean;
    tab: LegalTab;
  }>({
    isOpen: false,
    tab: 'terms',
  });

  const handleOpenLegal = (tab: LegalTab) => {
    setLegalModalState({
      isOpen: true,
      tab,
    });
  };

  // GSAP Orchestrated Animation Pipeline
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !mainRef.current) return;

    // Use gsap.context for bulletproof component lifecycle cleanup
    const ctx = gsap.context(() => {
      // 1. Smooth subtle Hero entrance
      gsap.from('#hero-container', {
        y: 15,
        duration: 0.7,
        ease: 'power2.out',
      });

      // 2. Staggered ScrollTrigger reveal for section headings & cards
      const sections = document.querySelectorAll('section');
      sections.forEach((section) => {
        const heading = section.querySelector('h2');
        const desc = section.querySelector('p');
        if (heading) {
          gsap.from([heading, desc].filter(Boolean), {
            y: 18,
            opacity: 0.6,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 88%',
              once: true,
            },
          });
        }

        // Exclude globe and destinations sections from generic card stagger to prevent stuck transforms
        if (section.id === 'globe' || section.id === 'destinations') {
          return;
        }

        const cards = section.querySelectorAll('.glass-card');
        if (cards.length > 0) {
          gsap.fromTo(
            cards,
            { y: 20, opacity: 0.5 },
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              stagger: 0.06,
              ease: 'power2.out',
              clearProps: 'all',
              scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                once: true,
              },
            }
          );
        }
      });
    }, mainRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div ref={mainRef} className="relative min-h-screen bg-background text-slate-100 overflow-x-hidden">
      {/* 3D Cosmic Particle Starfield Layer */}
      <Starfield />

      {/* Navigation Header */}
      <Navbar onStartClick={() => setIsAuthModalOpen(true)} />

      {/* Main Content Sections */}
      <main id="main-content" className="relative z-10">
        <div id="hero-container">
          <HeroSection
            onExploreClick={() => scrollToSection('destinations')}
            onDemoClick={() => scrollToSection('demo')}
          />
        </div>

        {/* 3D Earth Globe Interactive Space */}
        <GlobeExplorerSection />

        {/* Destinations Carousel (Owl / Modern Touch & Drag Carousel) */}
        <DestinationCarousel
          onSelectDestination={() => {
            scrollToSection('demo');
          }}
        />

        {/* 4 Core Pillars Bento Grid */}
        <CorePillarsBento
          onLearnMore={() => scrollToSection('demo')}
        />

        {/* Interactive Feature Simulator (Smart Itinerary, Translation, OCR Viewfinder) */}
        <InteractiveSimulator />

        {/* Collaborative Multi-Currency Budget Ledger & Debt Splitter */}
        <BudgetSplitDemo />

        {/* Cross-Platform Device Ecosystem (Web React 18 + iOS/Android Mobile) */}
        <PlatformShowcase onOpenWaitlist={() => setIsAuthModalOpen(true)} />

        {/* Global Traveler Stories & Social Proof */}
        <TravelerCommunity />

        {/* Pricing Comparison Matrix */}
        <PricingComparison onSelectPlan={() => setIsAuthModalOpen(true)} />

        {/* Frequently Asked Questions */}
        <FaqSection />
      </main>

      {/* Global Footer */}
      <Footer onOpenLegal={handleOpenLegal} />

      {/* Account Registration & Early Access Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onOpenLegal={(tab) => handleOpenLegal(tab)}
      />

      {/* Legal & Emergency Support Modal */}
      <LegalModal
        isOpen={legalModalState.isOpen}
        initialTab={legalModalState.tab}
        onClose={() => setLegalModalState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default App;
