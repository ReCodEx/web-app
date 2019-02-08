import React from 'react';
import { FormattedMessage } from 'react-intl';

export const SIMPLE_CONFIG_TYPE = 'simpleExerciseConfig';
export const ADVANCED_CONFIG_TYPE = 'advancedExerciseConfig';

export const isSimple = exercise =>
  exercise && exercise.configurationType === SIMPLE_CONFIG_TYPE;

export const SUBMIT_BUTTON_MESSAGES = {
  submit: (
    <FormattedMessage
      id="app.editExerciseConfig.submit"
      defaultMessage="Save Configuration"
    />
  ),
  submitting: (
    <FormattedMessage
      id="app.editExerciseConfig.submitting"
      defaultMessage="Saving Configuration..."
    />
  ),
  success: (
    <FormattedMessage
      id="app.editExerciseConfig.success"
      defaultMessage="Configuration Saved."
    />
  ),
  validating: (
    <FormattedMessage id="generic.validating" defaultMessage="Validating..." />
  ),
};
