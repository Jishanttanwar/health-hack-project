// MindMate - Mental Wellness App JavaScript
// All functionality for mood tracking, journaling, breathing exercises, and insights

// ==================== STATE MANAGEMENT ====================
let selectedMood = null;
let breathingMode = 'box';
let breathingInterval = null;
let breathingPaused = false;
let breathingStep = 0;
let currentChart = null;
let activeChartType = 'stress';

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    updateAllSliders();
    loadInsights();
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

// ==================== BREATHING EXERCISES ====================
function setBreathingMode(mode) {
    breathingMode = mode;
    resetBreathing();
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (mode === 'panic') {
        document.getElementById('panicProgress').style.display = 'block';
    } else {
        document.getElementById('panicProgress').style.display = 'none';
    }
}

function startBreathing() {
    if (breathingInterval) return;
    breathingPaused = false;
    breathingStep = 0;
    runBreathingCycle();
}

function pauseBreathing() {
    breathingPaused = true;
    if (breathingInterval) {
        clearInterval(breathingInterval);
        breathingInterval = null;
    }
}

function resetBreathing() {
    breathingPaused = false;
    breathingStep = 0;
    if (breathingInterval) {
        clearInterval(breathingInterval);
        breathingInterval = null;
    }
    document.getElementById('breathingCircle').className = 'breathing-circle';
    document.getElementById('breathingText').textContent = 'Ready';
    document.getElementById('panicProgressFill').style.width = '0%';
}

function runBreathingCycle() {
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');

    if (breathingMode === 'box') {
        const steps = [
            { duration: 4000, text: 'Inhale', class: 'inhale' },
            { duration: 4000, text: 'Hold', class: 'inhale' },
            { duration: 4000, text: 'Exhale', class: 'exhale' },
            { duration: 4000, text: 'Hold', class: 'exhale' }
        ];
        breathingSequence(steps, circle, text);
    } else if (breathingMode === '478') {
        const steps = [
            { duration: 4000, text: 'Inhale', class: 'inhale' },
            { duration: 7000, text: 'Hold', class: 'inhale' },
            { duration: 8000, text: 'Exhale', class: 'exhale' }
        ];
        breathingSequence(steps, circle, text);
    } else if (breathingMode === 'panic') {
        panicReset(circle, text);
    }
}

function breathingSequence(steps, circle, text) {
    const step = steps[breathingStep % steps.length];
    text.textContent = step.text;
    circle.className = `breathing-circle ${step.class}`;

    setTimeout(() => {
        if (!breathingPaused) {
            breathingStep++;
            breathingSequence(steps, circle, text);
        }
    }, step.duration);
}

function panicReset(circle, text) {
    let cycle = 0;
    const totalCycles = 5;
    const progressFill = document.getElementById('panicProgressFill');

    function runCycle() {
        if (breathingPaused || cycle >= totalCycles) {
            if (cycle >= totalCycles) {
                text.textContent = 'Complete!';
                progressFill.style.width = '100%';
                setTimeout(() => resetBreathing(), 2000);
            }
            return;
        }

        // Inhale
        text.textContent = 'Breathe In';
        circle.className = 'breathing-circle inhale';
        
        setTimeout(() => {
            if (breathingPaused) return;
            // Exhale
            text.textContent = 'Breathe Out';
            circle.className = 'breathing-circle exhale';
            
            cycle++;
            progressFill.style.width = `${(cycle / totalCycles) * 100}%`;
            
            setTimeout(() => {
                if (!breathingPaused) runCycle();
            }, 3000);
        }, 3000);
    }

    runCycle();
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