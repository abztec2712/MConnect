document.addEventListener("DOMContentLoaded", function () {
    loadProfile();
    loadAppointments();
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

    if (!mentorEmail && document.getElementById("email")) {
        mentorEmail = document.getElementById("email").value;
        if (mentorEmail) {
            window.localStorage.setItem("mentorEmail", mentorEmail);
        }
    }
    
    axios.get(`http://localhost:5000/get-profile/${mentorEmail}`, {
        headers: { Authorization: authToken }
    })
    .then(response => {
        const mentor = response.data;
        if (mentor && Object.keys(mentor).length > 0) {
            window.localStorage.setItem("mentorEmail", mentor.email);

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
    })
    
    .catch(error => {
        console.error("Error loading profile:", error);
        if (error.response && error.response.status === 401) {
            alert("Your session has expired. Please log in again.");
            window.location.href = "mentor-login.html";
        } else {
            editProfile();
        }
    });
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

// Load and display appointment requests
function loadAppointments() {
    const authToken = window.localStorage.getItem("authToken");
    if (!authToken) {
        console.error("Authentication token not found.");
        return;
    }

    axios.get("/get-appointments", {
        headers: { Authorization: authToken }
    })
        .then(response => {
            const appointmentList = document.getElementById("appointment-list");
            appointmentList.innerHTML = "";

            response.data.forEach(appointment => {
                const listItem = document.createElement("li");
                listItem.innerHTML = `<strong>${appointment.studentName}</strong> - ${appointment.date} at ${appointment.time}`;
                listItem.onclick = () => window.open(`mailto:${appointment.studentEmail}`);
                appointmentList.appendChild(listItem);
            });
        })
        .catch(error => console.error("Error loading appointments:", error));
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