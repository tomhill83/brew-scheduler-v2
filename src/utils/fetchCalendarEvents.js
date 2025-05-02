// src/utils/fetchCalendarEvents.js
export async function fetchCalendarEvents(calendarId, accessToken) {
  if (!calendarId || !accessToken) {
    throw new Error("Missing calendar ID or access token");
  }

  const timeMin = new Date("2019-01-01").toISOString(); // fetch from 2019 to present
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${timeMin}&singleEvents=true&orderBy=startTime`,
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

  return data.items.map((event) => {
    const title = event.summary || "Untitled";
    const color = getColorForTitle(title);
    return {
      id: event.id,
      title,
      start: event.start?.date || event.start?.dateTime,
      end: event.end?.date || event.end?.dateTime,
      allDay: !!event.start?.date,
      description: event.description || "",
      ...(color && { backgroundColor: color, borderColor: color, textColor: "black" }),
    };
  });
}

function getColorForTitle(title) {
  if (!title) return null;
  if (title.includes("Brew")) return "#5269de"; // blue
  if (title.includes("XFER")) return "#2b8f37"; // green
  if (title.includes("Can") || title.includes("Keg")) return "#f59b42"; // orange
  return "#2cc9aa"; // eucalyptus/teal default

}
