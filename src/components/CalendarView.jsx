import React, { useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function CalendarView({ token, onDateClick }) {
  const calendarRef = useRef(null);

  const handleDateClick = (arg) => {
    onDateClick(arg.dateStr);
  };

  return (
    <div style={{ height: "90vh", padding: "1rem" }}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="100%"
        dateClick={handleDateClick}
        ref={calendarRef}
      />
    </div>
  );
}
