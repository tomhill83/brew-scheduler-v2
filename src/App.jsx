// src/App.jsx
import React, { useState } from "react";
import CalendarView from "./components/CalendarView";
import GoogleAuth from "./components/GoogleAuth";
import DateClickModal from "./components/DateClickModal";
import { CALENDAR_ID } from "./config";

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateClick = (dateStr) => {
    console.log("📅 Date clicked:", dateStr);
    setSelectedDate(dateStr);
    setModalOpen(true);
  };

  return (
    <div className="app-container">
      <GoogleAuth setAccessToken={setAccessToken} />
      <CalendarView
        accessToken={accessToken}
        calendarId={CALENDAR_ID}
        onDateClick={handleDateClick}
      />
      {modalOpen && (
        <DateClickModal
          selectedDate={selectedDate}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
