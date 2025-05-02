// src/utils/fetchCalendarEvents.js
export async function fetchCalendarEvents(calendarId, accessToken) {
    const start = new Date("2019-01-01").toISOString();

  
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${start}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );
  
    if (!response.ok) {
      throw new Error("Failed to fetch calendar events");
    }
  
    const data = await response.json();
    return data.items.map((event) => ({
      id: event.id,
      title: event.summary,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      allDay: !event.start?.dateTime,
      color: getColorForTitle(event.summary),
    }));
  }
  
  function getColorForTitle(title) {
    if (!title) return "#33b679"; // Teal (Google 'Eucalyptus')
  
    const lower = title.toLowerCase();
  
    // 🎯 Exact match for "brew " but NOT "prep brew" or anything else
    if (lower.startsWith("brew ")) return "#3a87ad"; // Blue
  
    if (lower.includes("xfer")) return "#51a351"; // Green
    if (lower.includes("can") || lower.includes("keg")) {
      if (lower.includes("prep")) return "#33b679"; // Teal for prep
      return "#f89406"; // Orange for actual packaging
    }
  
    return "#33b679"; // All other events (prep, HLT, carb, etc.) = teal
  }
  
  
  