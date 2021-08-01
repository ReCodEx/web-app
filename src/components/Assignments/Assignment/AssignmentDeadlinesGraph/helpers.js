import React from 'react';
import { FormattedDate, FormattedTime } from 'react-intl';

// interpolation behavioral constants
const MAX_SEPARATE_LINES = 100; // max. amount of lines drawn separately in interpolation (if exceeded, individual lines are replaced with one skewed line)
const MAX_MARKED_LINES = 12; // max. amount of lines drawn with circle markers at ends (if exceedes, no markers are drawn)

/**
 * Compute optimal width for SVG viewport. The width is basically used to determine zoom of the graph.
 * @param {bool} allowSecondDeadline
 * @param {bool} maxPointsDeadlineInterpolation
 * @param {number} maxPointsBeforeFirstDeadline
 * @param {number} maxPointsBeforeSecondDeadline
 * @returns {number} viewport width roughly in range 100-300
 */
export const getAppropriateWidth = ({
  allowSecondDeadline,
  maxPointsDeadlineInterpolation,
  maxPointsBeforeFirstDeadline,
  maxPointsBeforeSecondDeadline,
}) => {
  if (!allowSecondDeadline) {
    return 100;
  }

  if (!maxPointsDeadlineInterpolation) {
    return 200;
  }

  const maxPoints = Math.floor(Math.max(maxPointsBeforeFirstDeadline, maxPointsBeforeSecondDeadline) / 10);
  return Math.min(200 + maxPoints * 10, 300);
};

/**
 * Compute line segments using points and timestamp coordinates for the graph.
 * @param {number} firstDeadline unix timestamp
 * @param {number} secondDeadline unix timestamp
 * @param {number} maxPointsBeforeFirstDeadline
 * @param {number|null} maxPointsBeforeSecondDeadline
 * @param {bool} allowSecondDeadline
 * @param {bool} maxPointsDeadlineInterpolation
 * @returns {Array} of line objects { x1, x2, y, [ y2, markers ]}, properties are matching PointsLine props
 */
export const computeMaxPointsIntervals = ({
  firstDeadline,
  secondDeadline,
  maxPointsBeforeFirstDeadline,
  maxPointsBeforeSecondDeadline = 0,
  allowSecondDeadline = false,
  maxPointsDeadlineInterpolation = false,
}) => {
  const lines = [{ x1: null, x2: firstDeadline, y: maxPointsBeforeFirstDeadline }];
  let lastX = firstDeadline;

  if (allowSecondDeadline && maxPointsBeforeFirstDeadline !== maxPointsBeforeSecondDeadline) {
    if (maxPointsDeadlineInterpolation) {
      const pointsDiff = Math.abs(maxPointsBeforeFirstDeadline - maxPointsBeforeSecondDeadline);
      if (pointsDiff <= MAX_SEPARATE_LINES) {
        const tsDelta = (secondDeadline - firstDeadline) / pointsDiff;
        const pointsDelta = Math.sign(maxPointsBeforeSecondDeadline - maxPointsBeforeFirstDeadline);

        let ts = firstDeadline;
        let points = maxPointsBeforeFirstDeadline;
        while (points !== maxPointsBeforeSecondDeadline && ts < secondDeadline) {
          points += pointsDelta;
          ts += tsDelta;
          const x2 = Math.round(ts);
          lines.push({ x1: lastX, x2, y: points, markers: pointsDiff <= MAX_MARKED_LINES });
          lastX = x2;
        }
      } else {
        // there are too many steps to visualize, let's approximate with one skewed line
        lines.push({
          x1: lastX,
          x2: secondDeadline,
          y: maxPointsBeforeFirstDeadline,
          y2: maxPointsBeforeSecondDeadline,
        });
      }
    } else {
      // simple two deadline setup (no interpolations)
      lines.push({ x1: lastX, x2: secondDeadline, y: maxPointsBeforeSecondDeadline });
    }
    lastX = secondDeadline;
  }

  lines.push({ x1: lastX, x2: null, y: 0 }); // last line indicating zero points after all deadlines

  return lines;
};

/**
 * Normalize x values (timestamps) of the lines segments and yield landmarks array for the grid.
 * @param {Array} lines produced by computeMaxPointsIntervals
 * @param {number} firstDeadline unix timestamp
 * @param {number} secondDeadline unix timestamp
 * @param {object|null} marker x coordinate is unix timestamp of current time marker (if present)
 * @returns {Array} of objects for the grid landmarks
 */
