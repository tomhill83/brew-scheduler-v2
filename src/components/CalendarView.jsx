// src/components/CalendarView.jsx
import React, { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { fetchCalendarEvents } from "../utils/fetchCalendarEvents";
import RightClickMenu from "./RightClickMenu";
import "../styles/calendar.css";

export default function CalendarView({ accessToken, calendarId, onDateClick }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rightClickData, setRightClickData] = useState({ event: null, position: null });

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

  const handleEventRightClick = (calendarEvent) => (e) => {
    e.preventDefault();
    const { pageX, pageY } = e;
    setRightClickData({ event: calendarEvent.event, position: { x: pageX, y: pageY } });
  };

  const handleColorChange = async (color) => {
    const event = rightClickData.event;
    if (!event) return;

    try {
      // Update in Google Calendar
      await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${event.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ colorId: null, backgroundColor: color }),
        }
      );

      // Update local display
      event.setProp("backgroundColor", color);
      setRightClickData({ event: null, position: null });
    } catch (err) {
      console.error("❌ Failed to update color", err);
    }
  };

  const handleDeleteEvent = async () => {
    const event = rightClickData.event;
    if (!event) return;

    try {
      await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${event.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      event.remove(); // Remove from local calendar
      setRightClickData({ event: null, position: null });
    } catch (err) {
      console.error("❌ Failed to delete event", err);
    }
  };

  return (
    <div style={{ height: "90vh", padding: "1rem", position: "relative" }}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="100%"
        events={events}
        dateClick={(arg) => onDateClick(arg.dateStr)}
        eventClick={(info) => setSelectedEvent(info.event)}
        eventDisplay="block"
        eventContent={renderEventContent}
        eventDidMount={(info) => {
          // Attach native right-click handler
          info.el.addEventListener("contextmenu", handleEventRightClick(info));
        }}
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

      {rightClickData.event && rightClickData.position && (
        <RightClickMenu
          position={rightClickData.position}
          onChangeColor={handleColorChange}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
}

function renderEventContent(eventInfo) {
  return (
    <div
      className="fc-custom-event"
      style={{
        backgroundColor: eventInfo.event.backgroundColor || "#2cc9aa",
        color: "#000",
        padding: "2px 4px",
        borderRadius: "4px"
      }}
    >
      {eventInfo.event.title}
    </div>
  );
}
