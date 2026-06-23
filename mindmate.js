// MindMate — Mental Wellness App JavaScript
// Full-featured: mood tracking, journaling, gratitude, breathing exercises, insights, streaks, quotes

// ==================== STATE MANAGEMENT ====================
let selectedMood = null;
let breathingMode = 'box';
let breathingInterval = null;
let breathingPaused = false;
let breathingStep = 0;
let boxTotalCycles = 6;
let fourSevenEightCycles = 4;
let panicTotalCycles = 5;
let currentCycle = 0;
let currentChart = null;
let activeChartType = 'stress';
let animationFrame = null;

// ==================== QUOTES ====================
const QUOTES = [
    { text: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated, scared or anxious. Having feelings doesn't make you a negative person. It makes you human.", author: "Lori Deschene" },
    { text: "Mental health is not a destination, but a process. It's about how you drive, not where you're going.", author: "Noam Shpancer" },
    { text: "There is hope, even when your brain tells you there isn't.", author: "John Green" },
    { text: "Self-care is how you take your power back.", author: "Lalah Delia" },
    { text: "You are allowed to be both a masterpiece and a work in progress simultaneously.", author: "Sophia Bush" },
    { text: "Happiness can be found even in the darkest of times, if one only remembers to turn on the light.", author: "Albus Dumbledore" },
    { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
    { text: "Be gentle with yourself. You are a child of the universe no less than the trees and the stars.", author: "Max Ehrmann" },
    { text: "Caring for your mind is as important and as much of a necessity as caring for your body.", author: "Jane Yolen" },
    { text: "You yourself, as much as anybody in the entire universe, deserve your love and affection.", author: "Sharon Salzberg" },
    { text: "It's okay to ask for help. It's okay not to be okay.", author: "MindMate" },
    { text: "Recovery is not linear. Some days you'll take a step back — that's still progress.", author: "MindMate" },
    { text: "Every small act of self-care is an act of resistance in a world that demands you be productive every second.", author: "Audre Lorde" },
];

let currentQuoteIndex = 0;

function loadRandomQuote() {
    currentQuoteIndex = Math.floor(Math.random() * QUOTES.length);
    renderQuote();
}

function refreshQuote() {
    currentQuoteIndex = (currentQuoteIndex + 1) % QUOTES.length;
    const textEl = document.getElementById('quoteText');
    const authorEl = document.getElementById('quoteAuthor');
    if (textEl) {
        textEl.style.opacity = '0';
        authorEl.style.opacity = '0';
        setTimeout(() => {
            renderQuote();
            textEl.style.transition = 'opacity 0.4s ease';
            authorEl.style.transition = 'opacity 0.4s ease';
            textEl.style.opacity = '1';
            authorEl.style.opacity = '1';
        }, 250);
    }
}

function renderQuote() {
    const q = QUOTES[currentQuoteIndex];
    const textEl = document.getElementById('quoteText');
    const authorEl = document.getElementById('quoteAuthor');
    if (textEl) textEl.textContent = q.text;
    if (authorEl) authorEl.textContent = '— ' + q.author;
}

// ==================== FLOATING PARTICLES ====================
function createParticlesBackground() {
    const container = document.getElementById('particles');
    if (!container) return;
    const count = window.innerWidth < 600 ? 12 : 24;
    for (let i = 0; i < count; i++) {
        const dot = document.createElement('div');
        const size = Math.random() * 4 + 2;
        dot.style.cssText = `
            position: absolute;
            width: ${size}px; height: ${size}px;
            background: rgba(139, 92, 246, ${Math.random() * 0.15 + 0.05});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: particleDrift ${Math.random() * 20 + 15}s ease-in-out infinite;
            animation-delay: ${Math.random() * -20}s;
        `;
        container.appendChild(dot);
    }

    // Inject the keyframes if not already present
    if (!document.getElementById('particleStyle')) {
        const style = document.createElement('style');
        style.id = 'particleStyle';
        style.textContent = `
            @keyframes particleDrift {
                0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
                25% { transform: translate(30px, -40px) scale(1.3); opacity: 0.7; }
                50% { transform: translate(-20px, 30px) scale(0.8); opacity: 0.3; }
                75% { transform: translate(40px, 20px) scale(1.1); opacity: 0.6; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    updateAllSliders();
    loadInsights();
    loadStreak();
    loadRandomQuote();
    createParticlesBackground();

    // Overwhelmed toggle -> show gentle suggestion
    const overwhelmedToggle = document.getElementById('overwhelmed');
    const overwhelmCard = document.getElementById('overwhelmSuggestion');

    if (overwhelmedToggle && overwhelmCard) {
        overwhelmedToggle.addEventListener('change', () => {
            if (overwhelmedToggle.checked) {
                overwhelmCard.style.display = 'block';
                overwhelmCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                overwhelmCard.style.display = 'none';
            }
        });
    }

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 20);
        }, { passive: true });
    }

    // Intersection observer for scroll animations
    const sections = document.querySelectorAll('.glass-card, .quote-card');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });

        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(24px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(section);
        });
    }
});

// ==================== NAVIGATION ====================
function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h')) || 68;
        const top = el.getBoundingClientRect().top + window.scrollY - navH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
    }
}

function smoothNav(event, id) {
    event.preventDefault();
    scrollToSection(id);
    // Close mobile menu if open
    const menu = document.getElementById('mobileMenu');
    const hamburger = document.getElementById('hamburger');
    if (menu) menu.classList.remove('open');
    if (hamburger) hamburger.classList.remove('open');
}

function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    const hamburger = document.getElementById('hamburger');
    if (menu) menu.classList.toggle('open');
    if (hamburger) hamburger.classList.toggle('open');
}

// ==================== MOOD SELECTION ====================
function selectMood(mood) {
    selectedMood = mood;
    document.querySelectorAll('.mood-option').forEach(el => el.classList.remove('selected'));
    const el = document.querySelector(`[data-mood="${mood}"]`);
    if (el) el.classList.add('selected');
}

// ==================== SLIDER MANAGEMENT ====================
function updateSlider(id) {
    const slider = document.getElementById(id);
    if (!slider) return;
    const value = slider.value;
    const valEl = document.getElementById(`${id}-value`);
    if (valEl) valEl.textContent = `${value}/5`;
    const fill = document.getElementById(`${id}-fill`);
    if (fill) fill.style.width = `${(value - 1) * 25}%`;
}

function updateAllSliders() {
    ['stress', 'sleep', 'energy', 'focus'].forEach(id => updateSlider(id));
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.style.background = type === 'error'
        ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
        : 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ==================== STREAK CALCULATION ====================
function loadStreak() {
    const entries = JSON.parse(localStorage.getItem('mindmate_checkins') || '[]');
    const journals = JSON.parse(localStorage.getItem('mindmate_journals') || '[]');

    // Count totals
    const totalCheckins = entries.length;
    const totalJournals = journals.length;

    // Calculate streak (consecutive days with at least one check-in)
    let streak = 0;
    if (entries.length > 0) {
        const uniqueDates = [...new Set(entries.map(e => e.date))].sort().reverse();
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // Streak only counts if today or yesterday was checked in
        if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
            streak = 1;
            for (let i = 1; i < uniqueDates.length; i++) {
                const prev = new Date(uniqueDates[i - 1]);
                const curr = new Date(uniqueDates[i]);
                const diff = (prev - curr) / (1000 * 60 * 60 * 24);
                if (diff === 1) {
                    streak++;
                } else {
                    break;
                }
            }
        }
    }

    const streakEl = document.getElementById('streakCount');
    const checkinsEl = document.getElementById('totalCheckins');
    const journalsEl = document.getElementById('totalJournals');

    if (streakEl) streakEl.textContent = streak;
    if (checkinsEl) checkinsEl.textContent = totalCheckins;
    if (journalsEl) journalsEl.textContent = totalJournals;
}

// ==================== CHECK-IN FUNCTIONALITY ====================
function saveCheckin() {
    if (!selectedMood) {
        showToast('Please select your mood first! 😊', 'error');
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    const entries = JSON.parse(localStorage.getItem('mindmate_checkins') || '[]');
    const alreadyCheckedIn = entries.some(e => e.date === today);

    const entry = {
        date: today,
        timestamp: new Date().toISOString(),
        mood: selectedMood,
        stress: parseInt(document.getElementById('stress').value),
        sleep: parseInt(document.getElementById('sleep').value),
        energy: parseInt(document.getElementById('energy').value),
        focus: parseInt(document.getElementById('focus').value),
        overwhelmed: document.getElementById('overwhelmed').checked,
        oneWord: document.getElementById('oneword').value
    };

    entries.push(entry);
    localStorage.setItem('mindmate_checkins', JSON.stringify(entries));

    showToast(alreadyCheckedIn ? 'Check-in updated ✔️' : 'Check-in saved! Keep it up 🔥');
    loadInsights();
    loadStreak();
}

// ==================== JOURNAL FUNCTIONALITY ====================
function saveJournal() {
    const drained = document.getElementById('drained').value.trim();
    const better = document.getElementById('better').value.trim();
    const g1 = document.getElementById('gratitude1') ? document.getElementById('gratitude1').value.trim() : '';
    const g2 = document.getElementById('gratitude2') ? document.getElementById('gratitude2').value.trim() : '';
    const g3 = document.getElementById('gratitude3') ? document.getElementById('gratitude3').value.trim() : '';

    if (!drained && !better && !g1 && !g2 && !g3) {
        showToast('Please write something first! ✍️', 'error');
        return;
    }

    const entry = {
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        drained,
        better,
        gratitude: [g1, g2, g3].filter(Boolean)
    };

    const journals = JSON.parse(localStorage.getItem('mindmate_journals') || '[]');
    journals.push(entry);
    localStorage.setItem('mindmate_journals', JSON.stringify(journals));

    document.getElementById('drained').value = '';
    document.getElementById('better').value = '';
    if (document.getElementById('gratitude1')) document.getElementById('gratitude1').value = '';
    if (document.getElementById('gratitude2')) document.getElementById('gratitude2').value = '';
    if (document.getElementById('gratitude3')) document.getElementById('gratitude3').value = '';

    showToast('Journal saved 💙');
    loadStreak();
}

// ==================== BREATHING EXERCISES ====================
function setBreathingMode(mode, event) {
    breathingMode = mode;
    resetBreathing();
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');

    const panicProgress = document.getElementById('panicProgress');
    if (panicProgress) {
        panicProgress.style.display = mode === 'panic' ? 'block' : 'none';
    }
}

function startBreathing() {
    if (breathingInterval) return;
    breathingPaused = false;
    breathingStep = 0;
    currentCycle = 0;

    const cycleText = document.getElementById('cycleText');
    if (cycleText) {
        if (breathingMode === 'box') {
            cycleText.textContent = `Cycle 1/${boxTotalCycles}`;
        } else if (breathingMode === '478') {
            cycleText.textContent = `Cycle 1/${fourSevenEightCycles}`;
        } else if (breathingMode === 'panic') {
            cycleText.textContent = `Cycle 1/${panicTotalCycles}`;
        }
    }

    runBreathingCycle();
}

function pauseBreathing() {
    breathingPaused = true;
    if (breathingInterval) {
        clearInterval(breathingInterval);
        breathingInterval = null;
    }
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
    const text = document.getElementById('breathingText');
    if (text) text.textContent = 'Paused';
}

function resetBreathing() {
    breathingPaused = false;
    breathingStep = 0;
    if (breathingInterval) {
        clearInterval(breathingInterval);
        breathingInterval = null;
    }
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }

    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');
    const progressFill = document.getElementById('panicProgressFill');

    if (circle) {
        circle.className = 'breathing-circle';
        circle.style.transform = 'scale(1)';
        circle.style.opacity = '1';
    }
    if (text) {
        text.textContent = 'Ready';
        text.style.opacity = '1';
    }
    if (progressFill) progressFill.style.width = '0%';

    const cycleText = document.getElementById('cycleText');
    if (cycleText) cycleText.textContent = '';
}

function runBreathingCycle() {
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');
    if (!circle || !text) return;

    if (breathingMode === 'box') {
        const steps = [
            { duration: 4000, text: 'Inhale…', class: 'inhale', scale: 1.5 },
            { duration: 4000, text: 'Hold…', class: 'hold-in', scale: 1.5 },
            { duration: 4000, text: 'Exhale…', class: 'exhale', scale: 0.75 },
            { duration: 4000, text: 'Hold…', class: 'hold-out', scale: 0.75 }
        ];
        breathingSequence(steps, circle, text);
    } else if (breathingMode === '478') {
        const steps = [
            { duration: 4000, text: 'Inhale (4s)', class: 'inhale', scale: 1.5 },
            { duration: 7000, text: 'Hold (7s)', class: 'hold-in', scale: 1.5 },
            { duration: 8000, text: 'Exhale (8s)', class: 'exhale', scale: 0.75 }
        ];
        breathingSequence(steps, circle, text);
    } else if (breathingMode === 'panic') {
        panicReset(circle, text);
    }
}

function breathingSequence(steps, circle, text) {
    const step = steps[breathingStep % steps.length];

    animateText(text, step.text);
    circle.className = `breathing-circle ${step.class}`;
    animateCircle(circle, step.scale, step.duration);

    breathingInterval = setTimeout(() => {
        if (!breathingPaused) {
            breathingStep++;

            if (breathingMode === 'box' && breathingStep % 4 === 0) {
                currentCycle++;
                const cycleEl = document.getElementById('cycleText');
                if (currentCycle < boxTotalCycles) {
                    if (cycleEl) cycleEl.textContent = `Cycle ${currentCycle + 1}/${boxTotalCycles}`;
                } else {
                    if (cycleEl) cycleEl.textContent = '✅ Complete!';
                    completionEffect(circle, text);
                    return;
                }
            }

            if (breathingMode === '478' && breathingStep % 3 === 0) {
                currentCycle++;
                const cycleEl = document.getElementById('cycleText');
                if (currentCycle < fourSevenEightCycles) {
                    if (cycleEl) cycleEl.textContent = `Cycle ${currentCycle + 1}/${fourSevenEightCycles}`;
                } else {
                    if (cycleEl) cycleEl.textContent = '✅ Complete!';
                    completionEffect(circle, text);
                    return;
                }
            }

            breathingSequence(steps, circle, text);
        }
    }, step.duration);
}

function completionEffect(circle, text) {
    circle.className = 'breathing-circle complete';
    animateText(text, 'Well done! 🎉');
    animateCircle(circle, 1.1, 600);
    setTimeout(() => resetBreathing(), 2800);
}

function animateCircle(circle, targetScale, duration) {
    const startScale = parseFloat(circle.style.transform.replace(/scale\(|\)/g, '') || 1);
    const startTime = performance.now();

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        const currentScale = startScale + (targetScale - startScale) * eased;
        circle.style.transform = `scale(${currentScale})`;
        if (progress < 1 && !breathingPaused) {
            animationFrame = requestAnimationFrame(animate);
        }
    }

    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(animate);
}

function animateText(text, newText) {
    text.style.transition = 'opacity 0.2s ease-out';
    text.style.opacity = '0';
    setTimeout(() => {
        text.textContent = newText;
        text.style.opacity = '1';
    }, 200);
}

function panicReset(circle, text) {
    let cycle = 0;
    const totalCycles = panicTotalCycles;
    const progressFill = document.getElementById('panicProgressFill');
    const cycleEl = document.getElementById('cycleText');

    function runCycle() {
        if (breathingPaused || cycle >= totalCycles) {
            if (cycle >= totalCycles) {
                animateText(text, 'Complete! 🎉');
                if (progressFill) progressFill.style.width = '100%';
                circle.className = 'breathing-circle complete';
                animateCircle(circle, 1.2, 500);
                if (cycleEl) cycleEl.textContent = '✅ Complete!';
                setTimeout(() => resetBreathing(), 2500);
            }
            return;
        }

        animateText(text, 'Breathe In…');
        circle.className = 'breathing-circle inhale';
        animateCircle(circle, 1.4, 3000);

        breathingInterval = setTimeout(() => {
            if (breathingPaused) return;

            animateText(text, 'Breathe Out…');
            circle.className = 'breathing-circle exhale';
            animateCircle(circle, 0.85, 3000);

            cycle++;
            if (cycleEl) cycleEl.textContent = `Cycle ${cycle}/${totalCycles}`;
            if (progressFill) {
                progressFill.style.transition = 'width 0.5s ease-out';
                progressFill.style.width = `${(cycle / totalCycles) * 100}%`;
            }

            breathingInterval = setTimeout(() => {
                if (!breathingPaused) runCycle();
            }, 3000);
        }, 3000);
    }

    if (cycleEl) cycleEl.textContent = `Cycle 1/${totalCycles}`;
    runCycle();
}

// ==================== INSIGHTS & CHARTS ====================
function toggleChart(type, event) {
    activeChartType = type;
    document.querySelectorAll('.chart-toggle').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    loadInsights();
}

function loadInsights() {
    const entries = JSON.parse(localStorage.getItem('mindmate_checkins') || '[]');

    const emptyState = document.getElementById('emptyState');
    const chartContainer = document.getElementById('chartContainer');

    if (entries.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        if (chartContainer) chartContainer.style.display = 'none';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (chartContainer) chartContainer.style.display = 'block';

    const last7Days = entries.slice(-7);
    const labels = last7Days.map(e => {
        const date = new Date(e.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const datasets = {
        stress: {
            label: 'Stress Level',
            data: last7Days.map(e => e.stress),
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4
        },
        sleep: {
            label: 'Sleep Quality',
            data: last7Days.map(e => e.sleep),
            borderColor: '#8B5CF6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: true,
            tension: 0.4
        },
        energy: {
            label: 'Energy Level',
            data: last7Days.map(e => e.energy),
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4
        },
        focus: {
            label: 'Focus Level',
            data: last7Days.map(e => e.focus),
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true,
            tension: 0.4
        }
    };

    if (currentChart) currentChart.destroy();

    const canvas = document.getElementById('insightsChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [datasets[activeChartType]]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: { family: 'Poppins', size: 13 },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    titleColor: '#374151',
                    bodyColor: '#6B7280',
                    borderColor: 'rgba(139, 92, 246, 0.2)',
                    borderWidth: 1,
                    padding: 12,
                    titleFont: { family: 'Poppins', weight: '600' },
                    bodyFont: { family: 'Poppins' }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 0,
                    max: 5,
                    ticks: {
                        stepSize: 1,
                        font: { family: 'Poppins', size: 12 }
                    },
                    grid: {
                        color: 'rgba(139, 92, 246, 0.08)'
                    }
                },
                x: {
                    ticks: { font: { family: 'Poppins', size: 12 } },
                    grid: { color: 'rgba(139, 92, 246, 0.06)' }
                }
            }
        }
    });
}

// ==================== DATA MANAGEMENT ====================
function clearAllData() {
    if (confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
        localStorage.removeItem('mindmate_checkins');
        localStorage.removeItem('mindmate_journals');
        localStorage.removeItem('mindmate_seen_intro');
        showToast('All data cleared 🗑️');
        loadInsights();
        loadStreak();
        location.reload();
    }
}
