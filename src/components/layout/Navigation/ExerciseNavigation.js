import React from 'react';
import PropTypes from 'prop-types';

import Navigation from './Navigation';
import withLinks from '../../../helpers/withLinks';
import { createExerciseLinks } from './linkCreators';

const ExerciseNavigation = ({
  exerciseId,
  canEdit = false,
  canViewTests = false,
  canViewLimits = false,
  canViewAssignments = false,
  links,
}) => (
  <Navigation
    exerciseId={exerciseId}
    links={createExerciseLinks(links, exerciseId, canEdit, canViewTests, canViewLimits, canViewAssignments)}
  />
);

ExerciseNavigation.propTypes = {
  exerciseId: PropTypes.string.isRequired,
  canEdit: PropTypes.bool,
  canViewTests: PropTypes.bool,
  canViewLimits: PropTypes.bool,
  canViewAssignments: PropTypes.bool,
  links: PropTypes.object.isRequired,
};

export default withLinks(ExerciseNavigation);
