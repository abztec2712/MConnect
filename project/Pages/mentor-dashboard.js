document.addEventListener("DOMContentLoaded", function () {
    loadProfile();
    loadAppointments();
});
// Calendar functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeCalendar();
    
    // Add event listeners for calendar navigation
    document.getElementById('prev-month').addEventListener('click', () => changeMonth(-1));
    document.getElementById('next-month').addEventListener('click', () => changeMonth(1));
    
    // Add event listener for adding time slots
    document.getElementById('add-time-slot').addEventListener('click', addTimeSlot);
    
    // Add event listeners for save and cancel buttons
    document.getElementById('save-time-slots').addEventListener('click', saveTimeSlots);
    document.getElementById('cancel-time-slots').addEventListener('click', hideTimeSlotContainer);
});

// Show the selected section and hide others
function showSection(sectionId) {
    document.querySelectorAll(".card").forEach(section => {
        section.style.display = "none";
    });
    document.getElementById(sectionId).style.display = "block";
}

// Authenticate and store token
function login(email, password) {
    axios.post("/login", { email, password })
        .then(response => {
            window.localStorage.setItem("authToken", response.data.token); // Store token
            window.location.href = "/mentor-dashboard.html"; // Redirect to dashboard
        })
        .catch(error => alert("Login failed: " + error.response.data.message));
}

function editProfile() {
    document.getElementById("profile-view").style.display = "none";
    document.getElementById("profile-edit").style.display = "block";
}

// Load mentor profile 
function loadProfile() {
    const authToken = window.localStorage.getItem("authToken");
    const mentorEmail = window.localStorage.getItem("mentorEmail");
    
    if (!authToken) {
        console.error("No authentication token found. Please log in again.");
        window.location.href = "mentor-login.html";
        return;
    }

    // Try the token-based endpoint first (no email in URL)
    axios.get("http://localhost:5000/get-profile", {
        headers: { Authorization: authToken }
    })
    .then(response => {
        const mentor = response.data;
        updateProfileUI(mentor);
    })
    .catch(error => {
        console.log("Token-based profile fetch failed, trying email-based endpoint...");
        
        // Fall back to email-based endpoint if token approach fails
        if (mentorEmail) {
            axios.get(`http://localhost:5000/get-profile/${mentorEmail}`)
            .then(response => {
                const mentor = response.data;
                updateProfileUI(mentor);
            })
            .catch(error => {
                console.error("Both profile fetch methods failed:", error);
                editProfile();
            });
        } else {
            console.error("No mentor email available for fallback fetch");
            editProfile();
        }
    });
}

// Separate function to update UI with mentor data
function updateProfileUI(mentor) {
    if (mentor && Object.keys(mentor).length > 0) {
        window.localStorage.setItem("mentorEmail", mentor.email || mentor.collegeEmail);

        document.getElementById("mentor-photo").src = mentor.photo || "default.jpg";
        document.getElementById("mentor-name").textContent = mentor.name || "N/A";
        document.getElementById("mentor-occupation").textContent = mentor.occupation || "N/A";
            
        const positionElement = document.getElementById("mentor-position");
        if (positionElement) {
            positionElement.textContent = mentor.position || "N/A";
        }
            
        document.getElementById("mentor-department").textContent = mentor.department || "N/A";
        document.getElementById("mentor-specialty").textContent = mentor.specialty || "N/A";
        document.getElementById("mentor-phone").textContent = mentor.phone || "N/A";
        document.getElementById("mentor-email").textContent = mentor.collegeEmail || "N/A";

        document.getElementById("name").value = mentor.name || "";
        document.getElementById("occupation").value = mentor.occupation || "";
        document.getElementById("department").value = mentor.department || "";
        document.getElementById("specialty").value = mentor.specialty || "";
        document.getElementById("phone").value = mentor.phone || "";
        document.getElementById("email").value = mentor.collegeEmail || mentor.email || "";
    } else {
        console.log("Mentor profile not found. Enabling edit mode.");
        editProfile();
    }
}

