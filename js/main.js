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
    
    // Print all image paths to console for debugging
    console.log("Gallery images paths:");
    galleryItems.forEach(item => {
        const img = item.querySelector('img');
        if (img) {
            console.log(img.src);
            
            // Add more detailed folder structure logging
            const pathParts = img.src.split('/');
            console.log('Image folder structure:', pathParts);
        }
    });
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            const filterValue = button.getAttribute('data-filter');
            console.log("Selected filter:", filterValue);
            
            // Create an array from gallery items to sort them
            const itemsArray = Array.from(galleryItems);
            
            // Sort items by the image filename
            itemsArray.sort((a, b) => {
                const imgA = a.querySelector('img').src.split('/').pop();
                const imgB = b.querySelector('img').src.split('/').pop();
                return imgA.localeCompare(imgB);
            });
            
            // Filter and display items
            itemsArray.forEach(item => {
                const imgSrc = item.querySelector('img').src.toLowerCase();
                
                // Special debug info for chair images
                if (imgSrc.includes('chair')) {
                    console.log('FOUND CHAIR IMAGE: ' + imgSrc);
                    console.log('Full path parts:', imgSrc.split('/'));
                    console.log('Is in chairs folder: ' + imgSrc.includes('/chairs/'));
                    console.log('Is in chair folder: ' + imgSrc.includes('/chair/'));
                    console.log('Has table in name: ' + imgSrc.includes('table'));
                    console.log('Has cover in name: ' + imgSrc.includes('cover'));
                }
                
                if (filterValue === 'all') {
                    item.style.display = 'block';
                } 
                else if (filterValue === 'chairs') {
                    // Expanded chair filtering to handle both singular and plural folder names
                    const isInChairsFolder = imgSrc.includes('/chairs/') || imgSrc.includes('/chairs/') || imgSrc.includes('/images/chair/');
                    const isTableImage = imgSrc.includes('table');
                    item.style.display = (isInChairsFolder && !isTableImage) ? 'block' : 'none';
                    
                    console.log(`Chair Filter: ${imgSrc} - ${item.style.display}`);
                } 
                else if (filterValue === 'tables') {
                    const isInTableFolder = imgSrc.includes('/table/') || imgSrc.includes('/tables/');
                    const isTableInChairsFolder = (imgSrc.includes('/chairs/') || imgSrc.includes('/chair/')) && imgSrc.includes('table');
                    item.style.display = (isInTableFolder || isTableInChairsFolder) ? 'block' : 'none';
                }
                else if (filterValue === 'tents') {
                    // For tents category
                    const isInTentsFolder = imgSrc.includes('/tents/') || imgSrc.includes('/tent/');
                    const hasTentInName = imgSrc.includes('tent');
                    item.style.display = (isInTentsFolder || hasTentInName) ? 'block' : 'none';
                }
                else if (filterValue === 'backdrops') {
                    // For backdrops category
                    const isInBackdropsFolder = imgSrc.includes('/backdrops/') || imgSrc.includes('/backdrop/');
                    const hasBackdropInName = imgSrc.includes('backdrop') || imgSrc.includes('decor');
                    item.style.display = (isInBackdropsFolder || hasBackdropInName) ? 'block' : 'none';
                }
                else {
                    item.style.display = 'none';
                }
                
                // Log which items are being displayed for debugging
                console.log(`Item ${imgSrc} display: ${item.style.display}`);
            });
            
            // Re-order the items in the DOM based on the sorted array
            const galleryGrid = document.querySelector('.gallery-grid');
            if (galleryGrid) {
                itemsArray.forEach(item => {
                    if (item.style.display === 'block') {
                        galleryGrid.appendChild(item);
                    }
                });
            }
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
    
    // Add this helper function to convert 24-hour time to 12-hour format
    function formatTime12Hour(time24) {
        if (!time24) return '';
        
        const [hours, minutes] = time24.split(':');
        let hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        
        // Convert to 12-hour format
        hour = hour % 12;
        hour = hour ? hour : 12; // Convert '0' to '12'
        
        return `${hour}:${minutes} ${ampm}`;
    }

    // Form submission
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate final step
            if (validateStep(3)) {
                // Get the form data
                const formData = new FormData(bookingForm);
                
                // Format times before sending
                const setupTime = setupTimeInput ? setupTimeInput.value : '';
                const breakdownTime = breakdownTimeInput ? breakdownTimeInput.value : '';
                
                // Remove the original time values
                formData.delete('setup-time');
                formData.delete('breakdown-time');
                
                // Add formatted time values
                formData.append('setup-time', formatTime12Hour(setupTime) + ' (Original: ' + setupTime + ')');
                formData.append('breakdown-time', formatTime12Hour(breakdownTime) + ' (Original: ' + breakdownTime + ')');
                
                // Add summary information to form data
                if (summaryContent) {
                    formData.append('booking-summary', summaryContent.innerText);
                }
                
                // Show loading state
                const submitButton = bookingForm.querySelector('button[type="submit"]');
                const originalText = submitButton.textContent;
                submitButton.textContent = 'Submitting...';
                submitButton.disabled = true;
                
                // Submit form to Formspree
                fetch(bookingForm.getAttribute('action'), {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(response => {
                    if (response.ok) {
                        // Show success message
                        const successMessage = document.getElementById('booking-success-message');
                        if (successMessage) {
                            successMessage.style.display = 'block';
                            
                            // Scroll to success message
                            successMessage.scrollIntoView({ behavior: 'smooth' });
                            
                            // Hide success message after 5 seconds
                            setTimeout(() => {
                                successMessage.style.display = 'none';
                            }, 5000);
                        } else {
                            alert('Thank you for your booking request! We\'ll be in touch soon.');
                        }
                        
                        // Reset form
                        bookingForm.reset();
                        
                        // Go back to first step
                        formSteps.forEach(step => step.classList.remove('active'));
                        formSteps[0].classList.add('active');
                        
                        // Clear summary
                        if (summaryContent) {
                            summaryContent.innerHTML = '<p>Please select your dates and details to see a summary of your booking.</p>';
                        }
                    } else {
                        throw new Error('Form submission failed');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('There was a problem submitting your form. Please try again later.');
                })
                .finally(() => {
                    // Reset button state
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                });
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
    
    // Update summary when form fields change - WITH NULL CHECK
    const fieldsToWatch = [eventDateInput, chairStyleSelect, chairCountInput].filter(field => field !== null);
    fieldsToWatch.forEach(field => {
        field.addEventListener('change', updateBookingSummary);
    });
}

/**
 * Contact form functionality
 */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        // Show/hide quantity fields based on checkbox selection
        const rentalItems = document.querySelectorAll('input[name="rental-items"]');
        rentalItems.forEach(item => {
            item.addEventListener('change', function() {
                const quantityGroup = document.getElementById(`${this.id}-quantity-group`);
                if (quantityGroup) {
                    quantityGroup.style.display = this.checked ? 'block' : 'none';
                }
            });
        });
        
        // Form validation before submission
        contactForm.addEventListener('submit', function(e) {
            let isValid = true;
            
            // Clear all previous error messages
            const errorMessages = document.querySelectorAll('.error-message');
            errorMessages.forEach(msg => msg.textContent = '');
            
            // Validate required fields
            const requiredFields = contactForm.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    const formGroup = field.closest('.form-group');
                    const errorMessage = formGroup.querySelector('.error-message');
                    if (errorMessage) {
                        errorMessage.textContent = 'This field is required';
                    }
                    isValid = false;
                }
            });
            
            // Validate email format
            const emailField = document.getElementById('email');
            if (emailField && emailField.value.trim()) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(emailField.value)) {
                    const formGroup = emailField.closest('.form-group');
                    const errorMessage = formGroup.querySelector('.error-message');
                    if (errorMessage) {
                        errorMessage.textContent = 'Please enter a valid email address';
                    }
                    isValid = false;
                }
            }
            
            // If validation fails, prevent submission
            if (!isValid) {
                e.preventDefault();
                return;
            }
            
            // Handle form submission with Formspree
            if (contactForm.getAttribute('action').includes('formspree.io')) {
                e.preventDefault();
                
                const formData = new FormData(contactForm);
                
                fetch(contactForm.getAttribute('action'), {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(response => {
                    if (response.ok) {
                        // Show success message
                        contactForm.reset();
                        document.getElementById('form-success-message').style.display = 'block';
                        
                        // Reset quantity fields display
                        document.querySelectorAll('.quantity-group').forEach(group => {
                            group.style.display = 'none';
                        });
                        
                        // Hide success message after 5 seconds
                        setTimeout(() => {
                            document.getElementById('form-success-message').style.display = 'none';
                        }, 5000);
                    } else {
                        throw new Error('Form submission failed');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('There was a problem submitting your form. Please try again later.');
                });
            }
        });
    }
} 