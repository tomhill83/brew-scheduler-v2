// src/components/CalendarView.jsx
import React, { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { fetchCalendarEvents } from "../utils/fetchCalendarEvents";

export default function CalendarView({ accessToken, calendarId, onDateClick }) {
  const [events, setEvents] = useState([]);

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
      />
    </div>
  );
}
