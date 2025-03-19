/**
 * Elegant Seating - Premium Chair Rentals
 * Main JavaScript File
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initGallery();
    initTestimonials();
    initFAQ();
    initBookingForm();
    initContactForm();
});

/**
 * Navigation functionality
 */
function initNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const header = document.querySelector('header');
    
    // Toggle mobile menu
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close mobile menu if open
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            }
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for header height
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Sticky header on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/**
 * Gallery functionality
 */
function initGallery() {
    // Gallery filtering
    const galleryItems = document.querySelectorAll('.gallery-item');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            const filterValue = button.getAttribute('data-filter');
            
            galleryItems.forEach(item => {
                const categories = item.getAttribute('data-category').split(' ');
                if (filterValue === 'all' || categories.includes(filterValue)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // Lightbox functionality for gallery
    const galleryLightbox = document.getElementById('gallery-lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const closeLightbox = document.querySelector('.close-lightbox');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    
    let currentImageIndex = 0;
    const visibleGalleryItems = () => Array.from(galleryItems).filter(item => item.style.display !== 'none');
    
    // Open lightbox when clicking on gallery item
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const img = this.querySelector('img');
            const title = this.querySelector('h3').textContent;
            const desc = this.querySelector('p').textContent;
            
            lightboxImage.src = img.src;
            lightboxCaption.innerHTML = `<h3>${title}</h3><p>${desc}</p>`;
            galleryLightbox.classList.add('active');
            
            // Set current image index
            const visibleItems = visibleGalleryItems();
            currentImageIndex = visibleItems.indexOf(this);
            
            // Update navigation visibility
            updateNavigation();
        });
    });
    
    // Close lightbox
    closeLightbox.addEventListener('click', function() {
        galleryLightbox.classList.remove('active');
    });
    
    // Navigate to previous image
    lightboxPrev.addEventListener('click', function() {
        const visibleItems = visibleGalleryItems();
        currentImageIndex = (currentImageIndex - 1 + visibleItems.length) % visibleItems.length;
        updateLightboxContent(visibleItems[currentImageIndex]);
        updateNavigation();
    });
    
    // Navigate to next image
    lightboxNext.addEventListener('click', function() {
        const visibleItems = visibleGalleryItems();
        currentImageIndex = (currentImageIndex + 1) % visibleItems.length;
        updateLightboxContent(visibleItems[currentImageIndex]);
        updateNavigation();
    });
    
    // Update lightbox content
    function updateLightboxContent(item) {
        const img = item.querySelector('img');
        const title = item.querySelector('h3').textContent;
        const desc = item.querySelector('p').textContent;
        
        lightboxImage.src = img.src;
        lightboxCaption.innerHTML = `<h3>${title}</h3><p>${desc}</p>`;
    }
    
    // Update navigation visibility
    function updateNavigation() {
        const visibleItems = visibleGalleryItems();
        
        if (visibleItems.length <= 1) {
            lightboxPrev.style.display = 'none';
            lightboxNext.style.display = 'none';
        } else {
            lightboxPrev.style.display = 'flex';
            lightboxNext.style.display = 'flex';
        }
    }
}

/**
 * Testimonials slider functionality
 */
function initTestimonials() {
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const prevButton = document.querySelector('.prev-testimonial');
    const nextButton = document.querySelector('.next-testimonial');
    
    if (testimonialSlides.length === 0) return;
    
    let currentSlide = 0;
    
    // Show first slide
    testimonialSlides[0].classList.add('active');
    
    // Function to show a specific slide
    function showSlide(index) {
        // Remove active class from all slides
        testimonialSlides.forEach(slide => slide.classList.remove('active'));
        
        // Add active class to current slide
        testimonialSlides[index].classList.add('active');
        
        // Update current slide index
        currentSlide = index;
    }
    
    // Previous slide button
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            const newIndex = (currentSlide - 1 + testimonialSlides.length) % testimonialSlides.length;
            showSlide(newIndex);
        });
    }
    
    // Next slide button
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            const newIndex = (currentSlide + 1) % testimonialSlides.length;
            showSlide(newIndex);
        });
    }
    
    // Auto-rotate testimonials
    setInterval(function() {
        const newIndex = (currentSlide + 1) % testimonialSlides.length;
        showSlide(newIndex);
    }, 5000);
}

