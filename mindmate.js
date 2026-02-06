// MindMate - Mental Wellness App JavaScript
// All functionality for mood tracking, journaling, breathing exercises, and insights

// ==================== STATE MANAGEMENT ====================
let selectedMood = null;
let breathingMode = 'box';
let breathingInterval = null;
let breathingPaused = false;
let breathingStep = 0;
let boxTotalCycles = 6;          // Box breathing ~2 minutes
let fourSevenEightCycles = 4;    // 4-7-8 breathing
let panicTotalCycles = 5;       // Panic reset
let currentCycle = 0;
let currentChart = null;
let activeChartType = 'stress';

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    updateAllSliders();
    loadInsights();

    // Overwhelmed toggle -> show gentle suggestion
    const overwhelmedToggle = document.getElementById('overwhelmed');
    const overwhelmCard = document.getElementById('overwhelmSuggestion');

    if (overwhelmedToggle && overwhelmCard) {
        overwhelmedToggle.addEventListener('change', () => {
            if (overwhelmedToggle.checked) {
                overwhelmCard.style.display = 'block';
                overwhelmCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                overwhelmCard.style.display = 'none';
            }
        });
    }
});

// ==================== NAVIGATION ====================
function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
}

// ==================== MOOD SELECTION ====================
function selectMood(mood) {
    selectedMood = mood;
    document.querySelectorAll('.mood-option').forEach(el => el.classList.remove('selected'));
    document.querySelector(`[data-mood="${mood}"]`).classList.add('selected');
}

// ==================== SLIDER MANAGEMENT ====================
function updateSlider(id) {
    const slider = document.getElementById(id);
    const value = slider.value;
    document.getElementById(`${id}-value`).textContent = `${value}/5`;
    const fill = document.getElementById(`${id}-fill`);
    fill.style.width = `${(value - 1) * 25}%`;
}

function updateAllSliders() {
    ['stress', 'sleep', 'energy', 'focus'].forEach(id => updateSlider(id));
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ==================== CHECK-IN FUNCTIONALITY ====================
function saveCheckin() {
    if (!selectedMood) {
        alert('Please select your mood first!');
        return;
    }

    const entry = {
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        mood: selectedMood,
        stress: parseInt(document.getElementById('stress').value),
        sleep: parseInt(document.getElementById('sleep').value),
        energy: parseInt(document.getElementById('energy').value),
        focus: parseInt(document.getElementById('focus').value),
        overwhelmed: document.getElementById('overwhelmed').checked,
        oneWord: document.getElementById('oneword').value
    };

    let entries = JSON.parse(localStorage.getItem('mindmate_checkins') || '[]');
    entries.push(entry);
    localStorage.setItem('mindmate_checkins', JSON.stringify(entries));

    showToast('Saved locally ✔️');
    loadInsights();
}

// ==================== JOURNAL FUNCTIONALITY ====================
function saveJournal() {
    const drained = document.getElementById('drained').value;
    const better = document.getElementById('better').value;

    if (!drained && !better) {
        alert('Please write something in your journal!');
        return;
    }

    const entry = {
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        drained: drained,
        better: better
    };

    let journals = JSON.parse(localStorage.getItem('mindmate_journals') || '[]');
    journals.push(entry);
    localStorage.setItem('mindmate_journals', JSON.stringify(journals));

    document.getElementById('drained').value = '';
    document.getElementById('better').value = '';
    showToast('Journal saved ✔️');
}

// ==================== ENHANCED BREATHING EXERCISES ====================

let animationFrame = null;

function setBreathingMode(mode) {
    breathingMode = mode;
    resetBreathing();
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

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

    if (breathingMode === 'box') {
        document.getElementById('cycleText').textContent = `Cycle 1/${boxTotalCycles}`;
    } else if (breathingMode === '478') {
        document.getElementById('cycleText').textContent = `Cycle 1/${fourSevenEightCycles}`;
    } else if (breathingMode === 'panic') {
        document.getElementById('cycleText').textContent = `Cycle 1/${panicTotalCycles}`;
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
    if (progressFill) {
        progressFill.style.width = '0%';
    }
    const cycleText = document.getElementById('cycleText');
    if (cycleText) {
        cycleText.textContent = '';
    }
}

function runBreathingCycle() {
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');

    if (!circle || !text) return;

    if (breathingMode === 'box') {
        const steps = [
            { duration: 4000, text: 'Inhale', class: 'inhale', scale: 1.5 },
            { duration: 4000, text: 'Hold', class: 'hold-in', scale: 1.5 },
            { duration: 4000, text: 'Exhale', class: 'exhale', scale: 0.8 },
            { duration: 4000, text: 'Hold', class: 'hold-out', scale: 0.8 }
        ];
        breathingSequence(steps, circle, text);
    } else if (breathingMode === '478') {
        const steps = [
            { duration: 4000, text: 'Inhale (4s)', class: 'inhale', scale: 1.5 },
            { duration: 7000, text: 'Hold (7s)', class: 'hold-in', scale: 1.5 },
            { duration: 8000, text: 'Exhale (8s)', class: 'exhale', scale: 0.8 }
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

            // Update cycles
            if (breathingMode === 'box' && breathingStep % 4 === 0) {
                currentCycle++;
                if (currentCycle < boxTotalCycles) {
                    document.getElementById('cycleText').textContent = `Cycle ${currentCycle + 1}/${boxTotalCycles}`;
                } else {
                    document.getElementById('cycleText').textContent = 'Complete!';
                    resetBreathing();
                    return;
                }
            }

            if (breathingMode === '478' && breathingStep % 3 === 0) {
                currentCycle++;
                if (currentCycle < fourSevenEightCycles) {
                    document.getElementById('cycleText').textContent = `Cycle ${currentCycle + 1}/${fourSevenEightCycles}`;
                } else {
                    document.getElementById('cycleText').textContent = 'Complete!';
                    resetBreathing();
                    return;
                }
            }

            breathingSequence(steps, circle, text);
        }
    }, step.duration);
}

function animateCircle(circle, targetScale, duration) {
    const startScale = parseFloat(circle.style.transform.replace(/scale\(|\)/g, '') || 1);
    const startTime = performance.now();

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation (easeInOutCubic)
        const eased = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        const currentScale = startScale + (targetScale - startScale) * eased;
        circle.style.transform = `scale(${currentScale})`;

        if (progress < 1 && !breathingPaused) {
            animationFrame = requestAnimationFrame(animate);
        }
    }

    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    animationFrame = requestAnimationFrame(animate);
}

