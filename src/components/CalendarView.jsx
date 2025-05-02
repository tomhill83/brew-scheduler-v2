// src/components/CalendarView.jsx
import React, { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { fetchCalendarEvents } from "../utils/fetchCalendarEvents";
import "../styles/calendar.css";

export default function CalendarView({ accessToken, calendarId, onDateClick }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const loadEvents = useCallback(async () => {
    if (!accessToken || !calendarId) return;
    try {
      const fetchedEvents = await fetchCalendarEvents(calendarId, accessToken);
      setEvents(fetchedEvents);
      console.log("📅 Events loaded:", fetchedEvents);
    } catch (err) {
      console.error("❌ Failed to fetch calendar events", err);
    }
  }, [accessToken, calendarId]);

  useEffect(() => {
    loadEvents();
    const interval = setInterval(() => loadEvents(), 30000);
    return () => clearInterval(interval);
  }, [loadEvents]);

  return (
    <div style={{ height: "90vh", padding: "1rem" }}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="100%"
        events={events}
        dateClick={(arg) => onDateClick(arg.dateStr)}
        eventClick={(info) => setSelectedEvent(info.event)}
        eventDisplay="block"
        eventContent={renderEventContent}
      />

      {selectedEvent && (
        <div className="modal-backdrop" onClick={() => setSelectedEvent(null)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedEvent.title}</h3>
            <p>{selectedEvent.extendedProps.description || "No description available"}</p>
            <button className="close-button" onClick={() => setSelectedEvent(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function renderEventContent(eventInfo) {
  return (
    <div
      className="fc-custom-event"
      style={{ backgroundColor: eventInfo.event.backgroundColor || "#d3d3d3", color: "#000" }}
    >
      {eventInfo.event.title}
    </div>
  );
}
