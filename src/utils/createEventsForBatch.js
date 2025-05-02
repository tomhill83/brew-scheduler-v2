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

function createEvent(title, date, colorId = null, description = "") {
  const startDate = formatISO(new Date(date), { representation: "date" });
  const endDate = formatISO(addDays(new Date(date), 1), { representation: "date" });

  return {
    summary: title,
    start: { date: startDate },
    end: { date: endDate },
    description,
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
    spindasol,
  } = formData;

  const start = new Date(startDate);
  const brewDays = turns > 2 ? 2 : 1;
  const brewEnd = addDays(start, brewDays);

  const events = [];

  // Heat HLT on Sunday if Monday brew
  if (start.getDay() === 1) {
    const sunday = subDays(start, 1);
    events.push(createEvent("Heat HLT", sunday, null, "Preheat Hot Liquor Tank for Monday brew"));
  }

  // Prep Brewday
  const prepBrew = bumpBackToFriday(subDays(start, 1));
  events.push(createEvent(`Prep ${recipe} Brewday`, prepBrew, null, `Pre-brew setup for ${recipe} in ${fv}`));

  // Brew
  const brewTitle = `Brew ${recipe} x${turns} ${fv}`;
  let brewDesc = `Tank: ${fv}\nTurns: ${turns}`;
  if (turns > 1) brewDesc += `\nLate Shift Brewer:`;
  if (turns <= 2) {
    brewDesc += `\nGrain pick up:`;
  } else {
    brewDesc += `\nGrain pick up DAY 1:\nGrain pick up DAY 2:`;
  }
  events.push({
    summary: brewTitle,
    start: { date: formatISO(start, { representation: "date" }) },
    end: { date: formatISO(brewEnd, { representation: "date" }) },
    description: brewDesc,
    colorId: "9",
  });

  // Transfer
  const transferRaw = addDays(start, 12);
  const transferDate = bumpToMonday(transferRaw);
  const saniDate = bumpBackToFriday(subDays(transferDate, 1));
  events.push(createEvent(`Sani & Prep ${bbt}`, saniDate, null, `Sanitize and prep ${bbt} for transfer`));
  events.push(createEvent(`XFER ${recipe} ${fv} → ${bbt}`, transferDate, "10", `From: ${fv} → ${bbt}`));

  // Finalize carb
  const carbDate = addDays(transferDate, 1);
  events.push(createEvent(`Finalize ${bbt} carb`, carbDate, null, `Confirm carbonation on ${bbt}`));

  // Dry hop
  if (dryHop) {
    const dropTempDate = addDays(start, 6);
    const dryHopDate = addDays(start, 7);
    const recircDate = addDays(start, 8);

    events.push(createEvent(`Drop ${recipe} ${fv} to 55°F`, dropTempDate, null, `Begin chilling ${fv} for dry hop`));
    events.push(createEvent(`Dry Hop ${recipe} ${fv}`, dryHopDate, null, `Tank: ${fv}`));
    let recircTitle = `Recirc & Crash ${recipe} ${fv}`;
    if (spindasol) recircTitle += " - Spindasol";
    events.push(createEvent(recircTitle, recircDate, null, `Tank: ${fv}`));
  }

  // Packaging
  const packagingBase = bumpToMonday(addDays(transferDate, 4));
  let canDate, kegDate;

  if (bbt === "BBT3") {
    canDate = packagingBase;
    kegDate = bumpToMonday(subDays(packagingBase, 1));
  } else {
    canDate = packagingBase;
    kegDate = packagingBase;
  }

  // Prep Canning
  const prepCan = bumpBackToFriday(subDays(canDate, 1));
  events.push(createEvent("Prep Canning", prepCan, null, `Prep for canning ${recipe} from ${bbt}`));
  events.push(createEvent(`Can ${recipe} ${bbt}`, canDate, "6", "6-pack cases:\n12-pack cases:\nLoose cans:\n[BATCH]"));

  // Prep Kegging
  const prepKeg = bumpBackToFriday(subDays(kegDate, 1));
  events.push(createEvent("Prep Kegging", prepKeg, null, `Prep for kegging ${recipe} from ${bbt}`));
  events.push(createEvent(`Keg ${recipe} ${bbt}`, kegDate, "6", "Half-barrel kegs:\nSixth-barrel kegs:\n[BATCH]"));

  // Send events to Google Calendar
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
