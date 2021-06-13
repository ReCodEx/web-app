import React from 'react';
import PropTypes from 'prop-types';

import InsetPanel from '../../widgets/InsetPanel';
import SharedLocalizedFields from './SharedLocalizedFields';
import SharedExerciseAssignmentLocalizedFields from './SharedExerciseAssignmentLocalizedFields';

const LocalizedShadowAssignmentFormField = ({ prefix, data: enabled }) => (
  <InsetPanel>
    <SharedLocalizedFields prefix={prefix} enabled={enabled} />
    <SharedExerciseAssignmentLocalizedFields prefix={prefix} enabled={enabled} />
  </InsetPanel>
);

LocalizedShadowAssignmentFormField.propTypes = {
  prefix: PropTypes.string.isRequired,
  data: PropTypes.bool.isRequired,
};

export default LocalizedShadowAssignmentFormField;
