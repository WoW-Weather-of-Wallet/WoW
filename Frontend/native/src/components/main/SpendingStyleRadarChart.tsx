import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';
import { COLORS, wp } from '../../constants/theme';
import type { SpendingStyleMetric } from '../../constants/main/types';

interface SpendingStyleRadarChartProps {
  metrics: SpendingStyleMetric[];
  size?: number;
}

const DEFAULT_SIZE = wp(164);
const GRID_LEVELS = 4;
const START_ANGLE = -Math.PI / 2;

function getPoints(count: number, radius: number, center: number) {
  return Array.from({ length: count }, (_, index) => {
    const angle = START_ANGLE + (Math.PI * 2 * index) / count;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  });
}

function toPointString(points: Array<{ x: number; y: number }>) {
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}

// 소비 스타일맵은 8개 축 데이터를 같은 규칙으로 그려서 범례 수치와 모양이 함께 변하도록 둡니다.
export default function SpendingStyleRadarChart({
  metrics,
  size = DEFAULT_SIZE,
}: SpendingStyleRadarChartProps) {
  const center = size / 2;
  const outerRadius = size * 0.36;
  const axisPoints = getPoints(metrics.length, outerRadius, center);

  const gridPolygons = Array.from({ length: GRID_LEVELS }, (_, index) => {
    const ratio = (index + 1) / GRID_LEVELS;
    return getPoints(metrics.length, outerRadius * ratio, center);
  });

  const dataPoints = metrics.map((metric, index) => {
    const ratio = Math.max(0, Math.min(metric.score, 100)) / 100;
    const basePoint = axisPoints[index];

    return {
      x: center + (basePoint.x - center) * ratio,
      y: center + (basePoint.y - center) * ratio,
      color: metric.color,
    };
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {gridPolygons.map((polygon, index) => (
          <Polygon
            key={`grid-${index}`}
            points={toPointString(polygon)}
            fill="none"
            stroke={index === GRID_LEVELS - 1 ? '#D7D4F7' : '#ECE9FB'}
            strokeWidth={1}
          />
        ))}

        {axisPoints.map((point, index) => (
          <Line
            key={`axis-${metrics[index].id}`}
            x1={center}
            y1={center}
            x2={point.x}
            y2={point.y}
            stroke="#E6E3FA"
            strokeWidth={1}
          />
        ))}

        <Polygon
          points={toPointString(dataPoints)}
          fill="#8C82F733"
          stroke={COLORS.primary}
          strokeWidth={3}
          strokeLinejoin="round"
        />

        {dataPoints.map((point, index) => (
          <React.Fragment key={`point-${metrics[index].id}`}>
            <Circle cx={point.x} cy={point.y} r={6.5} fill={`${metrics[index].color}22`} />
            <Circle cx={point.x} cy={point.y} r={3.5} fill={metrics[index].color} />
          </React.Fragment>
        ))}

        <Circle cx={center} cy={center} r={3} fill={COLORS.primary} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: DEFAULT_SIZE,
    height: DEFAULT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
