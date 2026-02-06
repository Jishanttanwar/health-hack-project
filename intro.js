// ==================== MINDMATE INTRO CONTROLLER ====================
// Production-quality onboarding animation system
// Handles timing, transitions, and localStorage persistence

(function() {
  'use strict';

  // ==================== CONFIGURATION ====================
  
  const INTRO_CONFIG = {
    localStorageKey: 'mindmate_seen_intro',
    timing: {
      logoDisplay: 1800,        // How long logo shows
      slideDisplay: 1200,       // How long each feature slide shows
      slideTransition: 600,     // Slide fade in/out duration
      finalDelay: 400,          // Delay before final screen
      fadeOutDuration: 600      // Intro fade out duration
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
        description: 'Guided exercises for peace and clarity'
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

  // ==================== DOM MANIPULATION ====================

  /**
   * Get intro container element
   * @returns {HTMLElement|null}
   */
  function getIntroContainer() {
    return document.getElementById('mindmate-intro');
  }

  /**
   * Get main app container element
   * @returns {HTMLElement|null}
   */
  function getAppContainer() {
    return document.getElementById('app-container');
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
   * Handle intro completion
   */
  function completeIntro() {
    if (isAnimating) return;
    isAnimating = true;

    // Mark as seen
    markIntroAsSeen();

    // Clear any pending animations
    clearAnimationTimeouts();

    // Fade out intro
    const introContainer = getIntroContainer();
    if (introContainer) {
      introContainer.classList.add('intro-fade-out');

      // Remove intro and show app after fade
      setTimeout(() => {
        hideIntro();
        showApp();
        isAnimating = false;
      }, INTRO_CONFIG.timing.fadeOutDuration);
    }
  }

  /**
   * Hide intro container
   */
  function hideIntro() {
    const introContainer = getIntroContainer();
    if (introContainer) {
      introContainer.classList.add('intro-hidden');
    }
  }

  /**
   * Show main app container
   */
  function showApp() {
    const appContainer = getAppContainer();
    if (appContainer) {
      appContainer.classList.remove('intro-hidden');
      // Optional: Add fade-in animation to app
      appContainer.style.opacity = '0';
      appContainer.style.transform = 'scale(0.98)';
      
      requestAnimationFrame(() => {
        appContainer.style.transition = 'opacity 600ms cubic-bezier(0.4, 0.0, 0.2, 1), transform 600ms cubic-bezier(0.4, 0.0, 0.2, 1)';
        appContainer.style.opacity = '1';
        appContainer.style.transform = 'scale(1)';
      });
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
    // Check if we should show intro
    if (!shouldShowIntro()) {
      hideIntro();
      showApp();
      return;
    }

    // Ensure app is hidden initially
    const appContainer = getAppContainer();
    if (appContainer) {
      appContainer.classList.add('intro-hidden');
    }

    // Attach event listeners
    attachEventListeners();

    // Start animation sequence
    // Small delay to ensure DOM is ready and animations trigger properly
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
      console.log('Intro reset - reload page to see it again');
    } catch (e) {
      console.warn('Could not reset intro:', e);
    }
  }

  // ==================== PUBLIC API ====================

  // Expose functions to window for external use
  window.MindMateIntro = {
    shouldShowIntro: shouldShowIntro,
    init: initIntro,
    reset: resetIntro,
    complete: completeIntro
  };

  // ==================== AUTO-INITIALIZE ====================

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIntro);
  } else {
    initIntro();
  }

})();