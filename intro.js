// ==================== MINDMATE INTRO CONTROLLER ====================
// Production-quality onboarding animation system
// Handles timing, transitions, localStorage persistence, and redirect to main app

(function() {
  'use strict';

  // ==================== CONFIGURATION ====================
  
  const INTRO_CONFIG = {
    localStorageKey: 'mindmate_seen_intro',
    redirectUrl: 'index.html',
    timing: {
      logoDisplay: 1800,
      slideDisplay: 1200,
      slideTransition: 600,
      finalDelay: 400,
      fadeOutDuration: 600
    },
    slides: [
      {
        icon: '📊',
        title: 'Track your mood',
        description: 'Daily check-ins to understand your emotional patterns'
      },
      {
        icon: '✍️',
        title: 'Reflect daily',
        description: 'Journaling prompts to process your thoughts'
      },
      {
        icon: '🧘',
        title: 'Calm your mind',
        description: 'Guided breathing exercises for peace and clarity'
      },
      {
        icon: '🌻',
        title: 'Stay grateful',
        description: 'Daily gratitude practice to shift your perspective'
      }
    ]
  };

  // ==================== STATE MANAGEMENT ====================
  
  let currentSlideIndex = 0;
  let animationTimeouts = [];
  let isAnimating = false;

  // ==================== CORE FUNCTIONS ====================

  /**
   * Check if intro should be shown
   * @returns {boolean}
   */
  function shouldShowIntro() {
    try {
      const seen = localStorage.getItem(INTRO_CONFIG.localStorageKey);
      return seen !== 'true';
    } catch (e) {
      console.warn('localStorage not available:', e);
      return true;
    }
  }

  /**
   * Mark intro as seen
   */
  function markIntroAsSeen() {
    try {
      localStorage.setItem(INTRO_CONFIG.localStorageKey, 'true');
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }

  /**
   * Clear all animation timeouts
   */
  function clearAnimationTimeouts() {
    animationTimeouts.forEach(timeout => clearTimeout(timeout));
    animationTimeouts = [];
  }

  /**
   * Redirect to main app
   */
  function redirectToApp() {
    window.location.href = INTRO_CONFIG.redirectUrl;
  }

  // ==================== DOM MANIPULATION ====================

  /**
   * Get intro container element
   * @returns {HTMLElement|null}
   */
  function getIntroContainer() {
    return document.getElementById('mindmate-intro');
  }

  /**
   * Show logo phase
   */
  function showLogo() {
    const logo = document.querySelector('.intro-logo');
    if (!logo) return;

    logo.classList.add('active');
    
    const timeout = setTimeout(() => {
      startSlideShow();
    }, INTRO_CONFIG.timing.logoDisplay);
    
    animationTimeouts.push(timeout);
  }

  /**
   * Show individual slide
   * @param {number} index - Slide index to show
   */
  function showSlide(index) {
    const slides = document.querySelectorAll('.intro-slide');
    if (!slides[index]) return;

    // Remove active class from all slides
    slides.forEach(slide => {
      slide.classList.remove('active');
      slide.classList.remove('exit');
    });

    // Show current slide
    const currentSlide = slides[index];
    currentSlide.classList.add('active');

    // Schedule next slide or final screen
    const timeout = setTimeout(() => {
      // Exit current slide
      currentSlide.classList.remove('active');
      currentSlide.classList.add('exit');

      // Move to next slide or final screen
      const nextTimeout = setTimeout(() => {
        if (index < INTRO_CONFIG.slides.length - 1) {
          showSlide(index + 1);
        } else {
          showFinalScreen();
        }
      }, INTRO_CONFIG.timing.slideTransition);
      
      animationTimeouts.push(nextTimeout);
    }, INTRO_CONFIG.timing.slideDisplay);
    
    animationTimeouts.push(timeout);
  }

  /**
   * Start the slide show sequence
   */
  function startSlideShow() {
    currentSlideIndex = 0;
    showSlide(currentSlideIndex);
  }

  /**
   * Show final screen with CTA
   */
  function showFinalScreen() {
    const final = document.querySelector('.intro-final');
    if (!final) return;

    const timeout = setTimeout(() => {
      final.classList.add('active');
    }, INTRO_CONFIG.timing.finalDelay);
    
    animationTimeouts.push(timeout);
  }

  /**
   * Handle intro completion — fade out then redirect to index.html
   */
  function completeIntro() {
    if (isAnimating) return;
    isAnimating = true;

    // Mark as seen so next time user goes straight to index.html
    markIntroAsSeen();

    // Clear any pending animations
    clearAnimationTimeouts();

    // Fade out intro then redirect
    const introContainer = getIntroContainer();
    if (introContainer) {
      introContainer.classList.add('intro-fade-out');

      setTimeout(() => {
        redirectToApp();
      }, INTRO_CONFIG.timing.fadeOutDuration);
    } else {
      // Fallback: just redirect
      redirectToApp();
    }
  }

  // ==================== EVENT HANDLERS ====================

  /**
   * Handle CTA button click
   */
  function handleCTAClick(event) {
    event.preventDefault();
    completeIntro();
  }

  /**
   * Attach event listeners
   */
  function attachEventListeners() {
    const ctaButton = document.querySelector('.intro-cta-button');
    if (ctaButton) {
      ctaButton.addEventListener('click', handleCTAClick);
    }
  }

  // ==================== INITIALIZATION ====================

  /**
   * Initialize intro animation
   */
  function initIntro() {
    // If intro was already seen, skip straight to the main app
    if (!shouldShowIntro()) {
      redirectToApp();
      return;
    }

    // Attach event listeners
    attachEventListeners();

    // Start animation sequence with a small delay
    setTimeout(() => {
      showLogo();
    }, 100);
  }

  /**
   * Reset intro (useful for testing)
   */
  function resetIntro() {
    try {
      localStorage.removeItem(INTRO_CONFIG.localStorageKey);
      console.log('Intro reset — reload intro.html to see it again');
    } catch (e) {
      console.warn('Could not reset intro:', e);
    }
  }

  // ==================== PUBLIC API ====================

  window.MindMateIntro = {
    shouldShowIntro: shouldShowIntro,
    init: initIntro,
    reset: resetIntro,
    complete: completeIntro
  };

  // ==================== AUTO-INITIALIZE ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIntro);
  } else {
    initIntro();
  }

})();