import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import GridLine from './GridLine.js';
import PointsLine from './PointsLine.js';
import {
  getAppropriateWidth,
  computeMaxPointsIntervals,
  normalizeTimestamps,
  normalizePointsCoordinates,
  getPointsAtTime,
} from './helpers.js';

const normalizeMarkerCoordinates = (marker, width, height) => {
  if (!marker) {
    return;
  }

  marker.x = Math.max(0.05, Math.min(0.95, marker.x)) * width;
  marker.y = (1 - marker.y) * height;
};

const AssignmentDeadlinesGraph = ({
  firstDeadline,
  secondDeadline = null,
  maxPointsBeforeFirstDeadline,
  maxPointsBeforeSecondDeadline = 0,
  allowSecondDeadline = false,
  maxPointsDeadlineInterpolation = false,
  markerTime = null,
  markerPoints = null,
  color = '#448',
  markerColor = 'orange',
  gridLineColor = '#aaa',
  viewportWidth = null,
  viewportAspectRatio = 1 / 2,
}) => {
  const width =
    viewportWidth ||
    getAppropriateWidth({
      allowSecondDeadline,
      maxPointsDeadlineInterpolation,
      maxPointsBeforeFirstDeadline,
      maxPointsBeforeSecondDeadline,
    });
  const height = width * viewportAspectRatio;

  // normalize deadlines (as unix timestamps)
  firstDeadline = firstDeadline && moment.isMoment(firstDeadline) ? firstDeadline.unix() : firstDeadline;
  if (allowSecondDeadline) {
    secondDeadline = secondDeadline && moment.isMoment(secondDeadline) ? secondDeadline.unix() : secondDeadline;
  } else {
    secondDeadline = firstDeadline;
  }

  const maxPoints = Math.max(maxPointsBeforeFirstDeadline, allowSecondDeadline ? maxPointsBeforeSecondDeadline : 0);

  const marker = markerTime && {
    x: markerTime,
    y:
      markerPoints || // we compute the points if they are not provided
      getPointsAtTime(markerTime, {
        firstDeadline,
        secondDeadline,
        maxPointsBeforeFirstDeadline,
        maxPointsBeforeSecondDeadline,
        allowSecondDeadline,
        maxPointsDeadlineInterpolation,
      }),
  };

  const lines = computeMaxPointsIntervals({
    firstDeadline,
    secondDeadline,
    maxPointsBeforeFirstDeadline,
    maxPointsBeforeSecondDeadline,
    allowSecondDeadline,
    maxPointsDeadlineInterpolation,
  });
  const landmarksX = normalizeTimestamps(lines, firstDeadline, secondDeadline, marker);
  const landmarksY = normalizePointsCoordinates(lines, maxPoints, marker);

  normalizeMarkerCoordinates(marker, width, height);

  return (
    <svg viewBox={`-10 -10 ${width + 10} ${height + 25}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gridlineHorizontal">
          <stop offset="0%" stopColor={gridLineColor} stopOpacity={0} />
          <stop offset="3%" stopColor={gridLineColor} stopOpacity={1} />
          <stop offset="97%" stopColor={gridLineColor} stopOpacity={1} />
          <stop offset="100%" stopColor={gridLineColor} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="gridlineVertical" gradientTransform="rotate(90)">
          <stop offset="0%" stopColor={gridLineColor} stopOpacity={0} />
          <stop offset="3%" stopColor={gridLineColor} stopOpacity={1} />
          <stop offset="97%" stopColor={gridLineColor} stopOpacity={1} />
          <stop offset="100%" stopColor={gridLineColor} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="lineInGradient">
          <stop offset="0%" stopColor={color} stopOpacity={0} />
          <stop offset="100%" stopColor={color} stopOpacity={1} />
        </linearGradient>
        <linearGradient id="lineOutGradient">
          <stop offset="0%" stopColor={color} stopOpacity={1} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>

      {[...landmarksX, ...landmarksY].map(landmark => (
        <GridLine
          key={`grid-${landmark.x || '?'}-${landmark.y || '?'}`}
          {...landmark}
          width={width}
          height={height}
          markerColor={markerColor}
        />
      ))}

      {lines.map(line => (
        <PointsLine
          key={`line-${line.y}-${line.y2 !== undefined ? line.y2 : ''}`}
          {...line}
          width={width}
          height={height}
          color={color}
        />
      ))}

      {landmarksX
        .filter(({ caption }) => caption !== undefined)
        .map(landmark => (
          <React.Fragment key={`label-x-${landmark.x}`}>
            <text
              x={landmark.x * width}
              y={landmark.isMarker ? -10 : height + 7.5}
              fontSize="3"
              textAnchor="middle"
              dominantBaseline="hanging">
              {landmark.caption}
            </text>
            {landmark.caption2 && (
              <text
                x={landmark.x * width}
                y={landmark.isMarker ? -6.5 : height + 11}
                fontSize="2.75"
                textAnchor="middle"
                dominantBaseline="hanging">
                {landmark.caption2}
              </text>
            )}
          </React.Fragment>
        ))}
      {landmarksY
        .filter(({ caption }) => caption !== undefined)
        .map(landmark => (
          <text
            key={`label-y-${landmark.y}`}
            x="-2"
            y={(1 - landmark.y) * height}
            fontSize="3.5"
            textAnchor="end"
            dominantBaseline="middle">
            {landmark.caption}
          </text>
        ))}

      {marker && (
        <>
          <circle cx={marker.x} cy={marker.y} r="2.5" stroke={markerColor} fill="white" />
          <circle cx={marker.x} cy={marker.y} r="1.5" fill={markerColor} />
        </>
      )}
    </svg>
  );
};

AssignmentDeadlinesGraph.propTypes = {
  firstDeadline: PropTypes.oneOfType([PropTypes.object, PropTypes.number]).isRequired,
  secondDeadline: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  allowSecondDeadline: PropTypes.bool.isRequired,
  maxPointsBeforeFirstDeadline: PropTypes.number.isRequired,
  maxPointsBeforeSecondDeadline: PropTypes.number,
  maxPointsDeadlineInterpolation: PropTypes.bool,
  color: PropTypes.string,
  markerColor: PropTypes.string,
  gridLineColor: PropTypes.string,
  markerTime: PropTypes.number,
  markerPoints: PropTypes.number,
  viewportWidth: PropTypes.number,
  viewportAspectRatio: PropTypes.number,
};

export default AssignmentDeadlinesGraph;
