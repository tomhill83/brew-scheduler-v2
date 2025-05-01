// src/utils/createEventsForBatch.js
import { addDays, isWeekend, subDays, formatISO } from "date-fns";

function bumpToMonday(date) {
  const d = new Date(date);
  if (d.getDay() === 6) return addDays(d, 2); // Saturday → Monday
  if (d.getDay() === 0) return addDays(d, 1); // Sunday → Monday
  return d;
}

function bumpBackToFriday(date) {
  const d = new Date(date);
  if (d.getDay() === 6) return subDays(d, 1); // Saturday → Friday
  if (d.getDay() === 0) return subDays(d, 2); // Sunday → Friday
  return d;
}

function createEvent(title, date, colorId = null) {
  const startDate = formatISO(new Date(date), { representation: "date" });
  const endDate = formatISO(addDays(new Date(date), 1), { representation: "date" });

  return {
    summary: title,
    start: { date: startDate },
    end: { date: endDate },
    ...(colorId ? { colorId } : {}),
  };
}

export async function createEventsForBatch({ formData, startDate, accessToken, calendarId }) {
  if (!accessToken || !calendarId) {
    throw new Error("Missing access token or calendar ID");
  }

  const {
    recipe,
    fv,
    bbt,
    turns,
    dryHop,
    spindasol
  } = formData;

  const start = new Date(startDate);
  const events = [];

  // ✅ Heat HLT if Monday brew
  if (start.getDay() === 1) {
    const hltPreheat = subDays(start, 1);
    events.push(createEvent("Heat HLT (Monday brew)", hltPreheat));
  }

  // ✅ Brewday spanning
  const brewTitle = `Brew ${recipe} x${turns} ${fv}`;
  const brewColor = "9"; // Blue
  const brewEnd = parseInt(turns) > 2 ? addDays(start, 1) : start;
  events.push({
    summary: brewTitle,
    start: { date: formatISO(start, { representation: "date" }) },
    end: { date: formatISO(addDays(brewEnd, 1), { representation: "date" }) },
    colorId: brewColor,
  });

  // ✅ Prep Brew
  const prepBrew = bumpBackToFriday(subDays(start, 1));
  events.push(createEvent(`Prep ${recipe} Brewday`, prepBrew));

  // ✅ Transfer logic (12 days after start, bumped to Monday)
  const transferRaw = addDays(start, 12);
  const transferDate = bumpToMonday(transferRaw);
  events.push(createEvent(`Sani & Prep ${bbt}`, bumpBackToFriday(subDays(transferDate, 1))));
  events.push(createEvent(`XFER ${recipe} ${fv} → ${bbt}`, transferDate, "10")); // Green
  events.push(createEvent(`Finalize ${bbt} carb`, addDays(transferDate, 1)));

  // ✅ Dry Hop logic
  if (dryHop) {
    const dropTempDate = addDays(start, 6);
    const dryHopDate = addDays(start, 7);
    const recircDate = addDays(start, 8);

    events.push(createEvent(`Drop ${recipe} ${fv} to 55°F`, dropTempDate));
    events.push(createEvent(`Dry Hop ${recipe} ${fv}`, dryHopDate));
    events.push(
      createEvent(
        `Recirc & Crash ${recipe} ${fv}${spindasol ? " - Spindasol" : ""}`,
        recircDate
      )
    );
  }

  // ✅ Packaging logic (different for BBT3)
  const packagingDate = bumpToMonday(addDays(transferDate, 4)); // BBT1 & 2

  if (bbt === "BBT3") {
    const canDate = packagingDate;
    const kegDate = bumpToMonday(addDays(transferDate, 3)); // Thursday

    const prepCan = bumpBackToFriday(subDays(canDate, 1));
    const prepKeg = bumpBackToFriday(subDays(kegDate, 1));

    events.push(createEvent("Prep Canning", prepCan));
    events.push(createEvent(`Can ${recipe} ${bbt}`, canDate, "6"));

    events.push(createEvent("Prep Kegging", prepKeg));
    events.push(createEvent(`Keg ${recipe} ${bbt}`, kegDate, "6"));

  } else {
    const canKegDate = packagingDate;
    const prepDate = bumpBackToFriday(subDays(canKegDate, 1));

    events.push(createEvent("Prep Canning", prepDate));
    events.push(createEvent(`Can ${recipe} ${bbt}`, canKegDate, "6"));

    events.push(createEvent("Prep Kegging", prepDate));
    events.push(createEvent(`Keg ${recipe} ${bbt}`, canKegDate, "6"));
  }

  // 🔁 Post to Google Calendar
  for (const event of events) {
    try {
      await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );
    } catch (error) {
      console.error("❌ Failed to create event:", event.summary, error);
    }
  }

  return events;
}
