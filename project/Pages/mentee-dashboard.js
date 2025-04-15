document.addEventListener("DOMContentLoaded", function() {
    loadProfile();
    loadRequestedAppointments();
    loadScheduledAppointments();
});

// Authenticate and store token
function login(email, password) {
    axios.post("/login", { email, password })
        .then(response => {
            window.localStorage.setItem("authToken", response.data.token); // Store token
            window.location.href = "/mentee-dashboard.html"; // Redirect to dashboard
        })
        .catch(error => alert("Login failed: " + error.response.data.message));
}

/*function editProfile() {
    document.getElementById("profile-view").style.display = "none";
    document.getElementById("profile-edit").style.display = "block";
}*/

// Load mentee profile from backend
function loadProfile() {
    const authToken = window.localStorage.getItem("authToken");
    const menteeEmail = window.localStorage.getItem("menteeEmail");
    
    if (!authToken) {
        console.error("No authentication token found. Please log in again.");
        window.location.href = "mentee-login.html";
        return;
    }

// Fetch mentee profile data
fetch("http://localhost:5000/mentee/profile", {
    headers: { Authorization: authToken }
})
.then(response => {
    if (!response.ok) {
        throw new Error("Failed to fetch profile");
    }
    return response.json();
})
.then(mentee => {
    updateProfileUI(mentee);
})
.catch(error => {
    console.error("Error fetching mentee profile:", error);
    // You might want to redirect to login or show an error message
});
}

// Update UI with mentee data
function updateProfileUI(mentee) {
    if (mentee && Object.keys(mentee).length > 0) {
        window.localStorage.setItem("menteeEmail", mentee.email);

        document.getElementById("mentee-photo").src = mentee.photo || "Images/default-avatar.png";
        document.getElementById("mentee-name").textContent = mentee.name || "N/A";
        document.getElementById("mentee-registrationNumber").textContent = mentee.registrationNumber || "N/A";
        document.getElementById("mentee-department").textContent = mentee.department || "N/A";
        document.getElementById("mentee-section").textContent = mentee.section || "N/A";
        document.getElementById("mentee-phone").textContent = mentee.phone || "N/A";
        document.getElementById("mentee-email").textContent = mentee.email || "N/A";
    } else {
        console.log("Mentee profile not found");
    }
}

// Edit profile functionality
function editProfile() {
    // Get the current profile view div
    const profileView = document.getElementById("profile-view");
    
    // Check if there's already an edit form
    let profileEdit = document.getElementById("profile-edit");
    
    if (!profileEdit) {
        // Create edit form if it doesn't exist
        profileEdit = document.createElement("div");
        profileEdit.id = "profile-edit";
        profileEdit.innerHTML = `
            <div class="form-group">
                <label for="photo">Profile Photo:</label>
                <input type="file" id="photo">
            </div>
            <div class="form-group">
                <label for="name">Name:</label>
                <input type="text" id="name" placeholder="Name" value="${document.getElementById("mentee-name").textContent !== 'N/A' ? document.getElementById("mentee-name").textContent : ''}">
            </div>
            <div class="form-group">
                <label for="registrationNumber">Registration No.:</label>
                <input type="text" id="registrationNumber" placeholder="Registration Number" value="${document.getElementById("mentee-registrationNumber").textContent !== 'N/A' ? document.getElementById("mentee-registrationNumber").textContent : ''}">
            </div>
            <div class="form-group">
                <label for="department">Department:</label>
                <input type="text" id="department" placeholder="Department" value="${document.getElementById("mentee-department").textContent !== 'N/A' ? document.getElementById("mentee-department").textContent : ''}">
            </div>
            <div class="form-group">
                <label for="section">Section:</label>
                <input type="text" id="section" placeholder="Section" value="${document.getElementById("mentee-section").textContent !== 'N/A' ? document.getElementById("mentee-section").textContent : ''}">
            </div>
            <div class="form-group">
                <label for="phone">Phone:</label>
                <input type="text" id="phone" placeholder="Phone Number" value="${document.getElementById("mentee-phone").textContent !== 'N/A' ? document.getElementById("mentee-phone").textContent : ''}">
            </div>
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" placeholder="Email" value="${document.getElementById("mentee-email").textContent !== 'N/A' ? document.getElementById("mentee-email").textContent : ''}">
            </div>
            <div class="action-buttons">
                <button class="primary-btn" onclick="saveProfile()">Save</button>
                <button class="primary-btn" onclick="cancelEdit()">Cancel</button>
            </div>
        `;
        
        
        profileView.parentNode.appendChild(profileEdit);
    }
    
    
    profileView.style.display = "none";
    profileEdit.style.display = "block";
}

