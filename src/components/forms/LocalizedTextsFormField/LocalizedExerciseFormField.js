import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';

import SharedLocalizedFields from './SharedLocalizedFields.js';
import SharedExerciseAssignmentLocalizedFields from './SharedExerciseAssignmentLocalizedFields.js';
import { MarkdownTextAreaField } from '../Fields';
import InsetPanel from '../../widgets/InsetPanel';

const LocalizedExerciseFormField = ({ prefix, data: enabled }) => (
  <InsetPanel>
    <SharedLocalizedFields prefix={prefix} enabled={enabled} />
    <SharedExerciseAssignmentLocalizedFields prefix={prefix} enabled={enabled} />

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
  </InsetPanel>
);

LocalizedExerciseFormField.propTypes = {
  prefix: PropTypes.string.isRequired,
  data: PropTypes.bool.isRequired,
};

export default LocalizedExerciseFormField;
