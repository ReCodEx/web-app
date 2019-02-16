import moment from 'moment';
import { defineMessages } from 'react-intl';
import isNumeric from 'validator/lib/isNumeric';

export const isPositiveInteger = n =>
  typeof n !== 'undefined' && (typeof n === 'number' || isNumeric(n)) && parseInt(n) > 0;

export const isNegativeInteger = n =>
  typeof n !== 'undefined' && (typeof n === 'number' || isNumeric(n)) && parseInt(n) < 0;

export const isNonNegativeInteger = n =>
  typeof n !== 'undefined' && (typeof n === 'number' || isNumeric(n)) && parseInt(n) >= 0;

/*
 * Deadline Validators
 */
export const deadlineFutureLimit = moment()
  .endOf('year')
  .add(1, 'year');

const messages = defineMessages({
  emptyDeadline: {
    id: 'app.deadlineValidation.emptyDeadline',
    defaultMessage: 'Please fill the date and time of the deadline.',
  },
  invalidDateTime: {
    id: 'app.deadlineValidation.invalidDateTime',
    defaultMessage: 'Invalid date or time format.',
  },
  deadlineInFarFuture: {
    id: 'app.deadlineValidation.deadlineInFarFuture',
    defaultMessage:
      'The deadline is too far in the future. At present, the furthest possible deadline is {deadlineFutureLimit, date} {deadlineFutureLimit, time, short}.',
  },
  secondDeadlineBeforeFirstDeadline: {
    id: 'app.deadlineValidation.secondDeadlineBeforeFirstDeadline',
    defaultMessage:
      'The second deadline is before the first deadline. Please set the second deadline after {firstDeadline, date} {firstDeadline, time, short}.',
  },
});

/**
 * A function to be used in redux form validation for a single deadline value.
 * @param errors Errors object where error messages will be stored.
 * @param deadline A deadline value to be tested.
 * @param deadlineErrorKey The key for errors object under which the error message will be stored (if any).
 */
export const validateDeadline = (
  errors,
  formatMessage,
  deadline,
  deadlineErrorKey = 'deadline',
  futureLimit = deadlineFutureLimit
) => {
  if (!deadline) {
    errors[deadlineErrorKey] = formatMessage(messages.emptyDeadline);
  } else if (!moment.isMoment(deadline)) {
    errors[deadlineErrorKey] = formatMessage(messages.invalidDateTime);
  } else if (futureLimit && futureLimit.isSameOrBefore(deadline)) {
    errors[deadlineErrorKey] = formatMessage(messages.deadlineInFarFuture, {
      futureLimit,
    });
  }
};

/**
 * A function to be used in redux form validation for two deadline values.
 * @param errors Errors object where error messages will be stored.
 * @param firstDeadline The first deadline value to be tested.
 * @param secondDeadline The second deadline value to be tested. If present, second deadline must be after the first deadline.
 * @param allowSecondDeadline Whether the second deadline is allowed (and tested).
 * @param firstDeadlineErrorKey The key for errors object under which the error message of the first deadline will be stored (if any).
 * @param secondDeadlineErrorKey The key for errors object under which the error message of the second deadline will be stored (if any).
 */
export const validateTwoDeadlines = (
  errors,
  formatMessage,
  firstDeadline,
  secondDeadline,
  allowSecondDeadline,
  firstDeadlineErrorKey = 'firstDeadline',
  secondDeadlineErrorKey = 'secondDeadline'
) => {
  validateDeadline(errors, formatMessage, firstDeadline, firstDeadlineErrorKey);

  if (allowSecondDeadline) {
    validateDeadline(errors, formatMessage, secondDeadline, secondDeadlineErrorKey);

    if (
      !errors[firstDeadlineErrorKey] &&
      !errors[secondDeadlineErrorKey] && // no errors so far
      !firstDeadline.isSameOrBefore(secondDeadline) &&
      !firstDeadline.isSameOrBefore(secondDeadline, 'hour')
    ) {
      errors[secondDeadlineErrorKey] = formatMessage(messages.secondDeadlineBeforeFirstDeadline, {
        firstDeadline,
      });
    }
  }
};
