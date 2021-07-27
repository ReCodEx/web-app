import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import GridLine from './GridLine';
import PointsLine from './PointsLine';
import {
  getAppropriateWidth,
  computeMaxPointsIntervals,
  normalizeTimestamps,
  normalizePointsCoordinates,
} from './helpers.js';

const AssignmentDeadlinesGraph = ({
  firstDeadline,
  secondDeadline = null,
  maxPointsBeforeFirstDeadline,
  maxPointsBeforeSecondDeadline = 0,
  allowSecondDeadline = false,
  maxPointsDeadlineInterpolation = false,
  color = '#448',
  markerColor = 'orange',
  gridLineColor = '#aaa',
}) => {
  const width = getAppropriateWidth({
    allowSecondDeadline,
    maxPointsDeadlineInterpolation,
    maxPointsBeforeFirstDeadline,
    maxPointsBeforeSecondDeadline,
  });
  const height = width / 2;
  //  const margin = height / 100;

  // normalize deadlines (as unix timestamps)
  firstDeadline = firstDeadline && moment.isMoment(firstDeadline) ? firstDeadline.unix() : firstDeadline;
  if (allowSecondDeadline) {
    secondDeadline = secondDeadline && moment.isMoment(secondDeadline) ? secondDeadline.unix() : secondDeadline;
  } else {
    secondDeadline = firstDeadline;
  }

  const maxPoints = Math.max(maxPointsBeforeFirstDeadline, allowSecondDeadline ? maxPointsBeforeSecondDeadline : 0);

  const lines = computeMaxPointsIntervals({
    firstDeadline,
    secondDeadline,
    maxPointsBeforeFirstDeadline,
    maxPointsBeforeSecondDeadline,
    allowSecondDeadline,
    maxPointsDeadlineInterpolation,
  });
  const landmarksX = normalizeTimestamps(lines, firstDeadline, secondDeadline); // todo marker
  const landmarksY = normalizePointsCoordinates(lines, maxPoints); // todo marker

  return (
    <svg viewBox={`-10 -10 ${width + 10} ${height + 25}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gridlineHorizontal">
          <stop offset="0%" stopColor={gridLineColor} stopOpacity={0} />
          <stop offset="5%" stopColor={gridLineColor} stopOpacity={1} />
          <stop offset="90%" stopColor={gridLineColor} stopOpacity={1} />
          <stop offset="98%" stopColor={gridLineColor} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="gridlineVertical" gradientTransform="rotate(90)">
          <stop offset="0%" stopColor={gridLineColor} stopOpacity={0} />
          <stop offset="5%" stopColor={gridLineColor} stopOpacity={1} />
          <stop offset="90%" stopColor={gridLineColor} stopOpacity={1} />
          <stop offset="98%" stopColor={gridLineColor} stopOpacity={0} />
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
        <GridLine key={`grid-${landmark.x || '?'}-${landmark.y || '?'}`} {...landmark} width={width} height={height} />
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
            <text x={landmark.x * width} y={height + 7} fontSize="3" textAnchor="middle" dominantBaseline="hanging">
              {landmark.caption}
            </text>
            {landmark.caption2 && (
              <text x={landmark.x * width} y={height + 11} fontSize="3" textAnchor="middle" dominantBaseline="hanging">
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
            fontSize="3"
            textAnchor="end"
            dominantBaseline="middle">
            {landmark.caption}
          </text>
        ))}
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
};

export default AssignmentDeadlinesGraph;
