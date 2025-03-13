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
    // Chair gallery data
    const galleryItems = [
        {
            id: 1,
            category: 'chiavari',
            image: 'img/chairs/chiavari-gold.jpg',
            title: 'Chiavari Gold',
            description: 'Classic gold Chiavari chairs, perfect for elegant weddings and galas.'
        },
        {
            id: 2,
            category: 'chiavari',
            image: 'img/chairs/chiavari-silver.jpg',
            title: 'Chiavari Silver',
            description: 'Sleek silver Chiavari chairs for a modern, sophisticated look.'
        },
        {
            id: 3,
            category: 'ghost',
            image: 'img/chairs/ghost-clear.jpg',
            title: 'Ghost Chair',
            description: 'Transparent ghost chairs for a contemporary, minimalist aesthetic.'
        },
        {
            id: 4,
            category: 'cross-back',
            image: 'img/chairs/cross-back-natural.jpg',
            title: 'Cross-Back Natural',
            description: 'Rustic cross-back chairs in natural wood finish.'
        },
        {
            id: 5,
            category: 'cross-back',
            image: 'img/chairs/cross-back-walnut.jpg',
            title: 'Cross-Back Walnut',
            description: 'Elegant cross-back chairs in rich walnut finish.'
        },
        {
            id: 6,
            category: 'folding',
            image: 'img/chairs/folding-white.jpg',
            title: 'Luxury Folding White',
            description: 'Premium white folding chairs with padded seats.'
        },
        {
            id: 7,
            category: 'folding',
            image: 'img/chairs/folding-black.jpg',
            title: 'Luxury Folding Black',
            description: 'Sophisticated black folding chairs with padded seats.'
        },
        {
            id: 8,
            category: 'chiavari',
            image: 'img/chairs/chiavari-white.jpg',
            title: 'Chiavari White',
            description: 'Elegant white Chiavari chairs, ideal for weddings and formal events.'
        }
    ];
    
    // Populate gallery grid
    const galleryGrid = document.querySelector('.gallery-grid');
    if (galleryGrid) {
        // Create placeholder images until real images are available
        galleryItems.forEach(item => {
            const galleryItem = document.createElement('div');
            galleryItem.className = `gallery-item ${item.category}`;
            galleryItem.dataset.category = item.category;
            
            // For demo purposes, use placeholder images
            const placeholderUrl = `https://via.placeholder.com/600x400/f5f5f5/333333?text=${item.title.replace(' ', '+')}`;
            
            galleryItem.innerHTML = `
                <img src="${placeholderUrl}" alt="${item.title}" data-id="${item.id}">
                <div class="gallery-item-overlay">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                </div>
            `;
            
            galleryGrid.appendChild(galleryItem);
        });
    }
    
    // Gallery filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    // Filter gallery items
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value
            const filterValue = this.getAttribute('data-filter');
            
            // Show/hide gallery items based on filter
            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
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
    const eventDatesInput = document.getElementById('event-dates');
    const eventTypeSelect = document.getElementById('event-type');
    const chairCountInput = document.getElementById('chair-count');
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
                    eventDates: eventDatesInput.value,
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
        
        // Get selected values
        const dates = eventDatesInput.value;
        const chairStyle = chairStyleSelect.value;
        const chairCount = chairCountInput.value;
        
        // Calculate total price
        let pricePerChair = 0;
        let chairStyleName = '';
        
        if (chairStyle && pricingData[chairStyle]) {
            pricePerChair = pricingData[chairStyle];
            chairStyleName = chairStyleSelect.options[chairStyleSelect.selectedIndex].text;
        }
        
        const totalPrice = pricePerChair * chairCount;
        
        // Create summary HTML
        let summaryHTML = '';
        
        if (dates && chairStyle && chairCount) {
            summaryHTML = `
                <div class="date-range-summary">
                    <p><span>Event Dates:</span> <span>${dates}</span></p>
                    <p><span>Chair Style:</span> <span>${chairStyleName}</span></p>
                    <p><span>Number of Chairs:</span> <span>${chairCount}</span></p>
                    <p><span>Price per Chair:</span> <span>$${pricePerChair.toFixed(2)}</span></p>
                    <p class="total"><span>Total Price:</span> <span>$${totalPrice.toFixed(2)}</span></p>
                </div>
            `;
        } else {
            summaryHTML = '<p>Please select your dates and details to see a summary of your booking.</p>';
        }
        
        summaryContent.innerHTML = summaryHTML;
    }
    
    // Update summary when form fields change
    [eventDatesInput, chairStyleSelect, chairCountInput].forEach(field => {
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