// Cancel profile editing
function cancelEdit() {
    document.getElementById("profile-view").style.display = "block";
    document.getElementById("profile-edit").style.display = "none";
}

// Save profile changes
function saveProfile() {
    const authToken = window.localStorage.getItem("authToken");
    const menteeEmail = window.localStorage.getItem("menteeEmail");

    if (!authToken) {
        alert("Error: Authentication token not found. Please log in again.");
        window.location.href = "mentee-login.html";
        return;
    }

    const menteeData = {
        email: menteeEmail,
        name: document.getElementById("name").value,
        registrationNumber: document.getElementById("registrationNumber").value,
        department: document.getElementById("department").value,
        section: document.getElementById("section").value,
        phone: document.getElementById("phone").value,
        
        ...(document.getElementById("email").value !== menteeEmail && 
           document.getElementById("email").value.includes('@') && 
           {email: document.getElementById("email").value})
    };

    
    const photoInput = document.getElementById("photo");
    if (photoInput.files && photoInput.files[0]) {
        
        console.log("Photo selected for upload:", photoInput.files[0].name);
        
    }

    fetch("http://localhost:5000/mentee/update-profile", {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': authToken 
        },
        body: JSON.stringify(menteeData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save profile');
        }
        return response.json();
    })
    .then(data => {
        alert("Profile updated successfully!");
        document.getElementById("profile-edit").style.display = "none";
        document.getElementById("profile-view").style.display = "block";
        loadProfile(); // Reload profile with updated data
    })
    .catch(error => {
        console.error("Error saving profile:", error);
        alert("Failed to save profile. Please try again.");
    });
}

