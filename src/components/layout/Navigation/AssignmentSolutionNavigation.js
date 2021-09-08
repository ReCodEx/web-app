import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Navigation from './Navigation';
import withLinks from '../../../helpers/withLinks';
import { AssignmentIcon, ExerciseIcon, ResultsIcon, SolutionResultsIcon } from '../../icons';
import { createGroupLinks } from './linkCreators';

const AssignmentSolutionNavigation = ({
  solutionId,
  assignmentId,
  exerciseId = null,
  userId,
  groupId,
  canViewSolutions = false,
  canViewExercise = false,
  links,
}) => (
  <Navigation
    assignmentId={assignmentId}
    userId={userId}
    links={[
      {
        caption: <FormattedMessage id="app.navigation.solution" defaultMessage="Solution" />,
        link: links.SOLUTION_DETAIL_URI_FACTORY(assignmentId, solutionId),
        icon: <SolutionResultsIcon gapRight />,
      },
      canViewSolutions && {
        caption: <FormattedMessage id="app.navigation.allSolutions" defaultMessage="All Solutions" />,
        link: links.ASSIGNMENT_STATS_URI_FACTORY(assignmentId),
        icon: <ResultsIcon gapRight />,
      },
      {
        caption: <FormattedMessage id="app.navigation.assignment" defaultMessage="Assignment" />,
        link: links.ASSIGNMENT_DETAIL_URI_FACTORY(assignmentId),
        icon: <AssignmentIcon gapRight />,
      },
      canViewExercise &&
        exerciseId && {
          caption: <FormattedMessage id="app.navigation.exercise" defaultMessage="Exercise" />,
          link: links.EXERCISE_URI_FACTORY(exerciseId),
          icon: <ExerciseIcon gapRight />,
        },
      ...createGroupLinks(links, groupId, true) /* true = detail, no edit */,
    ]}
  />
);

AssignmentSolutionNavigation.propTypes = {
  solutionId: PropTypes.string.isRequired,
  assignmentId: PropTypes.string.isRequired,
  exerciseId: PropTypes.string,
  userId: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  canViewSolutions: PropTypes.bool,
  canViewExercise: PropTypes.bool,
  links: PropTypes.object.isRequired,
};

export default withLinks(AssignmentSolutionNavigation);
