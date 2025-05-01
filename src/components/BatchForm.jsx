// src/components/BatchForm.jsx
import React, { useState, useEffect } from "react";
import { fetchRecipes } from "../services/recipeApi";
import { createEventsForBatch } from "../utils/createEventsForBatch";

export default function BatchForm({ date, onClose, accessToken, calendarId }) {
  const [recipes, setRecipes] = useState([]);
  const [formData, setFormData] = useState({
    recipe: "",
    fv: "",
    bbt: "",
    turns: "1",
    dryHop: false,
    spindasol: false,
  });

  useEffect(() => {
    fetchRecipes().then((data) => {
      console.log("Loaded recipes:", data);
      setRecipes(data);
    });
  }, []);

  const isTruthy = (value) =>
    value === true ||
    value === "Yes" ||
    value === "TRUE" ||
    value === "yes" ||
    value === "X" ||
    value === "✔";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "recipe") {
      const selectedRecipe = recipes.find(
        (r) => r["Recipe Name"] === value || r.name === value
      );

      const includesDryHop = isTruthy(selectedRecipe?.["Include Dry Hop"]);
      const includesSpindasol = isTruthy(selectedRecipe?.["Include Spindasol"]);

      setFormData((prev) => ({
        ...prev,
        recipe: value,
        dryHop: includesDryHop,
        spindasol: includesDryHop && includesSpindasol,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!accessToken || !calendarId) {
      alert("Missing access token or calendar ID");
      return;
    }
  
    try {
      const [year, month, day] = date.split("-").map(Number);
      const parsedDate = new Date(year, month - 1, day); // ✅ local midnight
      console.log("🧪 Parsed startDate (local):", parsedDate);
  
      await createEventsForBatch({
        formData,
        startDate: parsedDate,
        accessToken,
        calendarId,
      });
  
      alert("✅ Batch created!");
      onClose();
    } catch (err) {
      console.error("Error creating batch:", err);
      alert("❌ Failed to create batch");
    }
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <h3>Create Batch - {date}</h3>
      <label>
        Recipe:
        <select name="recipe" value={formData.recipe} onChange={handleChange}>
          <option value="">Select</option>
          {recipes.map((r, idx) => {
            const label = r["Recipe Name"] || r.name || `Unnamed-${idx}`;
            return (
              <option key={label} value={label}>
                {label}
              </option>
            );
          })}
        </select>
      </label>
      <label>
        Fermenter (FV):
        <select name="fv" value={formData.fv} onChange={handleChange}>
          <option value="">Select</option>
          <option value="FV1">FV1</option>
          <option value="FV2">FV2</option>
          <option value="FV3">FV3</option>
          <option value="FV4">FV4</option>
          <option value="FV5">FV5</option>
          <option value="FV6">FV6</option>
        </select>
      </label>
      <label>
        Brite Tank (BBT):
        <select name="bbt" value={formData.bbt} onChange={handleChange}>
          <option value="">Select</option>
          <option value="BBT1">BBT1</option>
          <option value="BBT2">BBT2</option>
          <option value="BBT3">BBT3</option>
        </select>
      </label>
      <label>
        Brew Turns:
        <select name="turns" value={formData.turns} onChange={handleChange}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          name="dryHop"
          checked={formData.dryHop}
          onChange={handleChange}
        />
        Include Dry Hop
      </label>
      {formData.dryHop && (
        <label>
          <input
            type="checkbox"
            name="spindasol"
            checked={formData.spindasol}
            onChange={handleChange}
          />
          Include Spindasol
        </label>
      )}
      <br />
      <button type="submit">Create Batch</button>
      <button type="button" onClick={onClose}>
        Cancel
      </button>
    </form>
  );
}
