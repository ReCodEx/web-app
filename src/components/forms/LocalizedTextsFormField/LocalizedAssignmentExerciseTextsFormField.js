import React from 'react';
import PropTypes from 'prop-types';

import SharedLocalizedFields from './SharedLocalizedFields.js';
import SharedExerciseAssignmentLocalizedFields from './SharedExerciseAssignmentLocalizedFields.js';
import InsetPanel from '../../widgets/InsetPanel';

const LocalizedAssignmentExerciseTextsFormField = ({
  prefix,
  data: enabled,
  previewPreprocessor,
  ignoreDirty = false,
}) => (
  <InsetPanel>
    <SharedLocalizedFields prefix={prefix} enabled={enabled} ignoreDirty={ignoreDirty} />
    <SharedExerciseAssignmentLocalizedFields
      prefix={prefix}
      enabled={enabled}
      previewPreprocessor={previewPreprocessor}
    />
  </InsetPanel>
);

LocalizedAssignmentExerciseTextsFormField.propTypes = {
  prefix: PropTypes.string.isRequired,
  data: PropTypes.bool.isRequired,
  ignoreDirty: PropTypes.bool,
  previewPreprocessor: PropTypes.func,
};

export default LocalizedAssignmentExerciseTextsFormField;
