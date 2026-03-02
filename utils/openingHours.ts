type OHInterval = { start: string; end: string };
type OHRules = { days: number[]; intervals: OHInterval[] }[];

const DAY_MAP: Record<string, number> = {
  Su: 0,
  Mo: 1,
  Tu: 2,
  We: 3,
  Th: 4,
  Fr: 5,
  Sa: 6,
};

const FRENCH_DAYS = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

function parseDayToken(token: string): number[] {
  token = token.trim();
  const parts = token
    .split(/,|;/)
    .map((t) => t.trim())
    .filter(Boolean);
  const days: number[] = [];
  for (const p of parts) {
    if (p.includes("-")) {
      const [a, b] = p.split("-").map((s) => s.trim().slice(0, 2));
      const start = DAY_MAP[a as keyof typeof DAY_MAP];
      const end = DAY_MAP[b as keyof typeof DAY_MAP];
      if (start === undefined || end === undefined) continue;
      let cur = start;
      while (true) {
        days.push(cur);
        if (cur === end) break;
        cur = (cur + 1) % 7;
      }
    } else {
      const key = p.slice(0, 2);
      const d = DAY_MAP[key as keyof typeof DAY_MAP];
      if (d !== undefined) days.push(d);
    }
  }
  return Array.from(new Set(days)).sort((a, b) => a - b);
}

export function parseOpeningHours(str: string | null): OHRules {
  if (!str) return [];
  const rules: OHRules = [];
  const segments = str
    .split(/;|\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const seg of segments) {
    const m = seg.match(/^([^0-9]+)\s+(.+)$/);
    if (!m) continue;
    const dayPart = m[1].trim();
    const timesPart = m[2].trim();
    const days = parseDayToken(dayPart);
    const intervals: OHInterval[] = [];
    for (const tPart of timesPart.split(",")) {
      const tm = tPart.trim().match(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/);
      if (!tm) continue;
      let [, start, end] = tm;
      if (end === "24:00") end = "23:59";
      intervals.push({ start, end });
    }
    if (days.length && intervals.length) rules.push({ days, intervals });
  }
  return rules;
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutesToDateToday(mins: number, ref: Date) {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(mins);
  return d;
}

export function computeOpeningStatus(str: string | null, now = new Date()) {
  const rules = parseOpeningHours(str);
  const today = now.getDay();
  const nowM = now.getHours() * 60 + now.getMinutes();

  const todaysIntervals: OHInterval[] = [];
  for (const r of rules) {
    if (r.days.includes(today)) todaysIntervals.push(...r.intervals);
  }

  for (const iv of todaysIntervals) {
    const s = timeToMinutes(iv.start);
    const e = timeToMinutes(iv.end);
    if (nowM >= s && nowM <= e) {
      const next = minutesToDateToday(e, now);
      const mins = Math.round((next.getTime() - now.getTime()) / 60000);
      return {
        isOpen: true,
        nextChange: next,
        minutesToChange: mins,
        rules,
      };
    }
  }

  let nextStart: Date | null = null;
  let minutesToNext: number | null = null;
  for (const iv of todaysIntervals) {
    const s = timeToMinutes(iv.start);
    if (s > nowM) {
      const d = minutesToDateToday(s, now);
      const mins = Math.round((d.getTime() - now.getTime()) / 60000);
      if (minutesToNext === null || mins < minutesToNext) {
        minutesToNext = mins;
        nextStart = d;
      }
    }
  }

  if (!nextStart) {
    for (let offset = 1; offset <= 7; offset++) {
      const day = (today + offset) % 7;
      const dayRules = rules.filter((r) => r.days.includes(day));
      if (dayRules.length) {
        const iv = dayRules[0].intervals[0];
        const s = timeToMinutes(iv.start);
        const d = new Date(now);
        d.setDate(now.getDate() + offset);
        d.setHours(0, 0, 0, 0);
        d.setMinutes(s);
        nextStart = d;
        minutesToNext = Math.round((d.getTime() - now.getTime()) / 60000);
        break;
      }
    }
  }

  return {
    isOpen: false,
    nextChange: nextStart,
    minutesToChange: minutesToNext,
    rules,
  };
}

export function formatTimeForDisplay(d: Date) {
  const hh = `${d.getHours()}`.padStart(2, "0");
  const mm = `${d.getMinutes()}`.padStart(2, "0");
  return `${hh}:${mm}`;
}

export function formatDayLines(rules: OHRules) {
  const lines: string[] = [];
  for (let day = 0; day < 7; day++) {
    const dayRules = rules.filter((r) => r.days.includes(day));
    if (!dayRules.length) {
      lines.push(`${FRENCH_DAYS[day]}: Fermé`);
      continue;
    }
    const parts: string[] = [];
    for (const r of dayRules) {
      for (const iv of r.intervals) parts.push(`${iv.start}-${iv.end}`);
    }
    lines.push(`${FRENCH_DAYS[day]}: ${parts.join(", ")}`);
  }
  return lines;
}
