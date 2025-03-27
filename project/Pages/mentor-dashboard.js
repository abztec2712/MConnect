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
axios.post("/login", { email, password })
    .then(response => {
        localStorage.setItem("mentorEmail", response.data.mentorEmail); // ✅ Store email
        window.location.href = "/mentor-dashboard.html"; // Redirect to dashboard
    })
    .catch(error => alert("Login failed: " + error.response.data.message));


// Load mentor profile dynamically
function loadProfile() {
    const mentorEmail = localStorage.getItem("mentorEmail"); // Get email from localStorage
    if (!mentorEmail) {
        console.error("No mentor email found. Please log in again.");
        return;
    }

    axios.get(`/get-profile/${mentorEmail}`)
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

// Enable profile edit mode
function editProfile() {
    document.getElementById("profile-view").style.display = "none";
    document.getElementById("profile-edit").style.display = "block";
}

// Save profile data to MongoDB
function saveProfile() {
    const mentorEmail = localStorage.getItem("mentorEmail"); // Ensure mentor email is used
    if (!mentorEmail) {
        alert("Error: Mentor email not found. Please log in again.");
        return;
    }

    const mentorData = {
        email: mentorEmail, // Use the correct mentor email
        name: document.getElementById("name").value,
        occupation: document.getElementById("occupation").value,
        position: document.getElementById("position").value,
        department: document.getElementById("department").value,
        specialty: document.getElementById("specialty").value,
        phone: document.getElementById("phone").value,
        collegeEmail: document.getElementById("collegeEmail").value,
        photo: document.getElementById("photo").value // Ideally, handle image upload separately
    };

    axios.post("/update-profile", mentorData)
        .then(response => {
            alert(response.data.message);
            location.reload();
        })
        .catch(error => console.error("Error saving profile:", error));
}

// Save availability in MongoDB
function saveAvailability() {
    const mentorEmail = localStorage.getItem("mentorEmail"); // Get email dynamically
    if (!mentorEmail) {
        alert("Error: Mentor email not found.");
        return;
    }

    const availabilityData = {
        mentorEmail: mentorEmail,
        date: document.getElementById("available-date").value,
        startTime: document.getElementById("start-time").value,
        endTime: document.getElementById("end-time").value
    };

    axios.post("/save-availability", availabilityData)
        .then(response => alert("Availability saved successfully!"))
        .catch(error => console.error("Error saving availability:", error));
}

// Load and display appointment requests
function loadAppointments() {
    const appointmentList = document.getElementById("appointment-list");
    appointmentList.innerHTML = "<li>Loading...</li>";

    axios.get("/get-appointments")  // Endpoint needs to be implemented in `server.js`
        .then(response => {
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
