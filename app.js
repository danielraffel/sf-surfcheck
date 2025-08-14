// Surf spot data for SF beaches
const surfSpots = {
    'ocean-beach': {
        name: 'Ocean Beach',
        description: 'The Main Break - Heavy and Hollow',
        characteristics: {
            grom: { minWave: 2, maxWave: 4, bestTide: 'mid', bestWind: 'offshore' },
            intermediate: { minWave: 4, maxWave: 8, bestTide: 'low-mid', bestWind: 'offshore' },
            ripper: { minWave: 6, maxWave: 15, bestTide: 'low', bestWind: 'offshore' }
        },
        crowdFactor: 'heavy',
        vibe: 'Gnarly paddle-outs, serious juice'
    },
    'pacifica': {
        name: 'Pacifica / Linda Mar',
        description: 'The Mellow Zone - Perfect for Learning',
        characteristics: {
            grom: { minWave: 1, maxWave: 3, bestTide: 'all', bestWind: 'light' },
            intermediate: { minWave: 2, maxWave: 5, bestTide: 'mid-high', bestWind: 'light offshore' },
            ripper: { minWave: 3, maxWave: 6, bestTide: 'high', bestWind: 'offshore' }
        },
        crowdFactor: 'mellow',
        vibe: 'Friendly lineup, good vibes'
    },
    'mavericks': {
        name: 'Mavericks',
        description: 'Big Wave Capital - Legends Only',
        characteristics: {
            grom: { minWave: 0, maxWave: 0, bestTide: 'none', bestWind: 'none' },
            intermediate: { minWave: 0, maxWave: 0, bestTide: 'none', bestWind: 'none' },
            ripper: { minWave: 15, maxWave: 50, bestTide: 'low', bestWind: 'offshore' }
        },
        crowdFactor: 'invitation only',
        vibe: 'Death-defying giants, respect required'
    },
    'fort-point': {
        name: 'Fort Point',
        description: 'Under the Golden Gate - Urban Shred',
        characteristics: {
            grom: { minWave: 2, maxWave: 4, bestTide: 'high', bestWind: 'light' },
            intermediate: { minWave: 3, maxWave: 6, bestTide: 'mid-high', bestWind: 'west' },
            ripper: { minWave: 4, maxWave: 10, bestTide: 'mid', bestWind: 'west' }
        },
        crowdFactor: 'locals',
        vibe: 'Classic left, bridge views'
    },
    'bolinas': {
        name: 'Bolinas',
        description: 'The Secret Spot - Shhh...',
        characteristics: {
            grom: { minWave: 2, maxWave: 4, bestTide: 'mid', bestWind: 'light' },
            intermediate: { minWave: 3, maxWave: 7, bestTide: 'mid-low', bestWind: 'offshore' },
            ripper: { minWave: 5, maxWave: 12, bestTide: 'low', bestWind: 'offshore' }
        },
        crowdFactor: 'locals only',
        vibe: 'Keep it on the down-low'
    }
};

// State management
let userLevel = localStorage.getItem('surfLevel') || null;
let selectedBeach = 'ocean-beach';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Check for saved user level
    if (userLevel) {
        activateSkillButton(userLevel);
        showForecast();
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Generate initial forecast if user level exists
    if (userLevel) {
        generateForecast();
    }
}

function setupEventListeners() {
    // Skill level buttons
    const skillButtons = document.querySelectorAll('.skill-btn');
    skillButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const level = e.currentTarget.dataset.level;
            selectSkillLevel(level);
        });
    });
    
    // Beach tabs
    const beachTabs = document.querySelectorAll('.beach-tab');
    beachTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            selectBeach(e.currentTarget.dataset.beach);
        });
    });
}

function selectSkillLevel(level) {
    userLevel = level;
    localStorage.setItem('surfLevel', level);
    activateSkillButton(level);
    generateForecast();
    showForecast();
}

