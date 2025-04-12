ocument.addEventListener("DOMContentLoaded", function () {
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