import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { Alert, Well } from 'react-bootstrap';

import SharedLocalizedFields from './SharedLocalizedFields';
import SharedExerciseAssignmentLocalizedFields from './SharedExerciseAssignmentLocalizedFields';
import { MarkdownTextAreaField } from '../Fields';
import { WarningIcon } from '../../icons';

const LocalizedAssigmentFormField = ({ prefix, data: enabled }) =>
  <Well>
    <Alert bsStyle="info">
      <WarningIcon gapRight />
      <FormattedMessage
        id="app.editAssignmentForm.localized.assignmentSyncInfo"
        defaultMessage="Please note that the localized texts are overwritten by actual data from the exercise when exercise update is invoked."
      />
    </Alert>

    <SharedLocalizedFields prefix={prefix} enabled={enabled} />
    <SharedExerciseAssignmentLocalizedFields
      prefix={prefix}
      enabled={enabled}
    />

    <Field
      name={`${prefix}.studentHint`}
      component={MarkdownTextAreaField}
      disabled={!enabled}
      label={
        <FormattedMessage
          id="app.editAssignmentForm.localized.studentHint"
          defaultMessage="A hint for students (not synchronized with exercise):"
        />
      }
    />
  </Well>;

LocalizedAssigmentFormField.propTypes = {
  prefix: PropTypes.string.isRequired,
  data: PropTypes.bool.isRequired
};

export default LocalizedAssigmentFormField;
