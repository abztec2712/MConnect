// Global variables
let selectedMentor = null;
let selectedDate = null;
let selectedTimeSlot = null;
let availableDates = [];
let mentorsList = [];

// DOM Elements
const mentorsListEl = document.getElementById('mentors-list');
const selectedMentorSection = document.getElementById('selected-mentor-section');
const appointmentSection = document.getElementById('appointment-section');
const timeSlotsSection = document.getElementById('time-slots-section');
const confirmationSection = document.getElementById('confirmation-section');
const successSection = document.getElementById('success-section');
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotModal = document.getElementById('chatbot-modal');
const closeChatbot = document.getElementById('close-chatbot');
const calendarDays = document.getElementById('calendar-days');
const currentMonthEl = document.getElementById('current-month');
const availableSlotsEl = document.getElementById('available-slots');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Fetch mentors
    fetchMentors();
    
    // Initialize calendar
    initCalendar();
    
    // Setup event listeners
    document.getElementById('prev-month').addEventListener('click', () => changeMonth(-1));
    document.getElementById('next-month').addEventListener('click', () => changeMonth(1));
    
    // Chatbot event listeners
    chatbotToggle.addEventListener('click', toggleChatbot);
    closeChatbot.addEventListener('click', toggleChatbot);
    
    document.getElementById('send-message').addEventListener('click', sendChatMessage);
    document.getElementById('chat-input').addEventListener('keypress', e => {
        if (e.key === 'Enter') sendChatMessage();
    });
});

// Fetch mentors from API
async function fetchMentors() {
    try {
        const response = await fetch('http://localhost:5000/get-all-mentors');
        if (!response.ok) throw new Error('Failed to fetch mentors');
        
        mentorsList = await response.json();
        
        // Populate department and specialty filters
        populateFilters(mentorsList);
        
        // Display mentors
        displayMentors(mentorsList);
    } catch (error) {
        console.error('Error fetching mentors:', error);
        addChatbotMessage('Sorry, there was an error loading mentors. Please try refreshing the page.', 'bot');
    }
}

// Populate department and specialty filters
function populateFilters(mentors) {
    const departmentFilter = document.getElementById('department-filter');
    const specialtyFilter = document.getElementById('specialty-filter');
    
    // Get unique departments and specialties
    const departments = [...new Set(mentors.filter(mentor => mentor.department).map(mentor => mentor.department))];
    const specialties = [...new Set(mentors.filter(mentor => mentor.specialty).map(mentor => mentor.specialty))];
    
    // Add options to department filter
    departments.forEach(department => {
        const option = document.createElement('option');
        option.value = department;
        option.textContent = department;
        departmentFilter.appendChild(option);
    });
    
    // Add options to specialty filter
    specialties.forEach(specialty => {
        const option = document.createElement('option');
        option.value = specialty;
        option.textContent = specialty;
        specialtyFilter.appendChild(option);
    });
}

// Display mentors in the grid
function displayMentors(mentors) {
    mentorsListEl.innerHTML = '';
    
    if (mentors.length === 0) {
        mentorsListEl.innerHTML = '<p class="no-results">No mentors found matching your criteria.</p>';
        return;
    }
    
    mentors.forEach(mentor => {
        const mentorCard = document.createElement('div');
        mentorCard.className = 'mentor-card';
        mentorCard.onclick = () => selectMentor(mentor);
        
        const photo = mentor.photo || 'default-avatar.png';
        
        mentorCard.innerHTML = `
            <div class="mentor-card-header">${mentor.name}</div>
            <div class="mentor-card-body">
                <p><strong>Department:</strong> ${mentor.department || 'Not specified'}</p>
                <p><strong>Specialty:</strong> ${mentor.specialty || 'Not specified'}</p>
                <p><strong>Position:</strong> ${mentor.position || 'Not specified'}</p>
            </div>
        `;
        
        mentorsListEl.appendChild(mentorCard);
    });
}