// Load requested appointments (pending or rejected)
function loadRequestedAppointments() {
    const authToken = window.localStorage.getItem("authToken");
    const menteeEmail = window.localStorage.getItem("menteeEmail");
    
    // Get a reference to the section
    const requestedSection = document.querySelector('.card:nth-child(2)');
    
    // Show debugging info in development
    console.log("Loading appointments for:", menteeEmail);
    console.log("Auth token exists:", !!authToken);
    
    if (!authToken || !menteeEmail) {
        console.error("Authentication information missing", { authToken: !!authToken, menteeEmail });
        requestedSection.innerHTML = `
            <h2>Requested Appointments</h2>
            <p>Authentication error. Please <a href="mentee-login.html">log in again</a>.</p>
        `;
        return;
    }
    
    // Show loading state
    requestedSection.innerHTML = `
        <h2>Requested Appointments</h2>
        <p><i class="fas fa-spinner fa-spin"></i> Loading appointment requests...</p>
    `;
    
    // Make the API request
    fetch(`http://localhost:5000/mentee/requested-appointments/${menteeEmail}`)
    .then(response => {
        console.log("API response status:", response.status);
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(appointments => {
        console.log("Fetched appointments:", appointments);
        
        if (!appointments || appointments.length === 0) {
            console.log("No appointments found for", menteeEmail);
            requestedSection.innerHTML = `
                <h2>Requested Appointments</h2>
                <p>You have no pending appointment requests.</p>
                <button onclick="bookNewAppointment()" class="newappointment-btn">Book New Appointment</button>
            `;
            return;
        }
        
        // Create a table for appointment requests
        let tableHTML = `
            <h2>Requested Appointments</h2>
            <div class="table-container">
                <table class="appointments-table">
                    <thead>
                        <tr>
                            <th>Mentor</th>
                            <th>Department</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        appointments.forEach(appointment => {
            tableHTML += `
                <tr>
                    <td>${appointment.mentorName || 'N/A'}</td>
                    <td>${appointment.mentorDepartment || 'N/A'}</td>
                    <td>${formatDate(appointment.date)}</td>
                    <td>${appointment.time}</td>
                    <td><span class="status ${appointment.status.toLowerCase()}">${appointment.status}</span></td>
                    <td>
                        ${appointment.status === 'Pending' ? 
                          `<button onclick="cancelAppointment('${appointment._id}')" class="secondary-btn small">Cancel</button>` : 
                          ''}
                    </td>
                </tr>
            `;
        });
        
        tableHTML += `
                    </tbody>
                </table>
            </div>
            <button onclick="bookNewAppointment()" class="newappointment-btn">Book New Appointment</button>
        `;
        
        requestedSection.innerHTML = tableHTML;
    })
    .catch(error => {
        console.error("Error loading requested appointments:", error);
        requestedSection.innerHTML = `
            <h2>Requested Appointments</h2>
            <p>Error loading appointment requests: ${error.message}</p>
            <button onclick="loadRequestedAppointments()" class="secondary-btn">Try Again</button>
            <button onclick="bookNewAppointment()" class="newappointment-btn">Book New Appointment</button>
        `;
    });
}

// Load scheduled (confirmed) appointments
function loadScheduledAppointments() {
    const authToken = window.localStorage.getItem("authToken");
    const menteeEmail = window.localStorage.getItem("menteeEmail");
    
    if (!authToken || !menteeEmail) {
        console.error("Authentication information missing");
        return;
    }
    
    fetch(`http://localhost:5000/mentee/scheduled-appointments/${menteeEmail}`, {
        headers: { Authorization: authToken }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load scheduled appointments');
        }
        return response.json();
    })
    .then(appointments => {
        const scheduledSection = document.querySelector('.card:nth-child(3)');
        
        if (appointments.length === 0) {
            scheduledSection.innerHTML = `
                <h2>Scheduled Appointments</h2>
                <p>No scheduled appointments found.</p>
            `;
            return;
        }
        
        // Group appointments by date for calendar display
        const appointmentsByDate = {};
        appointments.forEach(appointment => {
            const dateStr = new Date(appointment.date).toISOString().split('T')[0];
            if (!appointmentsByDate[dateStr]) {
                appointmentsByDate[dateStr] = [];
            }
            appointmentsByDate[dateStr].push(appointment);
        });
        
        // Create a calendar view for scheduled appointments
        scheduledSection.innerHTML = `
            <h2>Scheduled Appointments</h2>
            <div class="calendar-container">
                <div class="calendar-header">
                    <button id="prev-month">&lt;</button>
                    <h3 id="current-month">April 2025</h3>
                    <button id="next-month">&gt;</button>
                </div>
                <div class="weekdays">
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                </div>
                <div id="calendar-days" class="calendar-grid"></div>
            </div>
            <div id="day-appointments" class="day-appointments" style="display: none;">
                <h4 id="selected-date-heading"></h4>
                <div id="appointment-details"></div>
            </div>
        `;
        
        // Initialize calendar with appointment data
        initializeCalendar(appointmentsByDate);
        
        // Add event listeners for calendar navigation
        document.getElementById('prev-month').addEventListener('click', () => changeMonth(-1, appointmentsByDate));
        document.getElementById('next-month').addEventListener('click', () => changeMonth(1, appointmentsByDate));
    })
    .catch(error => {
        console.error("Error loading scheduled appointments:", error);
        document.querySelector('.card:nth-child(3)').innerHTML = `
            <h2>Scheduled Appointments</h2>
            <p>Error loading scheduled appointments. Please try again later.</p>
        `;
    });
}

// Calendar functionality
let currentDate = new Date();

function initializeCalendar(appointmentsByDate) {
    renderCalendar(appointmentsByDate);
}

function renderCalendar(appointmentsByDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Set the current month text
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById('current-month').textContent = `${monthNames[month]} ${year}`;
    
    // Calculate first day of month and total days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
    
    const calendarGrid = document.getElementById('calendar-days');
    calendarGrid.innerHTML = '';
    
    // Add empty cells for days of previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day', 'other-month');
        calendarGrid.appendChild(dayElement);
    }
    
    // Add days of current month
    const today = new Date();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        dayElement.textContent = day;
        
        // Check if it's today
        if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
            dayElement.classList.add('today');
        }
        
        // Format date string to check for appointments
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Check if date has appointments
        if (appointmentsByDate && appointmentsByDate[dateString] && appointmentsByDate[dateString].length > 0) {
            dayElement.classList.add('has-appointments');
            
            // Add click event to show appointments for this day
            dayElement.addEventListener('click', function() {
                showAppointmentsForDay(dateString, appointmentsByDate[dateString]);
                
                // Mark as selected
                document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
                this.classList.add('selected');
            });
        }
        
        calendarGrid.appendChild(dayElement);
    }
}

