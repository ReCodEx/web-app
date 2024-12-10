import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Navigation from './Navigation.js';
import withLinks from '../../../helpers/withLinks.js';
import {
  AssignmentIcon,
  CodeFileIcon,
  ExerciseIcon,
  PlagiarismIcon,
  ResultsIcon,
  SolutionResultsIcon,
  UserIcon,
  UserProfileIcon,
} from '../../icons';
import { createGroupLinks } from './linkCreators.js';

const AssignmentSolutionNavigation = ({
  solutionId,
  assignmentId,
  exerciseId = null,
  userId,
  groupId,
  attemptIndex = null,
  canViewSolutions = false,
  canViewExercise = false,
  canViewUserProfile = false,
  titlePrefix = null,
  titleSuffix = null,
  plagiarism = false,
  links,
}) => (
  <Navigation
    assignmentId={assignmentId}
    userId={userId}
    titlePrefix={
      attemptIndex ? (
        <>
          {titlePrefix} <strong>#{attemptIndex}</strong>
        </>
      ) : (
        titlePrefix
      )
    }
    titleSuffix={titleSuffix}
    links={[
      {
        caption: <FormattedMessage id="app.navigation.solution" defaultMessage="Solution" />,
        link: links.SOLUTION_DETAIL_URI_FACTORY(assignmentId, solutionId),
        icon: <SolutionResultsIcon gapRight={2} />,
      },
      {
        caption: <FormattedMessage id="app.navigation.solutionFiles" defaultMessage="Submitted Files" />,
        link: links.SOLUTION_SOURCE_CODES_URI_FACTORY(assignmentId, solutionId),
        icon: <CodeFileIcon gapRight={2} />,
      },
      plagiarism && {
        caption: <FormattedMessage id="app.navigation.solutionPlagiarisms" defaultMessage="Similarities" />,
        link: links.SOLUTION_PLAGIARISMS_URI_FACTORY(assignmentId, solutionId),
        icon: <PlagiarismIcon gapRight={2} />,
      },
      {
        caption: <FormattedMessage id="app.navigation.userSolution" defaultMessage="User Solutions" />,
        link: links.GROUP_USER_SOLUTIONS_URI_FACTORY(groupId, userId),
        icon: <UserIcon gapRight={2} />,
      },
      canViewSolutions && {
        caption: <FormattedMessage id="app.navigation.allSolutions" defaultMessage="All Solutions" />,
        link: links.ASSIGNMENT_SOLUTIONS_URI_FACTORY(assignmentId),
        icon: <ResultsIcon gapRight={2} />,
      },
      {
        caption: <FormattedMessage id="app.navigation.assignment" defaultMessage="Assignment" />,
        link: links.ASSIGNMENT_DETAIL_URI_FACTORY(assignmentId),
        icon: <AssignmentIcon gapRight={2} />,
      },
      canViewExercise &&
        exerciseId && {
          caption: <FormattedMessage id="app.navigation.exercise" defaultMessage="Exercise" />,
          link: links.EXERCISE_URI_FACTORY(exerciseId),
          icon: <ExerciseIcon gapRight={2} />,
        },
      ...createGroupLinks(links, groupId, true) /* true = detail, no edit */,
    ]}
    secondaryLinks={[
      canViewUserProfile && {
        caption: <FormattedMessage id="app.navigation.userProfile" defaultMessage="User's Profile" />,
        link: links.USER_URI_FACTORY(userId),
        icon: <UserProfileIcon gapRight={2} />,
      },
    ]}
  />
);

AssignmentSolutionNavigation.propTypes = {
  solutionId: PropTypes.string.isRequired,
  assignmentId: PropTypes.string.isRequired,
  exerciseId: PropTypes.string,
  userId: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  attemptIndex: PropTypes.number,
  canViewSolutions: PropTypes.bool,
  canViewExercise: PropTypes.bool,
  canViewUserProfile: PropTypes.bool,
  titlePrefix: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  titleSuffix: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  plagiarism: PropTypes.bool,
  links: PropTypes.object.isRequired,
};

export default withLinks(AssignmentSolutionNavigation);
