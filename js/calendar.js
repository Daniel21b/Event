/**
 * Yalem Seating - Premium Chair Rentals
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
    
    if (!calendarEl) return;
    
    // Sample unavailable dates (in a real application, these would come from a database)
    const unavailableDates = [
        { start: '2024-03-10', end: '2024-03-12' },
        { start: '2024-03-18', end: '2024-03-20' },
        { start: '2024-03-24', end: '2024-03-26' },
        { start: '2024-04-02', end: '2024-04-04' },
        { start: '2024-04-15', end: '2024-04-18' },
        { start: '2024-04-24', end: '2024-04-26' },
        { start: '2024-04-30', end: '2024-05-02' }
    ];
    
    // Initialize FullCalendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
        },
        selectable: false, // Disable date selection
        events: [
            // Add unavailable dates as background events
            ...unavailableDates.map(date => ({
                start: date.start,
                end: date.end,
                display: 'background',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                classNames: ['unavailable-date']
            })),
            // Add booked dates as regular events
            ...unavailableDates.map(date => ({
                start: date.start,
                end: date.end,
                title: 'Booked',
                backgroundColor: '#dc3545',
                borderColor: '#dc3545'
            }))
        ],
        eventDidMount: function(info) {
            // Add tooltip for unavailable dates
            if (info.event.display === 'background') {
                info.el.title = 'This date is unavailable';
            }
        }
    });
    
    calendar.render();
    
    // Add calendar legend
    addCalendarLegend(calendarEl);
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