export const normalizeTimestamps = (lines, firstDeadline, secondDeadline, marker = null) => {
  const timestampsSet = new Set(); // all point values are recorded in set to remove duplicites
  const margin = Math.max((secondDeadline - firstDeadline) / Math.min(lines.length, 6), 1);
  const fromTs = firstDeadline - margin;
  const tsSpan = secondDeadline + margin - fromTs;

  lines.forEach(line => {
    if (line.markers !== false) {
      line.x1 && timestampsSet.add(line.x1);
      line.x2 && timestampsSet.add(line.x2);
    }

    line.x1 = line.x1 && (line.x1 - fromTs) / tsSpan;
    line.x2 = line.x2 && (line.x2 - fromTs) / tsSpan;
  });

  if (marker !== null && marker.x !== undefined) {
    marker.originalX = marker.x;
    marker.x = Math.max(fromTs + tsSpan / 20, Math.min(fromTs + (tsSpan * 19) / 20, marker.x));
    timestampsSet.add(marker.x); // make sure the marker grid line is always there
  }

  const landmarks = [];
  timestampsSet.forEach(x => {
    const isMarker = marker !== null && x === marker.x;
    const captionTs = (isMarker ? marker.originalX : x) * 1000;
    landmarks.push({
      x: (x - fromTs) / tsSpan,
      caption: <FormattedDate value={captionTs} />,
      caption2: <FormattedTime value={captionTs} format="24hour" />,
      isMarker,
    });
  });

  if (marker !== null && marker.x !== undefined) {
    marker.x = (marker.x - fromTs) / tsSpan;
  }

  return landmarks;
};

/**
 * Normalize y (points) values of the lines segments and yield landmarks array for the grid.
 * @param {Array} lines produced by computeMaxPointsIntervals
 * @param {number} maxPoints maximal value on the points scale
 * @param {object|null} marker y coordinate is points value (if present)
 * @returns {Array} of objects for the grid landmarks
 */
export const normalizePointsCoordinates = (lines, maxPoints, marker = null) => {
  const pointsSet = new Set(); // all point values are recorded in set to remove duplicites

  lines.forEach(line => {
    if (line.markers !== false) {
      pointsSet.add(line.y);
      line.y2 !== undefined && pointsSet.add(line.y2);
    }
    line.y /= maxPoints;
    if (line.y2 !== undefined) {
      line.y2 /= maxPoints;
    }
  });

  if (marker !== null && marker.y !== undefined) {
    pointsSet.add(marker.y); // make sure the marker grid line is always there
  }

  const landmarks = [];
  pointsSet.forEach(y => landmarks.push({ y: y / maxPoints, caption: y, isMarker: marker !== null && y === marker.y }));

  if (marker !== null && marker.x !== undefined) {
    marker.y = marker.y / maxPoints;
  }
  return landmarks;
};

/**
 * This is actually a copy of the algorithm that determines the max points for submitted solution in core API module.
 * @param {number} time unix timestamp of requested time
 * @param {object} with assignments properties related to deadlines and points
 * @returns the points limit that is valid at given time
 */
export const getPointsAtTime = (
  time,
  {
    firstDeadline,
    secondDeadline,
    maxPointsBeforeFirstDeadline,
    maxPointsBeforeSecondDeadline = 0,
    allowSecondDeadline = false,
    maxPointsDeadlineInterpolation = false,
  }
) => {
  if (time < firstDeadline) {
    return maxPointsBeforeFirstDeadline;
  }

  if (allowSecondDeadline && time < secondDeadline) {
    if (maxPointsDeadlineInterpolation) {
      const deltaPoints = maxPointsBeforeFirstDeadline - maxPointsBeforeSecondDeadline;
      const sign = Math.sign(deltaPoints);

      // linear interpolation: how many points are subtracted from first max at $ts time
      const sub = sign * Math.ceil(((time - firstDeadline) * Math.abs(deltaPoints)) / (secondDeadline - firstDeadline));
      return maxPointsBeforeFirstDeadline - sub;
    } else {
      return maxPointsBeforeSecondDeadline;
    }
  }

  return 0;
};
