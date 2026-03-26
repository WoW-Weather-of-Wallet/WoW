import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';

import type { SpendingStyleMetric } from '../../constants/main/types';
import { COLORS, wp } from '../../constants/theme';
import {
  buildRadarChartGeometry,
  toSvgPointString,
} from '../../utils/spendingStyleRadar';

interface SpendingStyleRadarChartProps {
  metrics: SpendingStyleMetric[];
  size?: number;
}

const DEFAULT_SIZE = wp(164);

export default function SpendingStyleRadarChart({
  metrics,
  size = DEFAULT_SIZE,
}: SpendingStyleRadarChartProps) {
  const { center, axisPoints, gridPolygons, dataPoints, gridLevels } =
    buildRadarChartGeometry(metrics, size);

  return (
    <View
      className="items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Svg width={size} height={size}>
        {gridPolygons.map((polygon, index) => (
          <Polygon
            key={`grid-${index}`}
            points={toSvgPointString(polygon)}
            fill="none"
            stroke={index === gridLevels - 1 ? COLORS.radarGridOuter : COLORS.radarGridInner}
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
            stroke={COLORS.radarAxis}
            strokeWidth={1}
          />
        ))}

        <Polygon
          points={toSvgPointString(dataPoints)}
          fill={COLORS.radarFill}
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
