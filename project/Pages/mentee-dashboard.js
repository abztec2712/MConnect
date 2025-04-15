// Event listener for when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    loadProfile();
    loadRequestedAppointments();
    loadScheduledAppointments();
});

// Authenticate and store token
function login(email, password) {
    axios.post("mentee/login", { email, password })
        .then(response => {
            window.localStorage.setItem("authToken", response.data.token); // Store token
            window.location.href = "/mentee-dashboard.html"; // Redirect to dashboard
        })
        .catch(error => alert("Login failed: " + error.response.data.message));
}

function editProfile() {
    document.getElementById("profile-view").style.display = "none";
    document.getElementById("profile-edit").style.display = "block";
}


// Function to edit profile
function editProfile() {
    document.getElementById("profile-view").style.display = "none";
    document.getElementById("profile-edit").style.display = "block";
}

// Load mentor profile 
function loadProfile() {
    const authToken = window.localStorage.getItem("authToken");
    const menteeEmail = window.localStorage.getItem("menteeEmail");
    
    if (!authToken) {
        console.error("No authentication token found. Please log in again.");
        window.location.href = "mentee-login.html";
        return;
    }

    // Try the token-based endpoint first (no email in URL)
    axios.get("http://localhost:5000/mentee/get-profile", {
        headers: { Authorization: authToken }
    })
    .then(response => {
        const mentee = response.data;
        updateProfileUI(mentee);
    })
    .catch(error => {
        console.log("Token-based profile fetch failed, trying email-based endpoint...");
        
        // Fall back to email-based endpoint if token approach fails
        if (mentorEmail) {
            axios.get(`http://localhost:5000/mentee/get-profile/${menteeEmail}`)
            .then(response => {
                const mentee = response.data;
                updateProfileUI(mentee);
            })
            .catch(error => {
                console.error("Both profile fetch methods failed:", error);
                editProfile();
            });
        } else {
            console.error("No mentee email available for fallback fetch");
            editProfile();
        }
    });
}

// Separate function to update UI with mentor data
function updateProfileUI(mentee) {
    if (mentee && Object.keys(mentee).length > 0) {
        window.localStorage.setItem("menteeEmail", mentee.email || mentee.collegeEmail);

        document.getElementById("mentee-photo").src = mentee.photo || "Images/default-avatar.png";
        document.getElementById("mentee-name").textContent = mentee.name || "N/A";
        document.getElementById("mentee-registrationnumber").textContent = mentee.registrationNumber || "N/A";
        document.getElementById("mentee-department").textContent = mentee.department || "N/A";
        document.getElementById("mentee-section").textContent = mentee.section || "N/A";
        document.getElementById("mentee-phone").textContent = mentee.phone || "N/A";
        document.getElementById("mentee-email").textContent = email || "N/A";

        document.getElementById("name").value = mentee.name || "";
        document.getElementById("registrationnumber").value = mentee.registrationNumber || "";
        document.getElementById("department").value = mentee.department || "";
        document.getElementById("section").value = mentor.section || "";
        document.getElementById("phone").value = mentee.phone || "";
        document.getElementById("email").value = mentee.collegeEmail || mentee.email || "";
    } else {
        console.log("Mentee profile not found. Enabling edit mode.");
        editProfile();
    }
}

// Save profile data
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
    registrationNumber: document.getElementById("registrationnumber").value,
    department: document.getElementById("department").value,
    section: document.getElementById("section").value,
    phone: document.getElementById("phone").value,
    collegeEmail: document.getElementById("email").value,
};

axios.post("http://localhost:5000/mentee/update-profile", menteeData, {
    headers: { Authorization: authToken }
})
.then(response => {
    alert(response.data.message);
    document.getElementById("profile-edit").style.display = "none";
    document.getElementById("profile-view").style.display = "block";
    loadProfile();
})

.catch(error => {
    console.error("Error saving profile:", error);
    alert("Failed to save profile. Please try again.");
});
}

document.addEventListener("DOMContentLoaded", function() {
    loadProfile();
    
    // Add event listeners for section navigation
    document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", function(e) {
            const sectionId = this.getAttribute("onclick").match(/'([^']+)'/)[1];
            
            // Load data based on selected section
            if (sectionId === "appointments") {
                loadAppointments();
            } else if (sectionId === "scheduled") {
                loadScheduledAppointments();
            }
        });
    });
});

