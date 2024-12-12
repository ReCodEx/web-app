import React from 'react';
import { FormattedMessage } from 'react-intl';
import {
  AssignmentsIcon,
  EditIcon,
  GroupIcon,
  GroupExamsIcon,
  ExerciseIcon,
  LimitsIcon,
  ReferenceSolutionIcon,
  StudentsIcon,
  TestsIcon,
} from '../../icons';

export const createGroupLinks = (
  {
    GROUP_INFO_URI_FACTORY,
    GROUP_ASSIGNMENTS_URI_FACTORY,
    GROUP_STUDENTS_URI_FACTORY,
    GROUP_EDIT_URI_FACTORY,
    GROUP_EXAMS_URI_FACTORY,
  },
  groupId,
  canViewDetail = true,
  canEdit = false,
  canSeeExams = false
) => [
  {
    caption: <FormattedMessage id="app.navigation.groupInfo" defaultMessage="Group Info" />,
    link: GROUP_INFO_URI_FACTORY(groupId),
    icon: <GroupIcon gapRight={2} />,
  },
  canViewDetail && {
    caption: <FormattedMessage id="app.navigation.groupAssignments" defaultMessage="Group Assignments" />,
    link: GROUP_ASSIGNMENTS_URI_FACTORY(groupId),
    icon: <AssignmentsIcon gapRight={2} />,
  },
  canViewDetail && {
    caption: <FormattedMessage id="app.navigation.groupStudents" defaultMessage="Group Students" />,
    link: GROUP_STUDENTS_URI_FACTORY(groupId),
    icon: <StudentsIcon gapRight={2} />,
  },
  canEdit && {
    caption: <FormattedMessage id="app.navigation.edit" defaultMessage="Edit" />,
    link: GROUP_EDIT_URI_FACTORY(groupId),
    icon: <EditIcon gapRight={2} />,
  },
  canSeeExams && {
    caption: <FormattedMessage id="app.navigation.groupExams" defaultMessage="Exam Terms" />,
    link: GROUP_EXAMS_URI_FACTORY(groupId),
    icon: <GroupExamsIcon gapRight={2} />,
    match: (link, pathname) => pathname.startsWith(link),
  },
];

export const createExerciseLinks = (
  {
    EXERCISE_URI_FACTORY,
    EXERCISE_EDIT_URI_FACTORY,
    EXERCISE_EDIT_CONFIG_URI_FACTORY,
    EXERCISE_EDIT_LIMITS_URI_FACTORY,
    EXERCISE_REFERENCE_SOLUTIONS_URI_FACTORY,
    EXERCISE_ASSIGNMENTS_URI_FACTORY,
  },
  exerciseId,
  canEdit = false,
  canViewTests = false,
  canViewLimits = false,
  canViewAssignments = false
) => [
  {
    caption: <FormattedMessage id="app.navigation.exercise" defaultMessage="Exercise" />,
    link: EXERCISE_URI_FACTORY(exerciseId),
    icon: <ExerciseIcon gapRight={2} />,
  },
  canEdit && {
    caption: <FormattedMessage id="app.navigation.edit" defaultMessage="Edit" />,
    link: EXERCISE_EDIT_URI_FACTORY(exerciseId),
    icon: <EditIcon gapRight={2} />,
  },
  canViewTests && {
    caption: <FormattedMessage id="app.navigation.exerciseTests" defaultMessage="Tests" />,
    link: EXERCISE_EDIT_CONFIG_URI_FACTORY(exerciseId),
    icon: <TestsIcon gapRight={2} />,
  },
  canViewLimits && {
    caption: <FormattedMessage id="app.navigation.exerciseLimits" defaultMessage="Limits" />,
    link: EXERCISE_EDIT_LIMITS_URI_FACTORY(exerciseId),
    icon: <LimitsIcon gapRight={2} />,
  },
  {
    caption: <FormattedMessage id="app.navigation.exerciseReferenceSolutions" defaultMessage="Reference solutions" />,
    link: EXERCISE_REFERENCE_SOLUTIONS_URI_FACTORY(exerciseId),
    icon: <ReferenceSolutionIcon gapRight={2} />,
  },
  canViewAssignments && {
    caption: <FormattedMessage id="app.navigation.exerciseAssignments" defaultMessage="Assignments" />,
    link: EXERCISE_ASSIGNMENTS_URI_FACTORY(exerciseId),
    icon: <AssignmentsIcon gapRight={2} />,
  },
];
