/**
 * Elegant Seating - Premium Chair Rentals
 * Calendar JavaScript File
 */

document.addEventListener('DOMContentLoaded', function() {
    initBookingCalendar();
});

/**
 * Initialize the booking calendar
 */
function initBookingCalendar() {
    const calendarEl = document.getElementById('booking-calendar');
    const eventDatesInput = document.getElementById('event-dates');
    
    if (!calendarEl) return;
    
    // Sample unavailable dates (in a real application, these would come from a database)
    const unavailableDates = [
        { start: '2023-11-10', end: '2023-11-12' },
        { start: '2023-11-18', end: '2023-11-20' },
        { start: '2023-11-24', end: '2023-11-26' },
        { start: '2023-12-02', end: '2023-12-04' },
        { start: '2023-12-15', end: '2023-12-18' },
        { start: '2023-12-24', end: '2023-12-26' },
        { start: '2023-12-31', end: '2024-01-02' }
    ];
    
    // Initialize FullCalendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
        },
        selectable: true,
        selectMirror: true,
        unselectAuto: false,
        longPressDelay: 100,
        eventColor: '#d4af37',
        events: unavailableDates.map(date => ({
            start: date.start,
            end: date.end,
            display: 'background',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            classNames: ['unavailable-date']
        })),
        select: function(info) {
            // Check if selection includes unavailable dates
            const selectionStart = new Date(info.startStr);
            const selectionEnd = new Date(info.endStr);
            selectionEnd.setDate(selectionEnd.getDate() - 1); // FullCalendar end date is exclusive
            
            let containsUnavailableDate = false;
            
            unavailableDates.forEach(date => {
                const unavailableStart = new Date(date.start);
                const unavailableEnd = new Date(date.end);
                
                // Check if there's an overlap
                if (
                    (selectionStart <= unavailableEnd && selectionEnd >= unavailableStart) ||
                    (unavailableStart <= selectionEnd && unavailableEnd >= selectionStart)
                ) {
                    containsUnavailableDate = true;
                }
            });
            
            if (containsUnavailableDate) {
                calendar.unselect(); // Prevent selection
                showToast('Some of these dates are unavailable. Please select different dates.');
                return;
            }
            
            // Format the selected dates
            const formattedStart = formatDate(selectionStart);
            const formattedEnd = formatDate(selectionEnd);
            
            // Update the input field
            if (eventDatesInput) {
                if (isSameDay(selectionStart, selectionEnd)) {
                    eventDatesInput.value = formattedStart;
                } else {
                    eventDatesInput.value = `${formattedStart} - ${formattedEnd}`;
                }
                
                // Trigger change event to update summary
                const event = new Event('change');
                eventDatesInput.dispatchEvent(event);
            }
            
            // Add selected class to the date range
            addSelectedClassToDateRange(selectionStart, selectionEnd);
        },
        unselect: function() {
            // Clear the input field
            if (eventDatesInput) {
                eventDatesInput.value = '';
                
                // Trigger change event to update summary
                const event = new Event('change');
                eventDatesInput.dispatchEvent(event);
            }
            
            // Remove selected class from all dates
            document.querySelectorAll('.fc-day').forEach(day => {
                day.classList.remove('fc-day-selected');
                day.classList.remove('fc-day-in-range');
                day.classList.remove('fc-day-start-selected');
                day.classList.remove('fc-day-end-selected');
            });
        },
        dateClick: function(info) {
            // If a range is already selected, clear it
            if (eventDatesInput && eventDatesInput.value) {
                calendar.unselect();
            }
        },
        datesSet: function() {
            // Mark unavailable dates
            markUnavailableDates();
            
            // If dates were previously selected, reapply the selection
            if (eventDatesInput && eventDatesInput.value) {
                const dateRange = eventDatesInput.value.split(' - ');
                if (dateRange.length === 2) {
                    const start = parseDate(dateRange[0]);
                    const end = parseDate(dateRange[1]);
                    if (start && end) {
                        addSelectedClassToDateRange(start, end);
                    }
                } else if (dateRange.length === 1) {
                    const date = parseDate(dateRange[0]);
                    if (date) {
                        addSelectedClassToDateRange(date, date);
                    }
                }
            }
        }
    });
    
    calendar.render();
    
    // Add calendar legend
    addCalendarLegend(calendarEl);
    
    // Mark unavailable dates
    markUnavailableDates();
    
    /**
     * Format date as MM/DD/YYYY
     */
    function formatDate(date) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }
    
    /**
     * Parse date from MM/DD/YYYY format
     */
    function parseDate(dateString) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
            return new Date(parts[2], parts[0] - 1, parts[1]);
        }
        return null;
    }
    
    /**
     * Check if two dates are the same day
     */
    function isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    /**
     * Add selected class to date range
     */
    function addSelectedClassToDateRange(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        // Iterate through each day in the range
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateString = currentDate.toISOString().split('T')[0];
            const dayEl = document.querySelector(`.fc-day[data-date="${dateString}"]`);
            
            if (dayEl) {
                dayEl.classList.add('fc-day-selected');
                
                // Add special classes for start and end dates
                if (isSameDay(currentDate, startDate)) {
                    dayEl.classList.add('fc-day-start-selected');
                }
                
                if (isSameDay(currentDate, endDate)) {
                    dayEl.classList.add('fc-day-end-selected');
                }
                
                // Add in-range class for dates between start and end
                if (!isSameDay(currentDate, startDate) && !isSameDay(currentDate, endDate)) {
                    dayEl.classList.add('fc-day-in-range');
                }
            }
            
            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }
    
    /**
     * Mark unavailable dates
     */
    function markUnavailableDates() {
        unavailableDates.forEach(date => {
            const start = new Date(date.start);
            const end = new Date(date.end);
            
            // Iterate through each day in the range
            const currentDate = new Date(start);
            while (currentDate <= end) {
                const dateString = currentDate.toISOString().split('T')[0];
                const dayEl = document.querySelector(`.fc-day[data-date="${dateString}"]`);
                
                if (dayEl) {
                    dayEl.classList.add('fc-day-unavailable');
                }
                
                // Move to next day
                currentDate.setDate(currentDate.getDate() + 1);
            }
        });
    }
    
    /**
     * Add calendar legend
     */
    function addCalendarLegend(calendarEl) {
        const legend = document.createElement('div');
        legend.className = 'calendar-legend';
        legend.innerHTML = `
            <div class="legend-item">
                <div class="legend-color legend-available"></div>
                <span>Available</span>
            </div>
            <div class="legend-item">
                <div class="legend-color legend-selected"></div>
                <span>Selected</span>
            </div>
            <div class="legend-item">
                <div class="legend-color legend-unavailable"></div>
                <span>Unavailable</span>
            </div>
            <div class="legend-item">
                <div class="legend-color legend-today"></div>
                <span>Today</span>
            </div>
        `;
        
        calendarEl.parentNode.appendChild(legend);
    }
    
    /**
     * Show toast message
     */
    function showToast(message) {
        // Create toast element if it doesn't exist
        let toast = document.querySelector('.toast-message');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast-message';
            document.body.appendChild(toast);
        }
        
        // Set message and show toast
        toast.textContent = message;
        toast.classList.add('show');
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
} 