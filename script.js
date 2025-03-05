document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.slider');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    let currentIndex = 0;
    const cardWidth = document.querySelector('.mentor-card').offsetWidth + 20; // Include margin

    nextBtn.addEventListener('click', () => {
        const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
        if (currentIndex < maxScrollLeft) {
            currentIndex += cardWidth;
            slider.style.transform = `translateX(-${currentIndex}px)`;
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex -= cardWidth;
            slider.style.transform = `translateX(-${currentIndex}px)`;
        }
    });
});


function openTab(tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    event.currentTarget.className += " active";
}