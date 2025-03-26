/**
 * Yalem Seating - Premium Chair Rentals
 * Booking Form JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize phone input with international format
    const phoneInput = window.intlTelInput(document.querySelector("#phone"), {
        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js",
        preferredCountries: ["us", "ca", "gb"],
        separateDialCode: true,
        autoPlaceholder: "aggressive"
    });

    // Sample unavailable dates (for demonstration)
    const unavailableDates = [
        "2023-12-10", "2023-12-11", "2023-12-12",
        "2023-12-24", "2023-12-25", "2023-12-26",
        "2024-01-01", "2024-01-15", "2024-01-16",
        "2024-02-14", "2024-02-15"
    ];

    // Initialize date picker
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Format date for display
    function formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }


    function calculateDays(startDate, endDate) {
        const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        const diffDays = Math.round(Math.abs((startDate - endDate) / oneDay)) + 1;
        return diffDays;
    }


    const datePicker = flatpickr("#date-picker", {
        mode: "range",
        minDate: "today",
        dateFormat: "Y-m-d",
        disable: unavailableDates,
        inline: true,
        showMonths: window.innerWidth < 768 ? 1 : 2,
        onChange: function(selectedDates, dateStr) {
            // Only process when we have both dates selected
            if (selectedDates.length === 2) {
                let startDate = selectedDates[0];
                let endDate = selectedDates[1];
                
                // Make sure start date is before end date
                if (startDate > endDate) {
                    [startDate, endDate] = [endDate, startDate];
                }
                
                // Format dates for display
                const formattedStartDate = formatDate(startDate);
                const formattedEndDate = formatDate(endDate);
                
                // Update the input fields
                document.getElementById("start-date").value = formattedStartDate;
                document.getElementById("end-date").value = formattedEndDate;
                
                // Calculate and display total days
                const days = calculateDays(startDate, endDate);
                document.getElementById("summary-days").textContent = days;
                
                // Update booking summary
                updateBookingSummary();
                
                // Clear any error messages
                const dateGroup = document.querySelector(".date-range");
                if (dateGroup) {
                    const errorElement = dateGroup.querySelector(".error-message");
                    if (errorElement) {
                        errorElement.textContent = "";
                    }
                }
                
                // Log for debugging
                console.log("Date selection updated:", {
                    startDate: formattedStartDate,
                    endDate: formattedEndDate,
                    days: days
                });
            }
        }
    });

    // Handle window resize for responsive calendar
    window.addEventListener('resize', function() {
        if (datePicker) {
            datePicker.set('showMonths', window.innerWidth < 768 ? 1 : 2);
            datePicker.redraw();
        }
    });

    // Update booking summary
    function updateBookingSummary() {
        const startDate = document.getElementById("start-date").value;
        const endDate = document.getElementById("end-date").value;
        const chairStyle = document.getElementById("chair-style");
        const chairQuantity = document.getElementById("chair-quantity").value;
        
        // Update summary elements
        document.getElementById("summary-dates").textContent = startDate && endDate ? 
            `${startDate} to ${endDate}` : "Please select dates";
        
        document.getElementById("summary-chair-type").textContent = 
            chairStyle.value ? chairStyle.options[chairStyle.selectedIndex].text.split(" (")[0] : "Not selected";
        
        document.getElementById("summary-quantity").textContent = chairQuantity || 0;
        
        // Calculate price
        let pricePerChair = 0;
        if (chairStyle.value) {
            pricePerChair = parseFloat(chairStyle.options[chairStyle.selectedIndex].dataset.price);
        }
        
        document.getElementById("summary-price").textContent = `$${pricePerChair.toFixed(2)}`;
        
        // Calculate total
        const days = parseInt(document.getElementById("summary-days").textContent) || 0;
        const total = pricePerChair * chairQuantity * days;
        document.getElementById("summary-total").textContent = `$${total.toFixed(2)}`;
    }

    // Event listeners for form inputs to update summary
    document.getElementById("chair-style").addEventListener("change", updateBookingSummary);
    document.getElementById("chair-quantity").addEventListener("input", updateBookingSummary);

    // Form validation
    const bookingForm = document.getElementById("booking-form");
    
    bookingForm.addEventListener("submit", function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            submitForm();
        }
    });

    function validateForm() {
        let isValid = true;
        const errorMessages = document.querySelectorAll(".error-message");
        
        // Clear previous error messages
        errorMessages.forEach(msg => {
            msg.textContent = "";
        });
        
        // Validate full name
        const fullname = document.getElementById("fullname");
        if (!fullname.value.trim()) {
            showError(fullname, "Please enter your full name");
            isValid = false;
        }
        
        // Validate email
        const email = document.getElementById("email");
        if (!email.value.trim()) {
            showError(email, "Please enter your email address");
            isValid = false;
        } else if (!isValidEmail(email.value)) {
            showError(email, "Please enter a valid email address");
            isValid = false;
        }
        
        // Validate phone
        if (!phoneInput.isValidNumber()) {
            showError(document.getElementById("phone"), "Please enter a valid phone number");
            isValid = false;
        }
        
        // Validate event type
        const eventType = document.getElementById("event-type");
        if (!eventType.value) {
            showError(eventType, "Please select an event type");
            isValid = false;
        }
        
        // Validate dates - improved validation
        const startDate = document.getElementById("start-date");
        const endDate = document.getElementById("end-date");
        if (!startDate.value || !endDate.value) {
            showError(startDate, "Please select your event dates");
            isValid = false;
        } else {
            // Parse dates for comparison
            const start = new Date(startDate.value);
            const end = new Date(endDate.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (start < today) {
                showError(startDate, "Start date cannot be in the past");
                isValid = false;
            } else if (end < start) {
                showError(endDate, "End date cannot be before start date");
                isValid = false;
            }
        }
        
        // Validate chair quantity
        const chairQuantity = document.getElementById("chair-quantity");
        if (!chairQuantity.value || chairQuantity.value < 10) {
            showError(chairQuantity, "Minimum order is 10 chairs");
            isValid = false;
        }
        
        // Validate chair style
        const chairStyle = document.getElementById("chair-style");
        if (!chairStyle.value) {
            showError(chairStyle, "Please select a chair style");
            isValid = false;
        }
        
        // Validate venue address
        const venueAddress = document.getElementById("venue-address");
        if (!venueAddress.value.trim()) {
            showError(venueAddress, "Please enter the venue address");
            isValid = false;
        }
        
        // Validate terms
        const terms = document.getElementById("terms");
        if (!terms.checked) {
            showError(terms, "You must agree to the terms and conditions");
            isValid = false;
        }
        
        return isValid;
    }

    function showError(input, message) {
        const formGroup = input.closest(".form-group");
        const errorElement = formGroup.querySelector(".error-message");
        errorElement.textContent = message;
        input.classList.add("error");
    }

    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    // Improve mobile scrolling after form submission
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Update submitForm function
    function submitForm() {
        const submitButton = bookingForm.querySelector("button[type='submit']");
        submitButton.classList.add("loading");
        
        // Simulate API call with timeout
        setTimeout(function() {
            // Generate a random booking reference
            const bookingReference = generateBookingReference();
            
            // Prepare confirmation details
            prepareConfirmation(bookingReference);
            
            // Show confirmation modal
            document.getElementById("confirmation-modal").classList.add("active");
            
            // Reset form
            bookingForm.reset();
            
            // Reset summary
            document.getElementById("summary-dates").textContent = "Please select dates";
            document.getElementById("summary-days").textContent = "0";
            document.getElementById("summary-chair-type").textContent = "Not selected";
            document.getElementById("summary-quantity").textContent = "0";
            document.getElementById("summary-price").textContent = "$0.00";
            document.getElementById("summary-total").textContent = "$0.00";
            
            // Reset flatpickr
            datePicker.clear();
            
            // Reset button state
            submitButton.classList.remove("loading");
            
            // Scroll to top on mobile
            if (window.innerWidth < 768) {
                scrollToTop();
            }
        }, 2000);
    }

    function generateBookingReference() {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let result = "YS-";
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    function prepareConfirmation(reference) {
        // Set booking reference
        document.getElementById("booking-reference").textContent = reference;
        
        // Prepare confirmation details
        const confirmationDetails = document.getElementById("confirmation-details-content");
        const startDate = document.getElementById("start-date").value;
        const endDate = document.getElementById("end-date").value;
        const chairStyle = document.getElementById("chair-style");
        const chairStyleText = chairStyle.options[chairStyle.selectedIndex].text.split(" (")[0];
        const chairQuantity = document.getElementById("chair-quantity").value;
        const total = document.getElementById("summary-total").textContent;
        
        confirmationDetails.innerHTML = `
            <p><strong>Name:</strong> ${document.getElementById("fullname").value}</p>
            <p><strong>Email:</strong> ${document.getElementById("email").value}</p>
            <p><strong>Phone:</strong> ${phoneInput.getNumber()}</p>
            <p><strong>Event Type:</strong> ${document.getElementById("event-type").options[document.getElementById("event-type").selectedIndex].text}</p>
            <p><strong>Dates:</strong> ${startDate} to ${endDate}</p>
            <p><strong>Chair Style:</strong> ${chairStyleText}</p>
            <p><strong>Quantity:</strong> ${chairQuantity}</p>
            <p><strong>Venue:</strong> ${document.getElementById("venue-address").value}</p>
            <p><strong>Total Cost:</strong> ${total}</p>
        `;
        
        // Add special requirements if any
        const specialRequirements = document.getElementById("special-requirements").value;
        if (specialRequirements.trim()) {
            confirmationDetails.innerHTML += `
                <p><strong>Special Requirements:</strong> ${specialRequirements}</p>
            `;
        }
    }

    // Modal close handlers
    document.querySelector(".close-modal").addEventListener("click", function() {
        document.getElementById("confirmation-modal").classList.remove("active");
    });
    
    document.getElementById("close-confirmation").addEventListener("click", function() {
        document.getElementById("confirmation-modal").classList.remove("active");
    });

    // Input field validation on blur
    const formInputs = bookingForm.querySelectorAll("input, select, textarea");
    formInputs.forEach(input => {
        input.addEventListener("blur", function() {
            if (input.required && !input.value) {
                showError(input, `This field is required`);
            } else {
                input.classList.remove("error");
                const formGroup = input.closest(".form-group");
                const errorElement = formGroup.querySelector(".error-message");
                errorElement.textContent = "";
            }
        });
        
        input.addEventListener("input", function() {
            input.classList.remove("error");
            const formGroup = input.closest(".form-group");
            const errorElement = formGroup.querySelector(".error-message");
            errorElement.textContent = "";
        });
    });

    // Initialize with default values
    document.getElementById("chair-quantity").value = 10;
    updateBookingSummary();

    // Add touch-friendly event handling for mobile
    if ('ontouchstart' in window) {
        document.querySelectorAll('.btn, .form-group.checkbox label, .terms-link, .close-modal').forEach(element => {
            element.style.cursor = 'pointer';
        });
    }

    // Handle manual date entry
    document.getElementById("start-date").addEventListener("change", function() {
        updateDatesFromInputs();
    });

    document.getElementById("end-date").addEventListener("change", function() {
        updateDatesFromInputs();
    });

    // Function to update dates when manually entered
    function updateDatesFromInputs() {
        const startDateInput = document.getElementById("start-date");
        const endDateInput = document.getElementById("end-date");
        
        if (startDateInput.value && endDateInput.value) {
            const startDate = new Date(startDateInput.value);
            const endDate = new Date(endDateInput.value);
            
            // Validate dates
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (startDate < today) {
                showError(startDateInput, "Start date cannot be in the past");
                return;
            }
            
            if (endDate < startDate) {
                showError(endDateInput, "End date cannot be before start date");
                return;
            }
            
            // Check if dates are unavailable
            const unavailableDatesSet = new Set(unavailableDates);
            let currentDate = new Date(startDate);
            let isUnavailable = false;
            
            while (currentDate <= endDate) {
                const dateString = currentDate.toISOString().split('T')[0];
                if (unavailableDatesSet.has(dateString)) {
                    isUnavailable = true;
                    break;
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
            
            if (isUnavailable) {
                showError(startDateInput, "Selected date range includes unavailable dates");
                return;
            }
            
            // Calculate days
            const days = calculateDays(startDate, endDate);
            document.getElementById("summary-days").textContent = days;
            
            // Update flatpickr to match manual selection (without triggering onChange)
            datePicker.setDate([startDate, endDate], false);
            
            // Clear any error messages
            startDateInput.classList.remove("error");
            endDateInput.classList.remove("error");
            const errorElement = document.querySelector(".date-range .error-message");
            if (errorElement) {
                errorElement.textContent = "";
            }
            
            // Update booking summary
            updateBookingSummary();
            
            console.log("Manual date selection updated:", {
                startDate: startDate.toDateString(),
                endDate: endDate.toDateString(),
                days: days
            });
        }
    }

    // Optimize page load on mobile
    if (window.innerWidth < 768) {
        // Reduce animations for better performance
        document.documentElement.style.setProperty('--transition-medium', '0.2s ease');
        document.documentElement.style.setProperty('--transition-slow', '0.3s ease');
        
        // Ensure proper viewport height on mobile
        function setMobileHeight() {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }
        
        setMobileHeight();
        window.addEventListener('resize', setMobileHeight);
        
        // Improve form scrolling
        const formInputs = document.querySelectorAll('input, select, textarea');
        formInputs.forEach(input => {
            input.addEventListener('focus', function() {
                // Small delay to ensure keyboard is open
                setTimeout(() => {
                    this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            });
        });
    }
}); 