// Save profile data
function saveProfile() {
    const authToken = window.localStorage.getItem("authToken");
    const mentorEmail = window.localStorage.getItem("mentorEmail");

if (!authToken) {
    alert("Error: Authentication token not found. Please log in again.");
    window.location.href = "mentor-login.html";
    return;
}

const mentorData = {
    email: mentorEmail,
    name: document.getElementById("name").value,
    occupation: document.getElementById("occupation").value,
    department: document.getElementById("department").value,
    specialty: document.getElementById("specialty").value,
    phone: document.getElementById("phone").value,
    collegeEmail: document.getElementById("email").value,
};

axios.post("http://localhost:5000/update-profile", mentorData, {
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

//Setting Availability
let currentDate = new Date();
let selectedDate = null;
let availabilityData = {};

// Initialize and render calendar
function initializeCalendar() {
    renderCalendar();
    fetchMentorAvailability();
}

// Render the calendar for the current month
function renderCalendar() {
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
        
        // Check if it's weekend
        const dayOfWeek = new Date(year, month, day).getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            dayElement.classList.add('weekend');
        }
        
        // Check if date has availability slots
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (availabilityData[dateString] && availabilityData[dateString].length > 0) {
            dayElement.classList.add('has-slots');
        }
        
        // Add click event to select date
        dayElement.addEventListener('click', function() {
            // Remove selected class from all days
            document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
            
            // Add selected class to clicked day
            this.classList.add('selected');
            
            // Set selected date and show time slots container
            selectedDate = new Date(year, month, day);
            showTimeSlotContainer(dateString);
        });
        
        calendarGrid.appendChild(dayElement);
    }
}

// Change month (previous or next)
function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderCalendar();
}

// Fetch mentor availability data from server
function fetchMentorAvailability() {
    const mentorEmail = window.localStorage.getItem("mentorEmail");
    const authToken = window.localStorage.getItem("authToken");
    
    if (!mentorEmail || !authToken) {
        console.error("Missing mentor email or auth token");
        return;
    }
    
    axios.get(`http://localhost:5000/get-availability/${mentorEmail}`, {
        headers: { Authorization: authToken }
    })
    .then(response => {
        // Process and organize availability data by date
        availabilityData = {};
        
        response.data.forEach(slot => {
            if (!availabilityData[slot.date]) {
                availabilityData[slot.date] = [];
            }
            
            availabilityData[slot.date].push({
                startTime: slot.startTime,
                endTime: slot.endTime
            });
        });
        
        // Re-render calendar to show dates with availability
        renderCalendar();
    })
    .catch(error => {
        console.error("Error fetching availability data:", error);
    });
}

// Show time slots container for selected date
function showTimeSlotContainer(dateString) {
    const container = document.getElementById('time-slots-container');
    const dateLabel = document.getElementById('selected-date');
    
    // Format the date for display
    const formattedDate = new Date(dateString).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    dateLabel.textContent = formattedDate;
    
    // Clear existing time slots
    const timeSlotsList = document.getElementById('time-slots-list');
    timeSlotsList.innerHTML = '';
    
    // Add existing time slots for the selected date
    if (availabilityData[dateString] && availabilityData[dateString].length > 0) {
        availabilityData[dateString].forEach(slot => {
            addTimeSlot(slot.startTime, slot.endTime);
        });
    } else {
        // Add one empty time slot by default
        addTimeSlot();
    }
    
    // Show the container
    container.style.display = 'block';
}

// Hide time slots container
function hideTimeSlotContainer() {
    document.getElementById('time-slots-container').style.display = 'none';
}

// Add a new time slot
function addTimeSlot(startTime = '', endTime = '') {
    const timeSlotsList = document.getElementById('time-slots-list');
    
    const timeSlotDiv = document.createElement('div');
    timeSlotDiv.classList.add('time-slot');
    
    timeSlotDiv.innerHTML = `
        <input type="time" class="start-time" value="${startTime}" required>
        <span>to</span>
        <input type="time" class="end-time" value="${endTime}" required>
        <button type="button" class="time-slot-remove">&times;</button>
    `;
    
    // Add remove functionality
    timeSlotDiv.querySelector('.time-slot-remove').addEventListener('click', function() {
        timeSlotDiv.remove();
    });
    
    timeSlotsList.appendChild(timeSlotDiv);
}

