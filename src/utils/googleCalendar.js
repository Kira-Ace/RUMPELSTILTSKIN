const CALENDAR_API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

function formatTo12h(dateStr) {
  const d = new Date(dateStr);
  let h = d.getHours();
  const m = d.getMinutes();
  const period = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${String(m).padStart(2, '0')} ${period}`;
}

function toDateKey(dateStr) {
  // Works for both "2026-04-07" (all-day) and "2026-04-07T10:00:00-07:00" (timed)
  const d = dateStr.length === 10 ? new Date(dateStr + 'T00:00:00') : new Date(dateStr);
  const y = d.getFullYear();
  const m = d.getMonth();
  const day = d.getDate();
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export async function fetchGoogleCalendarEvents(accessToken, timeMin, timeMax) {
  if (!accessToken) return [];

  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  });

  try {
    const res = await fetch(`${CALENDAR_API}?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.status === 401 || res.status === 403) {
      return { error: 'token_expired' };
    }

    if (!res.ok) return [];

    const data = await res.json();
    const items = data.items || [];

    return items
      .filter(ev => ev.status !== 'cancelled')
      .map(ev => {
        const startStr = ev.start?.dateTime || ev.start?.date || '';
        const isAllDay = !ev.start?.dateTime;
        return {
          id: `gcal_${ev.id}`,
          title: ev.summary || '(No title)',
          time: isAllDay ? '' : formatTo12h(startStr),
          desc: ev.description || '',
          tag: 'Google',
          isGoogleEvent: true,
          dateKey: startStr ? toDateKey(startStr) : null,
        };
      })
      .filter(ev => ev.dateKey);
  } catch (err) {
    console.error('Google Calendar fetch error:', err);
    return [];
  }
}

export function groupEventsByDate(events) {
  if (!Array.isArray(events)) return {};
  const grouped = {};
  for (const ev of events) {
    if (!grouped[ev.dateKey]) grouped[ev.dateKey] = [];
    grouped[ev.dateKey].push(ev);
  }
  return grouped;
}
