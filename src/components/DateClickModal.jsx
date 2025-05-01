// src/components/DateClickModal.jsx
import React, { useState } from "react";
import BatchForm from "./BatchForm";

export default function DateClickModal({
  selectedDate,
  onClose,
  onAddTask,
  accessToken,
  calendarId
}) {
  const [showBatchForm, setShowBatchForm] = useState(false);

  const handleAddBatch = () => {
    setShowBatchForm(true);
  };

  if (showBatchForm) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-window" onClick={(e) => e.stopPropagation()}>
          <BatchForm
            date={selectedDate}
            onClose={onClose}
            accessToken={accessToken}
            calendarId={calendarId}
          />
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <h3>Choose Action</h3>
        <button onClick={handleAddBatch}>Add Batch</button>
        <button onClick={onAddTask}>Add Task</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
