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
            sessionStorage.setItem("authToken", response.data.token); // Store token
            window.location.href = "/mentor-dashboard.html"; // Redirect to dashboard
        })
        .catch(error => alert("Login failed: " + error.response.data.message));
}

function editProfile() {
    document.getElementById("profile-view").style.display = "none";
    document.getElementById("profile-edit").style.display = "block";
}


// Load mentor profile dynamically
function loadProfile() {
    const authToken = sessionStorage.getItem("authToken"); // Get token from sessionStorage
    if (!authToken) {
        console.error("No authentication token found. Please log in again.");
        return;
    }

    axios.get("/get-profile", {
        headers: { Authorization: authToken }
    })
        .then(response => {
            const mentor = response.data;
            if (mentor && Object.keys(mentor).length > 0) {
                document.getElementById("mentor-photo").src = mentor.photo || "default.jpg";
                document.getElementById("mentor-name").textContent = mentor.name || "N/A";
                document.getElementById("mentor-occupation").textContent = mentor.occupation || "N/A";
                document.getElementById("mentor-position").textContent = mentor.position || "N/A";
                document.getElementById("mentor-department").textContent = mentor.department || "N/A";
                document.getElementById("mentor-specialty").textContent = mentor.specialty || "N/A";
                document.getElementById("mentor-phone").textContent = mentor.phone || "N/A";
                document.getElementById("mentor-email").textContent = mentor.collegeEmail || "N/A";
            } else {
                console.log("Mentor profile not found. Enabling edit mode.");
                editProfile();
            }
        })
        .catch(error => console.error("Error loading profile:", error));
}

// Save profile data to MongoDB
function saveProfile() {
    const authToken = sessionStorage.getItem("authToken");
if (!authToken) {
    alert("Error: Authentication token not found. Please log in again.");
    return;
}

axios.post("/update-profile", mentorData, {
    headers: { Authorization: authToken }
})
.then(response => {
    alert(response.data.message);
    location.reload();
})
.catch(error => console.error("Error saving profile:", error));
}

// Load and display appointment requests
function loadAppointments() {
    const authToken = sessionStorage.getItem("authToken");
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
