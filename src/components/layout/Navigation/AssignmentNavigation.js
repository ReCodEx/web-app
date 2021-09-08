import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Navigation from './Navigation';
import withLinks from '../../../helpers/withLinks';
import { AssignmentIcon, EditIcon, ExerciseIcon, ResultsIcon } from '../../icons';
import { createGroupLinks } from './linkCreators';

const AssignmentNavigation = ({
  assignmentId,
  exerciseId = null,
  userId = null,
  groupId,
  canEdit = false,
  canViewSolutions = false,
  canViewExercise = false,
  links,
}) => (
  <Navigation
    assignmentId={assignmentId}
    userId={userId}
    links={[
      {
        caption: <FormattedMessage id="app.navigation.assignment" defaultMessage="Assignment" />,
        link: links.ASSIGNMENT_DETAIL_URI_FACTORY(assignmentId),
        icon: <AssignmentIcon gapRight />,
      },
      canViewSolutions && {
        caption: <FormattedMessage id="app.navigation.allSolutions" defaultMessage="All Solutions" />,
        link: links.ASSIGNMENT_STATS_URI_FACTORY(assignmentId),
        icon: <ResultsIcon gapRight />,
      },
      canEdit && {
        caption: <FormattedMessage id="app.navigation.edit" defaultMessage="Edit" />,
        link: links.ASSIGNMENT_EDIT_URI_FACTORY(assignmentId),
        icon: <EditIcon gapRight />,
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

AssignmentNavigation.propTypes = {
  assignmentId: PropTypes.string.isRequired,
  exerciseId: PropTypes.string,
  userId: PropTypes.string,
  groupId: PropTypes.string.isRequired,
  canEdit: PropTypes.bool,
  canViewSolutions: PropTypes.bool,
  canViewExercise: PropTypes.bool,
  links: PropTypes.object.isRequired,
};

export default withLinks(AssignmentNavigation);
