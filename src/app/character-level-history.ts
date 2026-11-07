import { CharacterLevelHistoryEntry } from './models/player.model';

export const LEVEL_GAIN_WINDOW_DAYS = 7;

const DAY_MS = 86_400_000;

export interface LevelHistoryRange {
    days: number;
    label: string;
    summary: string;
}

export const LEVEL_HISTORY_RANGES: readonly LevelHistoryRange[] = [
    { days: LEVEL_GAIN_WINDOW_DAYS, label: '7 dagar', summary: 'senaste 7 dagarna' },
    { days: 30, label: '30 dagar', summary: 'senaste 30 dagarna' },
    { days: Number.POSITIVE_INFINITY, label: 'Full', summary: 'totalt' }
];

export interface LevelChartPoint {
    x: number;
    y: number;
    level: number;
    recordedAt: string;
}

export interface LevelChart {
    width: number;
    height: number;
    plot: { left: number; right: number; top: number; bottom: number };
    path: string;
    points: LevelChartPoint[];
    yTicks: { y: number; label: string }[];
    xLabels: { x: number; label: string }[];
}

function sortByRecordedAt(history: CharacterLevelHistoryEntry[]): CharacterLevelHistoryEntry[] {
    return [...history].sort((a, b) => Date.parse(a.recordedAt) - Date.parse(b.recordedAt) || a.id - b.id);
}

/**
 * Levels gained since the window start. The baseline is the last entry at or before the
 * window start, or the first known entry if history begins inside the window.
 */
export function getLevelGainSince(
    history: CharacterLevelHistoryEntry[],
    days = LEVEL_GAIN_WINDOW_DAYS,
    now = Date.now()
): number {
    if (history.length === 0) {
        return 0;
    }

    const sorted = sortByRecordedAt(history);
    const windowStart = now - days * DAY_MS;
    const latest = sorted[sorted.length - 1];
    const baseline = [...sorted].reverse().find(entry => Date.parse(entry.recordedAt) <= windowStart) ?? sorted[0];

    return Math.max(0, latest.level - baseline.level);
}

/**
 * Entries shown for a range. Keeps the baseline entry at or before the window start so the
 * line begins at the level the character had when the window opened.
 */
export function selectLevelHistoryRange(
    history: CharacterLevelHistoryEntry[],
    days: number,
    now = Date.now()
): CharacterLevelHistoryEntry[] {
    const sorted = sortByRecordedAt(history);
    if (!Number.isFinite(days)) {
        return sorted;
    }

    const windowStart = now - days * DAY_MS;
    const baselineIndex = sorted.reduce((found, entry, index) => Date.parse(entry.recordedAt) <= windowStart ? index : found, -1);
    return sorted.slice(Math.max(baselineIndex, 0));
}

export function buildLevelChart(
    history: CharacterLevelHistoryEntry[],
    width = 640,
    height = 320
): LevelChart | null {
    if (history.length === 0) {
        return null;
    }

    const margin = { top: 16, right: 24, bottom: 44, left: 52 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const sorted = sortByRecordedAt(history);
    const times = sorted.map(entry => Date.parse(entry.recordedAt));
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const levels = sorted.map(entry => entry.level);
    const minLevel = Math.min(...levels) === Math.max(...levels) ? Math.min(...levels) - 1 : Math.min(...levels);
    const maxLevel = Math.max(...levels) === Math.min(...levels) ? Math.max(...levels) + 1 : Math.max(...levels);

    const xFor = (time: number) => maxTime === minTime
        ? margin.left + plotWidth / 2
        : margin.left + ((time - minTime) / (maxTime - minTime)) * plotWidth;
    const yFor = (level: number) => margin.top + (1 - (level - minLevel) / (maxLevel - minLevel)) * plotHeight;

    const points = sorted.map((entry, index) => ({
        x: xFor(times[index]),
        y: yFor(entry.level),
        level: entry.level,
        recordedAt: entry.recordedAt
    }));

    const path = points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
        .join(' ');

    const midLevel = Math.round((minLevel + maxLevel) / 2);
    const yTicks = [maxLevel, midLevel, minLevel].map(level => ({ y: yFor(level), label: String(level) }));

    const formatDate = (recordedAt: string) => new Date(recordedAt).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
    const xLabels = points.length === 1
        ? [{ x: points[0].x, label: formatDate(points[0].recordedAt) }]
        : [
            { x: points[0].x, label: formatDate(points[0].recordedAt) },
            { x: points[points.length - 1].x, label: formatDate(points[points.length - 1].recordedAt) }
        ];

    return {
        width,
        height,
        plot: {
            left: margin.left,
            right: width - margin.right,
            top: margin.top,
            bottom: height - margin.bottom
        },
        path,
        points,
        yTicks,
        xLabels
    };
}
