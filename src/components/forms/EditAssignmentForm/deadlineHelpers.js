import moment from 'moment';

/**
 * Verify that deadline and point inputs are vaild.
 */
export const deadlinesAndPontsAreValid = ({
  firstDeadline,
  secondDeadline,
  maxPointsBeforeFirstDeadline,
  maxPointsBeforeSecondDeadline,
  deadlines,
}) =>
  moment.isMoment(firstDeadline) &&
  Number.isInteger(maxPointsBeforeFirstDeadline) &&
  (deadlines === 'single' ||
    (moment.isMoment(secondDeadline) &&
      firstDeadline.isBefore(secondDeadline, 'minute') &&
      Number.isInteger(maxPointsBeforeSecondDeadline) &&
      maxPointsBeforeFirstDeadline !== maxPointsBeforeSecondDeadline));

/**
 * Convert text input value into points (non-numeric characters are ignored).
 * @param {string} value from the text input
 * @param {number} maxPoints maximal allowed points
 * @returns {number} sanitized numeric representation of points
 */
export const sanitizePointsInput = (value, maxPoints) => {
  const intValue = Number.parseInt(value.replace(/[^0-9]+/g, ''));
  return Number.isNaN(intValue) ? 0 : Math.max(0, Math.min(intValue, maxPoints));
};

/**
 * Parse interval input string and return the interval as number.
 * @param {string} value input text in format d h:mm (d is optional)
 * @returns {number} seconds
 */
export const parseIntervalStr = value => {
  const matchRes = value.trim().match(/^(?<days>[0-9]+\s+)?(?<hours>[0-9]{1,2}):(?<minutes>[0-9]{2})$/);
  if (!matchRes) {
    return null;
  }

  const minutes = parseInt(matchRes.groups.minutes);
  const hours = parseInt(matchRes.groups.hours);
  const days = matchRes.groups.days ? parseInt(matchRes.groups.days) : 0;
  if (Number.isNaN(days) || Number.isNaN(hours) || Number.isNaN(minutes) || hours > 23 || minutes > 59) {
    return null;
  }

  return ((days * 24 + hours) * 60 + minutes) * 60; // in seconds
};

/**
 * Convert number of seconds into text representation of interval.
 * @param {number} seconds input value ceiled to nearest minute
 * @returns {string} with textual representation of interval
 */
export const formatIntervalStr = seconds => {
  let minutes = Math.ceil(Math.abs(seconds) / 60);

  let hours = Math.floor(minutes / 60);
  minutes -= hours * 60;

  const days = Math.floor(hours / 24);
  hours -= days * 24;

  return (days > 0 ? days + ' ' : '') + hours + ':' + minutes.toString().padStart(2, '0');
};

/**
 * Compute new second deadline base on selected interval, first deadline, and points associated with both deadlines.
 * @param {Object} firstDeadline moment representation of first deadline
 * @param {number} maxPointsBeforeFirstDeadline
 * @param {number} interval in seconds
 * @param {number} maxPointsBeforeSecondDeadline
 * @returns {number} extrapolated second deadline as unix ts
 */
export const extrapolateSecondDeadline = (
  firstDeadline,
  maxPointsBeforeFirstDeadline,
  interval,
  maxPointsBeforeSecondDeadline
) => {
  return firstDeadline.unix() + interval * Math.abs(maxPointsBeforeFirstDeadline - maxPointsBeforeSecondDeadline);
};
