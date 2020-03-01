import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { Well } from 'react-bootstrap';

import SharedLocalizedFields from './SharedLocalizedFields';
import SharedExerciseAssignmentLocalizedFields from './SharedExerciseAssignmentLocalizedFields';
import { MarkdownTextAreaField } from '../Fields';

const LocalizedAssignmentFormField = ({ prefix, data: enabled }) => (
  <Well>
    <SharedLocalizedFields prefix={prefix} enabled={enabled} />
    <SharedExerciseAssignmentLocalizedFields prefix={prefix} enabled={enabled} />

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
  </Well>
);

LocalizedAssignmentFormField.propTypes = {
  prefix: PropTypes.string.isRequired,
  data: PropTypes.bool.isRequired,
};

export default LocalizedAssignmentFormField;
