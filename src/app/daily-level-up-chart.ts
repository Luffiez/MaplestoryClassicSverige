import { DailyLevelUp } from './models/player.model';

export interface DailyBar {
    x: number;
    y: number;
    width: number;
    height: number;
    value: number;
    date: string;
    label: string;
    showLabel: boolean;
}

export interface DailyBarChart {
    width: number;
    height: number;
    max: number;
    bars: DailyBar[];
    plotLeft: number;
    plotRight: number;
    plotTop: number;
    plotBottom: number;
}

const margin = { top: 12, right: 12, bottom: 28, left: 40 };
const maxLabels = 7;

export function buildDailyBarChart(
    days: DailyLevelUp[],
    valueOf: (day: DailyLevelUp) => number,
    width = 640,
    height = 200
): DailyBarChart {
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const max = Math.max(1, Math.ceil(Math.max(0, ...days.map(valueOf))));
    const slot = days.length > 0 ? plotWidth / days.length : 0;
    const barWidth = Math.max(1, slot * 0.7);
    const labelStep = Math.max(1, Math.ceil(days.length / maxLabels));

    const bars = days.map((day, index): DailyBar => {
        const value = valueOf(day);
        const barHeight = (value / max) * plotHeight;
        return {
            x: margin.left + index * slot + (slot - barWidth) / 2,
            y: margin.top + plotHeight - barHeight,
            width: barWidth,
            height: barHeight,
            value,
            date: day.date,
            label: day.date.slice(5),
            showLabel: index % labelStep === 0
        };
    });

    return {
        width,
        height,
        max,
        bars,
        plotLeft: margin.left,
        plotRight: width - margin.right,
        plotTop: margin.top,
        plotBottom: margin.top + plotHeight
    };
}
