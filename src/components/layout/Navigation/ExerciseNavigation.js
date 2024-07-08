import React from 'react';
import PropTypes from 'prop-types';

import Navigation from './Navigation.js';
import withLinks from '../../../helpers/withLinks.js';
import { createExerciseLinks } from './linkCreators.js';

const ExerciseNavigation = ({ exercise: { id, permissionHints }, links }) => {
  const canEdit = permissionHints.update || permissionHints.archive || permissionHints.remove;
  const canViewTests = permissionHints.viewConfig && permissionHints.viewScoreConfig;
  const canViewLimits = permissionHints.viewLimits;
  const canViewAssignments = permissionHints.viewAssignments;

  return (
    <Navigation
      exerciseId={id}
      links={createExerciseLinks(links, id, canEdit, canViewTests, canViewLimits, canViewAssignments)}
    />
  );
};

ExerciseNavigation.propTypes = {
  exercise: PropTypes.object.isRequired,
  links: PropTypes.object.isRequired,
};

export default withLinks(ExerciseNavigation);
