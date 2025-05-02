// src/components/DateClickModal.jsx
import React, { useState } from "react";
import BatchForm from "./BatchForm";
import AddTaskModal from "./AddTaskModal";

export default function DateClickModal({ selectedDate, onClose, accessToken, calendarId }) {
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);

  const handleAddBatch = () => {
    setShowBatchForm(true);
  };

  const handleAddTask = () => {
    setShowTaskForm(true);
  };

  const handleCreateTask = async ({ title, description, date }) => {
    if (!accessToken || !calendarId) {
      alert("Missing access token or calendar ID");
      return;
    }

    const event = {
      summary: title,
      description,
      start: { date }, // all-day event
      end: { date },   // same end date for all-day
      colorId: null,   // Let Google assign default color or apply logic if needed
    };

    try {
      await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });
    } catch (err) {
      console.error("❌ Failed to create task:", err);
      alert("Failed to create task");
    }
  };

  return (
    <>
      {!showBatchForm && !showTaskForm && (
        <div className="modal-backdrop" onClick={onClose}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <h3>Add Event for {selectedDate}</h3>
            <button onClick={handleAddBatch}>Add Batch</button>
            <button onClick={handleAddTask}>Add Task</button>
            <button onClick={onClose}>Cancel</button>
          </div>
        </div>
      )}

      {showBatchForm && (
        <div className="modal-backdrop" onClick={onClose}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <BatchForm
              date={selectedDate}
              onClose={onClose}
              accessToken={accessToken}
              calendarId={calendarId}
            />
          </div>
        </div>
      )}

      {showTaskForm && (
        <AddTaskModal
          date={selectedDate}
          onClose={onClose}
          onCreate={handleCreateTask}
        />
      )}
    </>
  );
}
