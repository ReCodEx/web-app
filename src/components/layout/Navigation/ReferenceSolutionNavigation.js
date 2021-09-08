import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Navigation from './Navigation';
import { ReferenceSolutionIcon } from '../../icons';
import withLinks from '../../../helpers/withLinks';
import { createExerciseLinks } from './linkCreators';

const ReferenceSolutionNavigation = ({
  solutionId,
  exerciseId,
  userId,
  canEdit = false,
  canViewTests = false,
  canViewLimits = false,
  canViewAssignments = false,
  links,
}) => (
  <Navigation
    exerciseId={exerciseId}
    userId={userId}
    links={[
      {
        caption: <FormattedMessage id="app.navigation.referenceSolution" defaultMessage="Reference Solution" />,
        link: links.EXERCISE_REFERENCE_SOLUTION_URI_FACTORY(exerciseId, solutionId),
        icon: <ReferenceSolutionIcon gapRight />,
      },
      ...createExerciseLinks(links, exerciseId, canEdit, canViewTests, canViewLimits, canViewAssignments),
    ]}
  />
);

ReferenceSolutionNavigation.propTypes = {
  solutionId: PropTypes.string.isRequired,
  exerciseId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  canEdit: PropTypes.bool,
  canViewTests: PropTypes.bool,
  canViewLimits: PropTypes.bool,
  canViewAssignments: PropTypes.bool,
  links: PropTypes.object.isRequired,
};

export default withLinks(ReferenceSolutionNavigation);
