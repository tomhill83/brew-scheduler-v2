// src/App.jsx
import React, { useEffect, useState } from "react";
import CalendarView from "./components/CalendarView";
import DateClickModal from "./components/DateClickModal";
import GoogleAuth from "./components/GoogleAuth";
import { CALENDAR_ID } from "./config";
import './styles/calendar.css';
import './styles/modal.css';


export default function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [modalDate, setModalDate] = useState(null);

  const handleDateClick = (dateStr) => {
    console.log("📅 Date clicked:", dateStr);
    setModalDate(dateStr);
  };

  return (
    <div>
      <GoogleAuth setAccessToken={setAccessToken} />
      {accessToken && (
        <>
          <CalendarView
            accessToken={accessToken}
            calendarId={CALENDAR_ID}
            onDateClick={handleDateClick}
          />
          {modalDate && (
          <DateClickModal
          selectedDate={modalDate}
          onClose={() => setModalDate(null)}
         accessToken={accessToken}
         calendarId={calendarId}
         />
       )}

        </>
      )}
    </div>
  );
}
