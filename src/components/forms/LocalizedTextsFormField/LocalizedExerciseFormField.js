import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { Well } from 'react-bootstrap';

import SharedLocalizedFields from './SharedLocalizedFields';
import SharedExerciseAssignmentLocalizedFields from './SharedExerciseAssignmentLocalizedFields';
import { MarkdownTextAreaField } from '../Fields';

const LocalizedExerciseFormField = ({ prefix, data: enabled }) => (
  <Well>
    <SharedLocalizedFields prefix={prefix} enabled={enabled} />
    <SharedExerciseAssignmentLocalizedFields
      prefix={prefix}
      enabled={enabled}
    />

    <Field
      name={`${prefix}.description`}
      component={MarkdownTextAreaField}
      disabled={!enabled}
      label={
        <FormattedMessage
          id="app.editAssignmentForm.localized.description"
          defaultMessage="Short description (visible only to supervisors):"
        />
      }
    />
  </Well>
);

LocalizedExerciseFormField.propTypes = {
  prefix: PropTypes.string.isRequired,
  data: PropTypes.bool.isRequired,
};

export default LocalizedExerciseFormField;
