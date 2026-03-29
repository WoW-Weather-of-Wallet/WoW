import type { SpendingStyleMetric } from '../constants/main/types';

type RadarPoint = {
  x: number;
  y: number;
};

const GRID_LEVELS = 4;
const START_ANGLE = -Math.PI / 2;
const TARGET_MAX_RATIO = 0.74;
const MAX_SCALE_FACTOR = 1.75;
const MAX_VISIBLE_RATIO = 0.86;

export const getRadarPoints = (
  count: number,
  radius: number,
  center: number,
): RadarPoint[] =>
  Array.from({ length: count }, (_, index) => {
    const angle = START_ANGLE + (Math.PI * 2 * index) / count;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  });

export const toSvgPointString = (points: RadarPoint[]) =>
  points.map(point => `${point.x},${point.y}`).join(' ');

export const buildRadarChartGeometry = (
  metrics: SpendingStyleMetric[],
  size: number,
) => {
  const center = size / 2;
  const outerRadius = size * 0.36;
  const axisPoints = getRadarPoints(metrics.length, outerRadius, center);
  const maxScore = metrics.reduce(
    (highest, metric) => Math.max(highest, Math.max(0, Math.min(metric.score, 100))),
    0,
  );
  const maxAbsoluteRatio = maxScore / 100;
  const scaleFactor = maxAbsoluteRatio > 0
    ? Math.min(MAX_SCALE_FACTOR, Math.max(1, TARGET_MAX_RATIO / maxAbsoluteRatio))
    : 1;

  const gridPolygons = Array.from({ length: GRID_LEVELS }, (_, index) => {
    const ratio = (index + 1) / GRID_LEVELS;
    return getRadarPoints(metrics.length, outerRadius * ratio, center);
  });

  const dataPoints = metrics.map((metric, index) => {
    const clampedScore = Math.max(0, Math.min(metric.score, 100));
    const absoluteRatio = clampedScore / 100;
    const scaledRatio = Math.min(MAX_VISIBLE_RATIO, absoluteRatio * scaleFactor);
    const basePoint = axisPoints[index];

    return {
      x: center + (basePoint.x - center) * scaledRatio,
      y: center + (basePoint.y - center) * scaledRatio,
      color: metric.color,
    };
  });

  return {
    center,
    axisPoints,
    gridPolygons,
    dataPoints,
    gridLevels: GRID_LEVELS,
  };
};
