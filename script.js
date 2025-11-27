// Data storage (in a real app, this would be a database)
let players = JSON.parse(localStorage.getItem('players')) || [];
let attendance = JSON.parse(localStorage.getItem('attendance')) || [];
let sessions = JSON.parse(localStorage.getItem('sessions')) || [];

// Tab switching
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons and content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
        
        // Refresh the view for the active tab
        if (button.dataset.tab === 'players') refreshPlayersList();
        if (button.dataset.tab === 'attendance') refreshAttendanceView();
        if (button.dataset.tab === 'fees') updateFeesView();
        if (button.dataset.tab === 'sessions') refreshSessionsList();
    });
});

// Players Management
document.getElementById('playerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const player = {
        id: Date.now(),
        name: document.getElementById('playerName').value,
        age: document.getElementById('playerAge').value,
        phone: document.getElementById('playerPhone').value,
        email: document.getElementById('playerEmail').value,
        joinDate: new Date().toISOString().split('T')[0],
        fees: {} // Will store fee status by month-year
    };
    
    players.push(player);
    saveData();
    this.reset();
    refreshPlayersList();
    alert('Player added successfully!');
});

function refreshPlayersList() {
    const container = document.getElementById('playersList');
    container.innerHTML = '';
    
    players.forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';
        playerCard.innerHTML = `
            <div class="player-info">
                <h4>${player.name}</h4>
                <p>Age: ${player.age} | Phone: ${player.phone || 'N/A'} | Email: ${player.email || 'N/A'}</p>
            </div>
            <div class="actions">
                <button class="btn-edit" onclick="editPlayer(${player.id})">Edit</button>
                <button class="btn-delete" onclick="deletePlayer(${player.id})">Delete</button>
            </div>
        `;
        container.appendChild(playerCard);
    });
}

function deletePlayer(id) {
    if (confirm('Are you sure you want to delete this player?')) {
        players = players.filter(p => p.id !== id);
        saveData();
        refreshPlayersList();
    }
}

// Attendance Management
function refreshAttendanceView() {
    const container = document.getElementById('attendancePlayers');
    const dateInput = document.getElementById('attendanceDate');
    
    // Set default date to today
    if (!dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    container.innerHTML = '';
    
    players.forEach(player => {
        const attendanceItem = document.createElement('div');
        attendanceItem.className = 'attendance-item';
        attendanceItem.innerHTML = `
            <input type="checkbox" id="attendance-${player.id}" data-player="${player.id}">
            <label for="attendance-${player.id}">${player.name}</label>
        `;
        container.appendChild(attendanceItem);
    });
}

function markAttendance() {
    const date = document.getElementById('attendanceDate').value;
    const checkboxes = document.querySelectorAll('#attendancePlayers input[type="checkbox"]');
    
    // Remove existing attendance for this date
    attendance = attendance.filter(a => a.date !== date);
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            attendance.push({
                date: date,
                playerId: parseInt(checkbox.dataset.player),
                status: 'present'
            });
        }
    });
    
    saveData();
    alert('Attendance saved successfully!');
}

// Fees Management
function updateFeesView() {
    const month = document.getElementById('feeMonth').value;
    const year = document.getElementById('feeYear').value;
    const container = document.getElementById('feesList');
    
    container.innerHTML = '';
    
    let paidCount = 0;
    let totalCollected = 0;
    
    players.forEach(player => {
        const feeKey = `${month}-${year}`;
        const isPaid = player.fees && player.fees[feeKey];
        
        if (isPaid) {
            paidCount++;
            totalCollected += 1000; // Assuming fixed fee of ₹1000
        }
        
        const feeItem = document.createElement('div');
        feeItem.className = 'fee-item';
        feeItem.innerHTML = `
            <span>${player.name}</span>
            <span class="fee-status ${isPaid ? 'paid' : 'pending'}">
                ${isPaid ? 'PAID' : 'PENDING'}
            </span>
            <button onclick="toggleFeeStatus(${player.id}, '${feeKey}')">
                ${isPaid ? 'Mark Pending' : 'Mark Paid'}
            </button>
        `;
        container.appendChild(feeItem);
    });
    
    // Update summary
    document.getElementById('totalPlayers').textContent = players.length;
    document.getElementById('paidCount').textContent = paidCount;
    document.getElementById('pendingCount').textContent = players.length - paidCount;
    document.getElementById('totalCollected').textContent = totalCollected;
}

function toggleFeeStatus(playerId, feeKey) {
    const player = players.find(p => p.id === playerId);
    if (!player.fees) player.fees = {};
    
    if (player.fees[feeKey]) {
        delete player.fees[feeKey];
    } else {
        player.fees[feeKey] = {
            paid: true,
            amount: 1000,
            paidDate: new Date().toISOString().split('T')[0]
        };
    }
    
    saveData();
    updateFeesView();
}

// Sessions Management
document.getElementById('sessionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const session = {
        id: Date.now(),
        date: document.getElementById('sessionDate').value,
        time: document.getElementById('sessionTime').value,
        coach: document.getElementById('coachName').value,
        type: document.getElementById('sessionType').value,
        created: new Date().toISOString()
    };
    
    sessions.push(session);
    saveData();
    this.reset();
    refreshSessionsList();
    alert('Session added successfully!');
});

function refreshSessionsList() {
    const container = document.getElementById('sessionsList');
    container.innerHTML = '';
    
    // Sort sessions by date (newest first)
    const sortedSessions = sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedSessions.forEach(session => {
        const sessionCard = document.createElement('div');
        sessionCard.className = 'session-card';
        sessionCard.innerHTML = `
            <div class="session-info">
                <h4>${session.type} Session</h4>
                <p>Date: ${session.date} | Time: ${session.time}</p>
                <p>Coach: ${session.coach}</p>
            </div>
            <div class="actions">
                <button class="btn-delete" onclick="deleteSession(${session.id})">Delete</button>
            </div>
        `;
        container.appendChild(sessionCard);
    });
}

function deleteSession(id) {
    if (confirm('Are you sure you want to delete this session?')) {
        sessions = sessions.filter(s => s.id !== id);
        saveData();
        refreshSessionsList();
    }
}

// Data persistence
function saveData() {
    localStorage.setItem('players', JSON.stringify(players));
    localStorage.setItem('attendance', JSON.stringify(attendance));
    localStorage.setItem('sessions', JSON.stringify(sessions));
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    refreshPlayersList();
    updateFeesView();
    refreshSessionsList();
});