// Filter mentors based on search and filters
function filterMentors() {
    const searchTerm = document.getElementById('search-mentor').value.toLowerCase();
    const department = document.getElementById('department-filter').value;
    const specialty = document.getElementById('specialty-filter').value;
    
    let filteredMentors = mentorsList;
    
    // Apply search filter
    if (searchTerm) {
        filteredMentors = filteredMentors.filter(mentor => 
            (mentor.name && mentor.name.toLowerCase().includes(searchTerm)) ||
            (mentor.department && mentor.department.toLowerCase().includes(searchTerm)) ||
            (mentor.specialty && mentor.specialty.toLowerCase().includes(searchTerm)) ||
            (mentor.email && mentor.email.toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply department filter
    if (department) {
        filteredMentors = filteredMentors.filter(mentor => 
            mentor.department === department
        );
    }
    
    // Apply specialty filter
    if (specialty) {
        filteredMentors = filteredMentors.filter(mentor => 
            mentor.specialty === specialty
        );
    }
    
    // Display filtered mentors
    displayMentors(filteredMentors);
}

// Select a mentor
function selectMentor(mentor) {
    selectedMentor = mentor;
    
    // Update UI to show selected mentor
    document.getElementById('mentor-name').textContent = mentor.name;
    document.getElementById('mentor-department').textContent = `Department: ${mentor.department || 'Not specified'}`;
    document.getElementById('mentor-specialty').textContent = `Specialty: ${mentor.specialty || 'Not specified'}`;
    document.getElementById('mentor-position').textContent = `Position: ${mentor.position || 'Not specified'}`;
    
    // Update confirmation section
    document.getElementById('confirm-mentor').textContent = mentor.name;
    
    // Show the selected mentor section and appointment section
    selectedMentorSection.style.display = 'block';
    appointmentSection.style.display = 'block';
    
    // Hide the mentor selection section
    document.querySelector('.mentor-selection').style.display = 'none';
    
    // Fetch mentor's available slots
    fetchMentorAvailability(mentor.email);
    
    // Update calendar
    renderCalendar();
    
    // Scroll to the appointment section
    appointmentSection.scrollIntoView({ behavior: 'smooth' });
}

// Go back to mentor selection
function backToMentorSelection() {
    // Show mentor selection section
    document.querySelector('.mentor-selection').style.display = 'block';
    
    // Hide mentor details and appointment sections
    selectedMentorSection.style.display = 'none';
    appointmentSection.style.display = 'none';
    timeSlotsSection.style.display = 'none';
    confirmationSection.style.display = 'none';
    
    // Reset selections
    selectedMentor = null;
    selectedDate = null;
    selectedTimeSlot = null;
}

// Fetch mentor availability
async function fetchMentorAvailability(mentorEmail) {
    try {
        const response = await fetch(`http://localhost:5000/get-availability/${mentorEmail}`);
        if (!response.ok) throw new Error('Failed to fetch availability');
        
        const availability = await response.json();
        
        // Process availability data
        availableDates = processAvailability(availability);
        
        // Update calendar to show available dates
        renderCalendar();
    } catch (error) {
        console.error('Error fetching mentor availability:', error);
        addChatbotMessage('Sorry, there was an error loading mentor availability. Please try another mentor or try again later.', 'bot');
    }
}

// Process availability data
function processAvailability(availability) {
    // Group availability by date
    const dateMap = {};
    
    availability.forEach(slot => {
        if (!dateMap[slot.date]) {
            dateMap[slot.date] = [];
        }
        
        dateMap[slot.date].push({
            startTime: slot
            startTime: slot.startTime,
            endTime: slot.endTime
        });
    });
    
    return dateMap;
}

// Initialize calendar
function initCalendar() {
    renderCalendar();
}

// Render calendar with current month
function renderCalendar() {
    const today = new Date();
    const currentMonth = currentMonthEl.dataset.month ? parseInt(currentMonthEl.dataset.month) : today.getMonth();
    const currentYear = currentMonthEl.dataset.year ? parseInt(currentMonthEl.dataset.year) : today.getFullYear();
    
    // Set current month and year
    currentMonthEl.dataset.month = currentMonth;
    currentMonthEl.dataset.year = currentYear;
    
    // Update month/year display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthEl.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    // Clear current calendar
    calendarDays.innerHTML = '';
    
    // Get first day of month and last day of month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    // Get day of week for first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Add days from previous month
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = prevMonthLastDay - i;
        calendarDays.appendChild(dayElement);
    }
    
    // Add days of current month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        // Check if day is today
        const currentDate = new Date();
        if (currentDate.getDate() === day && currentDate.getMonth() === currentMonth && currentDate.getFullYear() === currentYear) {
            dayElement.classList.add('today');
        }
        
        // Check if date has available slots
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (availableDates[dateStr] && availableDates[dateStr].length > 0) {
            dayElement.classList.add('has-slots');
            
            // Add click event to show available slots
            dayElement.addEventListener('click', () => selectDate(dateStr, day));
        }
        
        // Check if date is selected
        if (selectedDate === dateStr) {
            dayElement.classList.add('selected');
        }
        
        calendarDays.appendChild(dayElement);
    }
    
    // Add days from next month to fill remaining cells
    const totalDaysDisplayed = calendarDays.children.length;
    const remainingCells = 42 - totalDaysDisplayed; // 6 rows * 7 days = 42
    
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = day;
        calendarDays.appendChild(dayElement);
    }
}

// Change month
function changeMonth(delta) {
    let currentMonth = parseInt(currentMonthEl.dataset.month);
    let currentYear = parseInt(currentMonthEl.dataset.year);
    
    currentMonth += delta;
    
    // Handle year change
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    
    currentMonthEl.dataset.month = currentMonth;
    currentMonthEl.dataset.year = currentYear;
    
    renderCalendar();
}