// Save time slots to server
function saveTimeSlots() {
    if (!selectedDate) {
        alert("Please select a date first");
        return;
    }
    
    const timeSlots = document.querySelectorAll('.time-slot');
    const mentorEmail = window.localStorage.getItem("mentorEmail");
    const authToken = window.localStorage.getItem("authToken");
    
    if (!mentorEmail || !authToken) {
        alert("Authentication error. Please log in again.");
        return;
    }
    
    // Format the date
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1; 
    const day = selectedDate.getDate();
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Delete existing time slots for this date
    axios.delete(`http://localhost:5000/delete-availability/${mentorEmail}/${dateString}`, {
        headers: { Authorization: authToken }
    })
    .then(() => {
        // Add each time slot
        const timeSlotPromises = Array.from(timeSlots).map(slot => {
            const startTime = slot.querySelector('.start-time').value;
            const endTime = slot.querySelector('.end-time').value;
            
            // Validate time inputs
            if (!startTime || !endTime) {
                return Promise.reject("Please fill in all time fields");
            }
            
            // Ensure end time is after start time
            if (startTime >= endTime) {
                return Promise.reject("End time must be after start time");
            }
            
            return axios.post('http://localhost:5000/save-availability', {
                mentorEmail,
                date: dateString,
                startTime,
                endTime
            }, {
                headers: { Authorization: authToken }
            });
        });
        
        return Promise.all(timeSlotPromises);
    })
    .then(() => {
        alert("Availability saved successfully!");
        
        // Update availabilityData
        if (!availabilityData[dateString]) {
            availabilityData[dateString] = [];
        }
        
        availabilityData[dateString] = Array.from(timeSlots).map(slot => {
            return {
                startTime: slot.querySelector('.start-time').value,
                endTime: slot.querySelector('.end-time').value
            };
        });
        
        // Update calendar display
        renderCalendar();
        
        // Hide time slots container
        hideTimeSlotContainer();
    })
    .catch(error => {
        console.error("Error saving availability:", error);
        alert(typeof error === 'string' ? error : "Error saving availability. Please try again.");
    });
}

const baseUrl = "http://localhost:5000";

// Load and display appointment requests
function loadAppointments() {
    const mentorEmail = localStorage.getItem("mentorEmail");
    const baseUrl = "http://localhost:5000"; // or whatever your backend base is

    axios.get(`${baseUrl}/get-appointments/${mentorEmail}`)
        .then(res => {
            const tableBody = document.getElementById("appointment-requests-body");
            tableBody.innerHTML = "";

            res.data.forEach(app => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${app.studentName}</td>
                    <td>${app.studentEmail}</td>
                    <td>${app.notes || "No note added"}</td>
                    <td>
                        <span class="status-badge status-${app.status.toLowerCase()}">
                            ${app.status}
                        </span>
                    </td>
                    <td>
                        <textarea class="remarks" id="remarks-${app._id}" placeholder="Add remarks..."></textarea>
                    </td>
                    <td class="action-buttons">
                        <button class="accept" onclick="updateAppointmentStatus('${app._id}', 'Confirmed')">Accept</button>
                        <button class="reject" onclick="updateAppointmentStatus('${app._id}', 'Rejected')">Reject</button>
                    </td>
                `;

                tableBody.appendChild(tr);
            });
        })
        .catch(err => console.error("Error loading appointments:", err));
}


function updateAppointmentStatus(appointmentId, status) {
    const remarks = document.getElementById(`remarks-${appointmentId}`).value;
    const baseUrl = "http://localhost:5000"; // Add this line

    axios.post(`${baseUrl}/update-appointment-status`, {
        appointmentId,
        status,
        remarks
    }).then(() => {
        alert(`Appointment ${status}`);
        loadAppointments();
    }).catch(err => {
        console.error("Failed to update appointment:", err);
        alert("Error updating appointment");
    });
}

function loadScheduledAppointments() {
    const mentorEmail = localStorage.getItem("mentorEmail");

    axios.get(`${baseUrl}/get-scheduled-appointments/${mentorEmail}`)

        .then(res => {
            const calendar = document.getElementById("calendar");
            calendar.innerHTML = "";

            res.data.forEach(app => {
                const block = document.createElement("div");
                block.classList.add("calendar-entry");
                block.innerHTML = `
                    <strong>${app.date} - ${app.time}</strong><br>
                    ${app.studentName} (${app.studentEmail})<br>
                    ${app.notes ? `<em>Note: ${app.notes}</em><br>` : ""}
                    ${app.remarks ? `<strong>Remarks: ${app.remarks}</strong>` : ""}
                `;
                calendar.appendChild(block);
            });
        })
        .catch(err => console.error("Error loading scheduled appointments:", err));
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