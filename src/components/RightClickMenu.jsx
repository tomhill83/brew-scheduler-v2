// src/components/RightClickMenu.jsx
import React from "react";
import "./RightClickMenu.css";

const colorOptions = [
  { color: "#5269de" }, // Blue (Brew)
  { color: "#2b8f37" }, // Green (XFER)
  { color: "#f59b42" }, // Orange (Packaging)
  { color: "#2cc9aa" }, // Eucalyptus (Default)
];

export default function RightClickMenu({ position, onChangeColor, onDelete }) {
  if (!position) return null;

  const style = {
    top: `${position.y}px`,
    left: `${position.x}px`,
  };

  const handleClickOutside = () => {
    onChangeColor(null); // Passing null will signal "close menu"
  };

  return (
    <div className="modal-backdrop" onClick={handleClickOutside}>
      <div
        className="right-click-menu"
        style={style}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="color-swatches">
          {colorOptions.map(({ color }) => (
            <div
              key={color}
              className="color-swatch"
              style={{ backgroundColor: color }}
              onClick={() => onChangeColor(color)}
              title={color}
            />
          ))}
        </div>
        <button className="modal-button" onClick={onDelete}>
          Delete Event
        </button>
      </div>
    </div>
  );
}
