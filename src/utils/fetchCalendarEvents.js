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
    if (!title) return undefined;
    if (title.includes("Brew")) return "#3a87ad";
    if (title.includes("XFER")) return "#51a351";
    if (title.includes("Can") || title.includes("Keg")) return "#f89406";
    return undefined;
  }
  