// Surf spot data for SF beaches
const surfSpots = {
    'ocean-beach': {
        name: 'Ocean Beach',
        description: 'The Main Break - Heavy and Hollow',
        crowdFactor: 'heavy',
        vibe: 'Gnarly paddle-outs, serious juice',
        lat: 37.760,
        lon: -122.513
    },
    'pacifica': {
        name: 'Pacifica / Linda Mar',
        description: 'The Mellow Zone - Perfect for Learning',
        crowdFactor: 'mellow',
        vibe: 'Friendly lineup, good vibes',
        lat: 37.638,
        lon: -122.494
    },
    'mavericks': {
        name: 'Mavericks',
        description: 'Big Wave Capital - Legends Only',
        crowdFactor: 'invitation only',
        vibe: 'Death-defying giants, respect required',
        lat: 37.493,
        lon: -122.500
    },
    'fort-point': {
        name: 'Fort Point',
        description: 'Under the Golden Gate - Urban Shred',
        crowdFactor: 'locals',
        vibe: 'Classic left, bridge views',
        lat: 37.807,
        lon: -122.477
    },
    'bolinas': {
        name: 'Bolinas',
        description: 'The Secret Spot - Shhh...',
        crowdFactor: 'locals only',
        vibe: 'Keep it on the down-low',
        lat: 37.906,
        lon: -122.701
    }
};

// State management
let userLevel = localStorage.getItem('surfLevel') || null;
let selectedBeach = localStorage.getItem('surfBeach') || 'ocean-beach';

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

    // Restore previously selected beach
    document.querySelectorAll('.beach-tab').forEach(tab => tab.classList.remove('active'));
    const savedTab = document.querySelector(`[data-beach="${selectedBeach}"]`);
    if (savedTab) {
        savedTab.classList.add('active');
    }

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
    localStorage.setItem('surfBeach', beach);

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

async function generateForecast() {
    const forecastGrid = document.getElementById('forecast-grid');
    const spot = surfSpots[selectedBeach];

    // Clear existing forecast
    forecastGrid.innerHTML = '';

    // Warn users away from Mavericks unless they are rippers
    if (selectedBeach === 'mavericks' && userLevel !== 'ripper') {
        forecastGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <h3 style="color: #ff00ff; font-size: 2rem;">WHOA THERE, ${userLevel ? userLevel.toUpperCase() : 'BUDDY'}!</h3>
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

    try {
        const response = await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${spot.lat}&longitude=${spot.lon}&daily=wave_height_max&timezone=auto&forecast_days=7`);
        const data = await response.json();

        const days = data.daily.time;
        const heights = data.daily.wave_height_max;

        days.forEach((date, index) => {
            const heightFt = (heights[index] * 3.281).toFixed(1);
            const condition = getCondition(heightFt);
            const bestTime = generateBestTime(condition, index);
            const dayName = index === 0 ? 'Today' : new Date(date).toLocaleDateString(undefined, { weekday: 'long' });

            const card = document.createElement('div');
            card.className = 'forecast-card';

            card.innerHTML = `
                <div class="day-name">${dayName}</div>
                <div class="wave-height">${heightFt}ft</div>
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
    } catch (err) {
        forecastGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px;">Unable to load forecast</div>';
        console.error(err);
    }
}

function getCondition(heightFt) {
    const h = parseFloat(heightFt);
    if (h >= 10) {
        return 'Epic';
    } else if (h >= 6) {
        return 'Firing';
    } else if (h >= 3) {
        return 'Fair';
    } else {
        return 'Blown Out';
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