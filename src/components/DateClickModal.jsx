import React, { useState } from "react";
import BatchForm from "./BatchForm";

export default function DateClickModal({ date, onClose }) {
  const [showBatchForm, setShowBatchForm] = useState(false);

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("modal")) onClose();
  };

  if (showBatchForm) {
    return (
      <div className="modal" onClick={handleBackdropClick}>
        <div className="modal-content">
          <BatchForm date={date} onClose={onClose} />
        </div>
      </div>
    );
  }

  return (
    <div className="modal" onClick={handleBackdropClick}>
      <div className="modal-content">
        <h2>Add Event on {date}</h2>
        <button onClick={() => setShowBatchForm(true)}>Add Batch</button>
        <button onClick={() => alert("Task creation coming soon!")}>Add Task</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