function animateText(text, newText) {
    // Fade out
    text.style.transition = 'opacity 0.2s ease-out';
    text.style.opacity = '0';
    
    setTimeout(() => {
        text.textContent = newText;
        // Fade in
        text.style.opacity = '1';
    }, 200);
}

function panicReset(circle, text) {
    let cycle = 0;
    const totalCycles = panicTotalCycles;
    const progressFill = document.getElementById('panicProgressFill');

    function runCycle() {
        if (breathingPaused || cycle >= totalCycles) {
            if (cycle >= totalCycles) {
                animateText(text, 'Complete! 🎉');
                if (progressFill) progressFill.style.width = '100%';
                circle.className = 'breathing-circle complete';
                animateCircle(circle, 1.2, 500);
                document.getElementById('cycleText').textContent = 'Complete!';
                setTimeout(() => resetBreathing(), 2500);
            }
            return;
        }

        animateText(text, `Breathe In`);
        circle.className = 'breathing-circle inhale';
        animateCircle(circle, 1.4, 3000);

        setTimeout(() => {
            if (breathingPaused) return;

            animateText(text, `Breathe Out`);
            circle.className = 'breathing-circle exhale';
            animateCircle(circle, 0.9, 3000);

            cycle++;
            document.getElementById('cycleText').textContent = `Cycle ${cycle}/${totalCycles}`;

            if (progressFill) {
                progressFill.style.transition = 'width 0.5s ease-out';
                progressFill.style.width = `${(cycle / totalCycles) * 100}%`;
            }

            setTimeout(() => {
                if (!breathingPaused) runCycle();
            }, 3000);
        }, 3000);
    }

    document.getElementById('cycleText').textContent = `Cycle 1/${totalCycles}`;
    runCycle();
}

// Optional: Add particle effects for enhanced visual feedback
function createParticles(circle) {
    const particleCount = 8;
    const container = circle.parentElement;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'breath-particle';
        particle.style.setProperty('--angle', `${(360 / particleCount) * i}deg`);
        container.appendChild(particle);
        
        setTimeout(() => particle.remove(), 1000);
    }
}

// ==================== INSIGHTS & CHARTS ====================
function toggleChart(type) {
    activeChartType = type;
    document.querySelectorAll('.chart-toggle').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadInsights();
}

function loadInsights() {
    const entries = JSON.parse(localStorage.getItem('mindmate_checkins') || '[]');
    
    if (entries.length === 0) {
        document.getElementById('emptyState').style.display = 'block';
        document.getElementById('chartContainer').style.display = 'none';
        return;
    }

    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('chartContainer').style.display = 'block';

    // Get last 7 days
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
            tension: 0.4
        },
        sleep: {
            label: 'Sleep Quality',
            data: last7Days.map(e => e.sleep),
            borderColor: '#8B5CF6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            tension: 0.4
        },
        energy: {
            label: 'Energy Level',
            data: last7Days.map(e => e.energy),
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4
        }
    };

    if (currentChart) {
        currentChart.destroy();
    }

    const ctx = document.getElementById('insightsChart').getContext('2d');
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
                        font: {
                            family: 'Poppins',
                            size: 12
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        stepSize: 1,
                        font: {
                            family: 'Poppins'
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            family: 'Poppins'
                        }
                    }
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
        showToast('All data cleared');
        loadInsights();
        location.reload();
    }
}

