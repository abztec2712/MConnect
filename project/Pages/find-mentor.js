document.addEventListener('DOMContentLoaded', function() {
    loadMentors();
    
    // Set up event listeners
    document.getElementById('search-btn').addEventListener('click', searchMentors);
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchMentors();
        }
    });
    
    document.getElementById('department-filter').addEventListener('change', searchMentors);
    document.getElementById('specialty-filter').addEventListener('change', searchMentors);
});

// Load all mentors from the server
function loadMentors() {
    const mentorsList = document.getElementById('mentors-list');
    mentorsList.innerHTML = '<div class="loading">Loading mentors...</div>';
    
    // Using try-catch to handle any fetch errors
    fetch('http://localhost:5000/get-all-mentors')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.length > 0) {
                displayMentors(data);
                populateFilters(data);
            } else {
                mentorsList.innerHTML = '<div class="no-results">No mentors found. Check back later!</div>';
            }
        })
        .catch(error => {
            console.error('Error loading mentors:', error);
            mentorsList.innerHTML = '<div class="no-results">Error loading mentors. Please try again later.</div>';
            
            // For development purposes, show more error details in console
            console.log('Error details:', error);
        });
}

// Display mentors in the UI
function displayMentors(mentors) {
    const mentorsList = document.getElementById('mentors-list');
    mentorsList.innerHTML = '';
    
    if (mentors.length === 0) {
        mentorsList.innerHTML = '<div class="no-results">No mentors match your search criteria. Try adjusting your filters.</div>';
        return;
    }
    
    mentors.forEach(mentor => {
        const mentorCard = document.createElement('div');
        mentorCard.classList.add('mentor-card');
        
        // Default image if no photo provided
        const photoSrc = mentor.photo || 'Images/default-profile.jpg';
        
        mentorCard.innerHTML = `
            <img src="${photoSrc}" alt="${mentor.name}" class="mentor-photo" onerror="this.src='Images/default-profile.jpg'">
            <div class="mentor-info">
                <h3 class="mentor-name">${mentor.name || 'N/A'}</h3>
                <p class="mentor-department"><strong>Department:</strong> ${mentor.department || 'N/A'}</p>
                <p class="mentor-specialty"><strong>Specialty:</strong> ${mentor.specialty || 'N/A'}</p>
                <p class="mentor-email"><strong>Email:</strong> ${mentor.email || 'N/A'}</p>
                <a href="mailto:${mentor.email}" class="contact-btn">Contact Mentor</a>
            </div>
        `;
        
        mentorsList.appendChild(mentorCard);
    });
}

// Populate filter dropdowns with unique departments and specialties
function populateFilters(mentors) {
    const departmentFilter = document.getElementById('department-filter');
    const specialtyFilter = document.getElementById('specialty-filter');
    
    // Get unique departments
    const departments = [...new Set(mentors
        .filter(mentor => mentor.department)
        .map(mentor => mentor.department))];
    
    // Get unique specialties
    const specialties = [...new Set(mentors
        .filter(mentor => mentor.specialty)
        .map(mentor => mentor.specialty))];
    
    // Clear existing options (keep the "All" option)
    while (departmentFilter.options.length > 1) {
        departmentFilter.remove(1);
    }
    
    while (specialtyFilter.options.length > 1) {
        specialtyFilter.remove(1);
    }
    
    // Add department options
    departments.sort().forEach(department => {
        const option = document.createElement('option');
        option.value = department;
        option.textContent = department;
        departmentFilter.appendChild(option);
    });
    
    // Add specialty options
    specialties.sort().forEach(specialty => {
        const option = document.createElement('option');
        option.value = specialty;
        option.textContent = specialty;
        specialtyFilter.appendChild(option);
    });
}

// Search and filter mentors
function searchMentors() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const departmentFilter = document.getElementById('department-filter').value;
    const specialtyFilter = document.getElementById('specialty-filter').value;
    
    const mentorsList = document.getElementById('mentors-list');
    mentorsList.innerHTML = '<div class="loading">Searching...</div>';
    
    // Prepare search parameters
    const params = new URLSearchParams();
    if (searchInput) params.append('search', searchInput);
    if (departmentFilter) params.append('department', departmentFilter);
    if (specialtyFilter) params.append('specialty', specialtyFilter);
    
    // Make API request with search parameters
    const url = `http://localhost:5000/get-all-mentors${params.toString() ? '?' + params.toString() : ''}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayMentors(data);
        })
        .catch(error => {
            console.error('Error searching mentors:', error);
            mentorsList.innerHTML = '<div class="no-results">Error searching mentors. Please try again later.</div>';
        });
}