function activateSkillButton(level) {
    // Remove active class from all buttons
    document.querySelectorAll('.skill-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to selected button
    const activeBtn = document.querySelector(`[data-level="${level}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

function selectBeach(beach) {
    selectedBeach = beach;
    
    // Update active tab
    document.querySelectorAll('.beach-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-beach="${beach}"]`).classList.add('active');
    
    // Regenerate forecast for new beach
    if (userLevel) {
        generateForecast();
    }
}

function showForecast() {
    const forecastContainer = document.querySelector('.forecast-container');
    forecastContainer.style.display = 'block';
}

function generateForecast() {
    const forecastGrid = document.getElementById('forecast-grid');
    const spot = surfSpots[selectedBeach];
    const characteristics = spot.characteristics[userLevel];
    
    // Clear existing forecast
    forecastGrid.innerHTML = '';
    
    // Check if this spot is appropriate for user level
    if (characteristics.minWave === 0 && selectedBeach === 'mavericks' && userLevel !== 'ripper') {
        forecastGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <h3 style="color: #ff00ff; font-size: 2rem;">WHOA THERE, ${userLevel.toUpperCase()}!</h3>
                <p style="color: #ffff00; font-size: 1.2rem; margin-top: 20px;">
                    Mavericks ain't for you yet, brah. This wave will straight-up eat you for breakfast.
                    Keep training and maybe one day you'll charge these monsters. 
                </p>
                <p style="color: #00ffff; margin-top: 15px;">
                    🚫 Try Ocean Beach or Pacifica instead! 🚫
                </p>
            </div>
        `;
        return;
    }
    
    // Generate 7-day forecast
    const days = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
    const conditions = ['Epic', 'Firing', 'Fair', 'Blown Out'];
    const timeSlots = ['Dawn Patrol', 'Morning Glass', 'Midday', 'Afternoon', 'Sunset Session'];
    
    days.forEach((day, index) => {
        // Generate semi-random but realistic conditions
        const waveHeight = generateWaveHeight(characteristics, index);
        const condition = generateCondition(waveHeight, characteristics, index);
        const bestTime = generateBestTime(condition, index);
        
        const card = document.createElement('div');
        card.className = 'forecast-card';
        
        card.innerHTML = `
            <div class="day-name">${day}</div>
            <div class="wave-height">${waveHeight.min}-${waveHeight.max}ft</div>
            <div class="best-time">
                <strong>Best:</strong><br>
                ${bestTime}
            </div>
            <div class="conditions condition-${condition.toLowerCase().replace(' ', '-')}">
                ${condition}
            </div>
        `;
        
        forecastGrid.appendChild(card);
    });
}

function generateWaveHeight(characteristics, dayIndex) {
    // Create somewhat realistic wave patterns
    const baseVariation = Math.sin(dayIndex * 0.8) * 2;
    const minWave = Math.max(1, characteristics.minWave + Math.floor(baseVariation));
    const maxWave = Math.min(characteristics.maxWave + Math.ceil(baseVariation * 1.5), 
                            characteristics.maxWave * 1.5);
    
    return {
        min: minWave,
        max: maxWave
    };
}

function generateCondition(waveHeight, characteristics, dayIndex) {
    // Determine conditions based on wave height and user level
    const avgWave = (waveHeight.min + waveHeight.max) / 2;
    const idealRange = (characteristics.minWave + characteristics.maxWave) / 2;
    
    // Add some randomness for wind conditions
    const windFactor = Math.random();
    
    if (windFactor < 0.2) {
        return 'Blown Out';
    } else if (avgWave >= idealRange - 1 && avgWave <= idealRange + 1 && windFactor > 0.7) {
        return 'Epic';
    } else if (avgWave >= characteristics.minWave && avgWave <= characteristics.maxWave && windFactor > 0.4) {
        return 'Firing';
    } else {
        return 'Fair';
    }
}

function generateBestTime(condition, dayIndex) {
    // Generate best surf times based on conditions
    const times = {
        'Epic': ['Dawn Patrol 6AM', 'Sunset 6PM'],
        'Firing': ['Morning 8AM', 'Afternoon 4PM'],
        'Fair': ['Midday 12PM', 'Morning 10AM'],
        'Blown Out': ['Try Tomorrow', 'Check Again']
    };
    
    const timesForCondition = times[condition];
    return timesForCondition[dayIndex % 2];
}

// Add some rad console messages
console.log('%c🏄 WELCOME TO SF SURF CHECK 🏄', 
    'background: linear-gradient(90deg, #ff00ff, #00ffff); color: #000; font-size: 20px; font-weight: bold; padding: 10px;');
console.log('%cMay your sessions be glassy and your barrels deep!', 
    'color: #ffff00; font-size: 14px; font-style: italic;');
console.log('%cRespect the ocean, respect the locals', 
    'color: #00ffff; font-size: 12px;');