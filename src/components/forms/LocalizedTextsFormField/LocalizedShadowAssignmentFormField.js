import React from 'react';
import PropTypes from 'prop-types';
import { Well } from 'react-bootstrap';

import SharedLocalizedFields from './SharedLocalizedFields';
import SharedExerciseAssignmentLocalizedFields from './SharedExerciseAssignmentLocalizedFields';

const LocalizedShadowAssigmentFormField = ({ prefix, data: enabled }) => (
  <Well>
    <SharedLocalizedFields prefix={prefix} enabled={enabled} />
    <SharedExerciseAssignmentLocalizedFields
      prefix={prefix}
      enabled={enabled}
    />
  </Well>
);

LocalizedShadowAssigmentFormField.propTypes = {
  prefix: PropTypes.string.isRequired,
  data: PropTypes.bool.isRequired,
};

export default LocalizedShadowAssigmentFormField;
