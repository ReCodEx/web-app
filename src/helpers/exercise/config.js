import React from 'react';
import { FormattedMessage } from 'react-intl';

export const SIMPLE_CONFIG_TYPE = 'simpleExerciseConfig';
export const ADVANCED_CONFIG_TYPE = 'advancedExerciseConfig';

export const isSimple = exercise => exercise && exercise.configurationType === SIMPLE_CONFIG_TYPE;

export const SUBMIT_BUTTON_MESSAGES = {
  submit: <FormattedMessage id="app.editExerciseConfig.submit" defaultMessage="Save Configuration" />,
  submitting: <FormattedMessage id="app.editExerciseConfig.submitting" defaultMessage="Saving Configuration..." />,
  success: <FormattedMessage id="app.editExerciseConfig.success" defaultMessage="Configuration Saved." />,
  validating: <FormattedMessage id="generic.validating" defaultMessage="Validating..." />,
};

/*
 * Exit codes config handling
 */
const _validateExitCodes = value =>
  value &&
  value.match(/^\s*[0-9]{0,3}(-[0-9]{0,3})?(\s*,\s*[0-9]{0,3}(-[0-9]{0,3})?)*\s*$/) !== null &&
  value.split(/[-,]/).every(val => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 0 && num <= 255;
  });

export const validateExitCodes = value =>
  !_validateExitCodes(value) ? (
    <FormattedMessage
      id="app.editExerciseConfigForm.validation.successExitCodes"
      defaultMessage="Exit codes must be numerical values (in 0-255 range) or value intervals (written as 'from-to') separated by commas (e.g., '1, 3, 5-7')."
    />
  ) : undefined;

const _addToBitmap = (bitmap, from, to = from) => {
  if (to < from) {
    const tmp = from;
    from = to;
    to = tmp;
  }

  while (bitmap.length < from) {
    bitmap.push(false);
  }

  while (from <= to) {
    if (bitmap.length > from) {
      bitmap[from] = true;
    } else {
      bitmap.push(true);
    }
    ++from;
  }
};

/**
 * Convert exit codes in a string into a bitmap (array, where valid codes are true, invalid false).
 * @param {string} str comma separated list of values and intervals
 * @returns {Array}
 */
export const exitCodesStrToBitmap = str => {
  const res = [];
  if (_validateExitCodes(str)) {
    str
      .split(',')
      .map(val => val.trim())
      .forEach(val => {
        _addToBitmap(res, ...val.split('-')); // split will produce either one or two values
      });
  }
  return res;
};

/**
 * Convert exit codes bitmap into normalized array of tokens (each token is either a value or an interval)
 * @param {Array} bitmap
 * @returns {Array}
 */
export const exitCodesBitmapToTokens = bitmap => {
  const tokens = [];
  let i = 0;
  while (i < bitmap.length) {
    while (i < bitmap.length && !bitmap[i]) ++i;
    if (i < bitmap.length) {
      const from = i;
      while (i < bitmap.length && bitmap[i]) ++i;
      const to = i - 1;
      tokens.push(from === to ? from : `${from}-${to}`);
    }
  }
  return tokens;
};

/**
 * Convert exit codes bitmap into normalized string.
 * @param {Array} bitmap
 * @returns {string} comma separated list of values and intervals
 */
export const exitCodesBitmapToStr = bitmap => exitCodesBitmapToTokens(bitmap).join(', ');