/**
 * FAQ accordion functionality
 */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', function() {
            // Toggle active class on the item
            item.classList.toggle('active');
            
            // Toggle visibility of the answer
            if (item.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = 0;
            }
        });
    });
}

/**
 * Booking form functionality
 */
function initBookingForm() {
    const bookingForm = document.getElementById('booking-form');
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    const formSteps = document.querySelectorAll('.form-step');
    const summaryContent = document.getElementById('summary-content');
    
    // Form fields
    const eventDateInput = document.getElementById('event-date');
    const eventTypeSelect = document.getElementById('event-type');
    const chairCountInput = document.getElementById('item-quantity');
    const chairStyleSelect = document.getElementById('chair-style');
    const venueNameInput = document.getElementById('venue-name');
    const venueAddressInput = document.getElementById('venue-address');
    const setupTimeInput = document.getElementById('setup-time');
    const breakdownTimeInput = document.getElementById('breakdown-time');
    const contactNameInput = document.getElementById('contact-name');
    const contactEmailInput = document.getElementById('contact-email');
    const contactPhoneInput = document.getElementById('contact-phone');
    const specialRequestsInput = document.getElementById('special-requests');
    
    // Pricing data (per chair)
    const pricingData = {
        'chiavari-gold': 12,
        'chiavari-silver': 12,
        'chiavari-white': 12,
        'ghost': 15,
        'cross-back-natural': 14,
        'cross-back-walnut': 14,
        'folding-white': 8,
        'folding-black': 8
    };
    
    // Add date input validation
    if (eventDateInput) {
        eventDateInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 4) {
                value = value.slice(0,2) + '/' + value.slice(2);
            }
            if (value.length >= 7) {
                value = value.slice(0,5) + '/' + value.slice(5,9);
            }
            e.target.value = value;
            
            // Validate date
            if (value.length === 10) {
                const date = new Date(value);
                const today = new Date();
                if (date < today) {
                    showError(eventDateInput, 'Please select a future date');
                } else {
                    clearError(eventDateInput);
                }
            }
        });
    }

    // Helper functions for form validation
    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        let errorDiv = formGroup.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            formGroup.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
        input.classList.add('error');
    }

    function clearError(input) {
        const formGroup = input.closest('.form-group');
        const errorDiv = formGroup.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
        input.classList.remove('error');
    }

    // Next step buttons
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = parseInt(this.closest('.form-step').getAttribute('data-step'));
            const nextStep = currentStep + 1;
            
            // Validate current step
            if (validateStep(currentStep)) {
                // Hide current step
                document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove('active');
                
                // Show next step
                document.querySelector(`.form-step[data-step="${nextStep}"]`).classList.add('active');
                
                // Update booking summary
                updateBookingSummary();
            }
        });
    });
    
    // Previous step buttons
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = parseInt(this.closest('.form-step').getAttribute('data-step'));
            const prevStep = currentStep - 1;
            
            // Hide current step
            document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove('active');
            
            // Show previous step
            document.querySelector(`.form-step[data-step="${prevStep}"]`).classList.add('active');
        });
    });
    
    // Form submission
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate final step
            if (validateStep(3)) {
                // Collect all form data
                const formData = {
                    eventDates: eventDateInput.value,
                    eventType: eventTypeSelect.value,
                    chairCount: chairCountInput.value,
                    chairStyle: chairStyleSelect.value,
                    venueName: venueNameInput.value,
                    venueAddress: venueAddressInput.value,
                    setupTime: setupTimeInput.value,
                    breakdownTime: breakdownTimeInput.value,
                    contactName: contactNameInput.value,
                    contactEmail: contactEmailInput.value,
                    contactPhone: contactPhoneInput.value,
                    specialRequests: specialRequestsInput.value
                };
                
                // In a real application, you would send this data to a server
                console.log('Booking form submitted:', formData);
                
                // Show success message
                alert('Thank you for your booking request! We will contact you shortly to confirm your reservation.');
                
                // Reset form
                bookingForm.reset();
                
                // Go back to first step
                formSteps.forEach(step => step.classList.remove('active'));
                formSteps[0].classList.add('active');
                
                // Clear summary
                summaryContent.innerHTML = '<p>Please select your dates and details to see a summary of your booking.</p>';
            }
        });
    }
    
    // Validate form step
    function validateStep(step) {
        let isValid = true;
        
        // Get all required fields in the current step
        const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
        const requiredFields = currentStepElement.querySelectorAll('[required]');
        
        // Check each required field
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
                
                // Add error message if it doesn't exist
                if (!field.nextElementSibling || !field.nextElementSibling.classList.contains('error-message')) {
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'error-message';
                    errorMessage.textContent = 'This field is required';
                    field.parentNode.insertBefore(errorMessage, field.nextSibling);
                }
            } else {
                field.classList.remove('error');
                
                // Remove error message if it exists
                if (field.nextElementSibling && field.nextElementSibling.classList.contains('error-message')) {
                    field.parentNode.removeChild(field.nextElementSibling);
                }
            }
        });
        
        return isValid;
    }
    
    // Update booking summary
    function updateBookingSummary() {
        if (!summaryContent) return;
        
        const date = eventDateInput.value;
        const chairStyle = chairStyleSelect.value;
        const chairCount = chairCountInput.value;
        
        let summaryHTML = '<div class="booking-summary-content">';
        
        if (date) {
            summaryHTML += `<p><strong>Event Date:</strong> ${date}</p>`;
        }
        
        if (chairStyle && chairCount) {
            const chairStyleName = chairStyleSelect.options[chairStyleSelect.selectedIndex].text;
            const pricePerChair = pricingData[chairStyle] || 0;
            const totalPrice = pricePerChair * chairCount;
            
            summaryHTML += `
                <p><strong>Chair Style:</strong> ${chairStyleName}</p>
                <p><strong>Quantity:</strong> ${chairCount}</p>
                <p><strong>Price per Chair:</strong> $${pricePerChair.toFixed(2)}</p>
                <p class="total"><strong>Total:</strong> $${totalPrice.toFixed(2)}</p>
            `;
        }
        
        summaryHTML += '</div>';
        summaryContent.innerHTML = summaryHTML;
    }
    
    // Update summary when form fields change
    [eventDateInput, chairStyleSelect, chairCountInput].forEach(field => {
        field.addEventListener('change', updateBookingSummary);
    });
}

/**
 * Contact form functionality
 */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form fields
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const phoneInput = document.getElementById('phone');
            const messageInput = document.getElementById('message');
            
            // Validate form
            let isValid = true;
            
            if (!nameInput.value.trim()) {
                isValid = false;
                nameInput.classList.add('error');
            } else {
                nameInput.classList.remove('error');
            }
            
            if (!emailInput.value.trim() || !isValidEmail(emailInput.value)) {
                isValid = false;
                emailInput.classList.add('error');
            } else {
                emailInput.classList.remove('error');
            }
            
            if (!messageInput.value.trim()) {
                isValid = false;
                messageInput.classList.add('error');
            } else {
                messageInput.classList.remove('error');
            }
            
            if (isValid) {
                // Collect form data
                const formData = {
                    name: nameInput.value,
                    email: emailInput.value,
                    phone: phoneInput.value,
                    message: messageInput.value
                };
                
                // In a real application, you would send this data to a server
                console.log('Contact form submitted:', formData);
                
                // Show success message
                alert('Thank you for your message! We will get back to you shortly.');
                
                // Reset form
                contactForm.reset();
            }
        });
    }
    
    // Email validation helper
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
} 