function changeMonth(delta, appointmentsByDate) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderCalendar(appointmentsByDate);
}

function showAppointmentsForDay(dateString, appointments) {
    const dayAppointments = document.getElementById('day-appointments');
    const dateHeading = document.getElementById('selected-date-heading');
    const appointmentDetails = document.getElementById('appointment-details');
    
    // Format date for display
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    dateHeading.textContent = formattedDate;
    
    // Display appointments for this day
    appointmentDetails.innerHTML = '';
    appointments.forEach(appointment => {
        const appointmentCard = document.createElement('div');
        appointmentCard.classList.add('appointment-card');
        appointmentCard.innerHTML = `
            <h4>${appointment.time}</h4>
            <p><strong>Mentor:</strong> ${appointment.mentorName}</p>
            <p><strong>Department:</strong> ${appointment.mentorDepartment || 'N/A'}</p>
            <p><strong>Specialty:</strong> ${appointment.mentorSpecialty || 'N/A'}</p>
            <div class="appointment-actions">
                <button class="secondary-btn" onclick="cancelAppointment('${appointment._id}')">Cancel</button>
                <button class="primary-btn" onclick="contactMentor('${appointment.mentorEmail}')">Contact</button>
            </div>
        `;
        appointmentDetails.appendChild(appointmentCard);
    });
    
    dayAppointments.style.display = 'block';
}

// Cancel an appointment
function cancelAppointment(appointmentId) {
    const authToken = window.localStorage.getItem("authToken");
    
    if (!authToken) {
        alert("Authentication error. Please log in again.");
        return;
    }
    
    if (confirm("Are you sure you want to cancel this appointment?")) {
        fetch(`http://localhost:5000/mentee/cancel-appointment/${appointmentId}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': authToken 
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to cancel appointment');
            }
            return response.json();
        })
        .then(data => {
            alert("Appointment cancelled successfully!");
            loadRequestedAppointments();
            loadScheduledAppointments();
        })
        .catch(error => {
            console.error("Error cancelling appointment:", error);
            alert("Failed to cancel appointment. Please try again.");
        });
    }
}

// Contact mentor (open email client)
function contactMentor(mentorEmail) {
    window.location.href = `mailto:${mentorEmail}`;
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Book a new appointment
function bookNewAppointment() {
    window.location.href = "appointment.html";
}

document.addEventListener("DOMContentLoaded", function () {
    // Other load functions already exist
    document.getElementById("edit-profile-btn").addEventListener("click", editProfile);
});
