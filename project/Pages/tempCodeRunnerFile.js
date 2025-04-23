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

    axios.post("/update-appointment-status", {
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