/* // Function to cancel edit
function cancelEdit() {
    document.getElementById("profile-edit").style.display = "none";
    document.getElementById("profile-view").style.display = "block";
}

// Function to save profile
function saveProfile() {
    const authToken = window.localStorage.getItem("authToken");
    const menteeEmail = window.localStorage.getItem("menteeEmail");

    if (!authToken) {
        alert("Authentication token missing. Please log in.");
        window.location.href = "mentee-login.html";
        return;
    }

    const updatedEmail = document.getElementById("email").value;

    const menteeData = {
        email: updatedEmail,
        name: document.getElementById("name").value,
        registrationNumber: document.getElementById("registrationNumber").value,
        department: document.getElementById("department").value,
        section: document.getElementById("section").value,
        phone: document.getElementById("phone").value
    };

    const photoInput = document.getElementById("photo");
    if (photoInput.files.length > 0) {
        console.log("Photo upload placeholder:", photoInput.files[0].name);
    }

    axios.post("http://localhost:5000/mentee/update-profile", menteeData, {
        headers: { Authorization: authToken }
    })
    .then(response => {
        alert("Profile updated successfully!");
        document.getElementById("profile-edit").style.display = "none";
        document.getElementById("profile-view").style.display = "block";
        loadProfile();
    })
    .catch(error => {
        console.error("Error updating profile:", error);
        alert("Profile update failed.");
    });
}

// Function to book new appointment
function bookNewAppointment() {
    window.location.href = "appointment.html";
}



function loadProfile() {
    const authToken = window.localStorage.getItem("authToken");
    const menteeEmail = window.localStorage.getItem("menteeEmail");

    if (!authToken) {
        console.error("No authentication token found. Please log in again.");
        window.location.href = "mentee-login.html";
        return;
    }

    axios.get("http://localhost:5000/mentee/profile", {
        headers: { Authorization: authToken }
    })
    .then(response => {
        const mentee = response.data;
        updateProfileUI(mentee);
    })
    .catch(error => {
        console.log("Token fetch failed, trying email fallback...");
        if (menteeEmail) {
            axios.get(`http://localhost:5000/mentee/profile/${menteeEmail}`)
                .then(response => updateProfileUI(response.data))
                .catch(err => {
                    console.error("Both profile fetch methods failed:", err);
                    editProfile();
                });
        } else {
            console.error("No mentee email available for fallback");
            editProfile();
        }
    });
}

function updateProfileUI(mentee) {
    if (!mentee || Object.keys(mentee).length === 0) return editProfile();

    const email = mentee.email || mentee.collegeEmail;

    window.localStorage.setItem("menteeEmail", email);

    document.getElementById("mentee-photo").src = mentee.photo || "Images/default-avatar.png";
    document.getElementById("mentee-name").textContent = mentee.name || "N/A";
    document.getElementById("mentee-registrationnumber").textContent = mentee.registrationNumber || "N/A";
    document.getElementById("mentee-department").textContent = mentee.department || "N/A";
    document.getElementById("mentee-section").textContent = mentee.section || "N/A";
    document.getElementById("mentee-phone").textContent = mentee.phone || "N/A";
    document.getElementById("mentee-email").textContent = email || "N/A";

    const fields = ["name", "registrationNumber", "department", "section", "phone", "email"];
    fields.forEach(field => {
        const input = document.getElementById(field);
        if (input) input.value = mentee[field] || '';
    });
} */

// Load requested appointments (pending or rejected)
function loadRequestedAppointments() {
    const authToken = window.localStorage.getItem("authToken");
    const menteeEmail = window.localStorage.getItem("menteeEmail");
    
    if (!authToken || !menteeEmail) {
        console.error("Authentication information missing");
        return;
    }
    
    fetch(`http://localhost:5000/mentee/requested-appointments/${menteeEmail}`, {
        headers: { Authorization: authToken }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load appointments');
        }
        return response.json();
    })
    .then(appointments => {
        const requestedSection = document.querySelector('.card:nth-child(2)');
        
        if (appointments.length === 0) {
            requestedSection.innerHTML = `
                <h2>Requested Appointments</h2>
                <p>No appointment requests currently.</p>
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
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        appointments.forEach(appointment => {
            tableHTML += `
                <tr>
                    <td>${appointment.mentorName || 'N/A'}</td>
                    <td>${formatDate(appointment.date)}</td>
                    <td>${appointment.time}</td>
                    <td><span class="status ${appointment.status.toLowerCase()}">${appointment.status}</span></td>
                    <td>${appointment.remarks || 'No remarks'}</td>
                </tr>
            `;
        });
        
        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;
        
        requestedSection.innerHTML = tableHTML;
    })
    .catch(error => {
        console.error("Error loading requested appointments:", error);
        document.querySelector('.card:nth-child(2)').innerHTML = `
            <h2>Requested Appointments</h2>
            <p>Error loading appointment requests. Please try again later.</p>
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