// Select a date
function selectDate(dateStr, day) {
    selectedDate = dateStr;
    
    // Update selected date in UI
    document.getElementById('selected-date').textContent = formatDate(dateStr);
    
    // Update confirmation section
    document.getElementById('confirm-date').textContent = formatDate(dateStr);
    
    // Show time slots for the selected date
    showTimeSlots(dateStr);
    
    // Update calendar to show selected date
    renderCalendar();
    
    // Show time slots section
    timeSlotsSection.style.display = 'block';
    
    // Scroll to time slots section
    timeSlotsSection.scrollIntoView({ behavior: 'smooth' });
}

// Format date for display
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Show time slots for selected date
function showTimeSlots(dateStr) {
    availableSlotsEl.innerHTML = '';
    
    if (!availableDates[dateStr] || availableDates[dateStr].length === 0) {
        availableSlotsEl.innerHTML = '<p>No available time slots for this date.</p>';
        return;
    }
    
    // Sort time slots by start time
    const slots = availableDates[dateStr].sort((a, b) => {
        return a.startTime.localeCompare(b.startTime);
    });
    
    // Display time slots
    slots.forEach(slot => {
        const timeSlotEl = document.createElement('div');
        timeSlotEl.className = 'time-slot';
        if (selectedTimeSlot && selectedTimeSlot.startTime === slot.startTime && selectedDate === dateStr) {
            timeSlotEl.classList.add('selected');
        }
        
        // Format time for display
        const formattedStartTime = formatTime(slot.startTime);
        const formattedEndTime = formatTime(slot.endTime);
        
        timeSlotEl.textContent = `${formattedStartTime} - ${formattedEndTime}`;
        
        // Add click event to select time slot
        timeSlotEl.addEventListener('click', () => selectTimeSlot(slot, timeSlotEl));
        
        availableSlotsEl.appendChild(timeSlotEl);
    });
}

// Format time for display
function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    let period = 'AM';
    let hour = parseInt(hours);
    
    if (hour >= 12) {
        period = 'PM';
        if (hour > 12) {
            hour -= 12;
        }
    }
    
    if (hour === 0) {
        hour = 12;
    }
    
    return `${hour}:${minutes} ${period}`;
}

// Select a time slot
function selectTimeSlot(slot, element) {
    // Remove selected class from all time slots
    document.querySelectorAll('.time-slot').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Add selected class to clicked time slot
    element.classList.add('selected');
    
    // Set selected time slot
    selectedTimeSlot = slot;
    
    // Update confirmation section
    document.getElementById('confirm-time').textContent = `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;
    
    // Show confirmation section
    confirmationSection.style.display = 'block';
    
    // Scroll to confirmation section
    confirmationSection.scrollIntoView({ behavior: 'smooth' });
}

// Go back to time selection
function backToTimeSelection() {
    // Hide confirmation section
    confirmationSection.style.display = 'none';
    
    // Scroll to time slots section
    timeSlotsSection.scrollIntoView({ behavior: 'smooth' });
}

// Submit appointment request
async function submitAppointment() {
    const menteeName = document.getElementById('mentee-name').value.trim();
    const menteeEmail = document.getElementById('mentee-email').value.trim();
    const notes = document.getElementById('appointment-notes').value.trim();
    
    // Validate form fields
    if (!menteeName) {
        alert('Please enter your name.');
        return;
    }
    
    if (!menteeEmail) {
        alert('Please enter your email.');
        return;
    }
    
    if (!validateEmail(menteeEmail)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Prepare appointment data
    const appointmentData = {
        mentorEmail: selectedMentor.email,
        studentName: menteeName,
        studentEmail: menteeEmail,
        date: selectedDate,
        time: selectedTimeSlot.startTime,
        notes: notes
    };
    
    try {
        // Send appointment request to server
        const response = await fetch('http://localhost:5000/request-appointment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(appointmentData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit appointment request');
        }
        
        // Show success message
        showSuccessMessage();
        
        // Add success message to chatbot
        addChatbotMessage('Your appointment request has been sent successfully! The mentor will be notified of your request.', 'bot');
    } catch (error) {
        console.error('Error submitting appointment request:', error);
        alert('There was an error submitting your appointment request. Please try again later.');
        addChatbotMessage('Sorry, there was an error submitting your appointment request. Please try again later.', 'bot');
    }
}

// Validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Show success message
function showSuccessMessage() {
    // Hide all sections
    document.querySelector('.mentor-selection').style.display = 'none';
    selectedMentorSection.style.display = 'none';
    appointmentSection.style.display = 'none';
    
    // Show success section
    successSection.style.display = 'block';
    
    // Scroll to success section
    successSection.scrollIntoView({ behavior: 'smooth' });
}

// Book another appointment
function bookAnotherAppointment() {
    // Reset selections
    selectedMentor = null;
    selectedDate = null;
    selectedTimeSlot = null;
    
    // Reset form fields
    document.getElementById('mentee-name').value = '';
    document.getElementById('mentee-email').value = '';
    document.getElementById('appointment-notes').value = '';
    
    // Hide success section
    successSection.style.display = 'none';
    
    // Show mentor selection section
    document.querySelector('.mentor-selection').style.display = 'block';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Logout function
function logout() {
    // Clear any stored tokens or session data
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // Redirect to login page
    window.location.href = 'login.html';
}