import React from 'react';
import { FormattedMessage } from 'react-intl';
import { AssignmentsIcon, EditIcon, GroupIcon, ExerciseIcon, LimitsIcon, StudentsIcon, TestsIcon } from '../../icons';

export const createGroupLinks = (
  { GROUP_INFO_URI_FACTORY, GROUP_ASSIGNMENTS_URI_FACTORY, GROUP_STUDENTS_URI_FACTORY, GROUP_EDIT_URI_FACTORY },
  groupId,
  canViewDetail = true,
  canEdit = false
) => [
  {
    caption: <FormattedMessage id="app.navigation.groupInfo" defaultMessage="Group Info" />,
    link: GROUP_INFO_URI_FACTORY(groupId),
    icon: <GroupIcon gapRight />,
  },
  canViewDetail && {
    caption: <FormattedMessage id="app.navigation.groupAssignments" defaultMessage="Group Assignments" />,
    link: GROUP_ASSIGNMENTS_URI_FACTORY(groupId),
    icon: <AssignmentsIcon gapRight />,
  },
  canViewDetail && {
    caption: <FormattedMessage id="app.navigation.groupStudents" defaultMessage="Group Students" />,
    link: GROUP_STUDENTS_URI_FACTORY(groupId),
    icon: <StudentsIcon gapRight />,
  },
  canEdit && {
    caption: <FormattedMessage id="app.navigation.edit" defaultMessage="Edit" />,
    link: GROUP_EDIT_URI_FACTORY(groupId),
    icon: <EditIcon gapRight />,
  },
];

export const createExerciseLinks = (
  {
    EXERCISE_URI_FACTORY,
    EXERCISE_EDIT_URI_FACTORY,
    EXERCISE_EDIT_CONFIG_URI_FACTORY,
    EXERCISE_EDIT_LIMITS_URI_FACTORY,
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
    icon: <ExerciseIcon gapRight />,
  },
  canEdit && {
    caption: <FormattedMessage id="app.navigation.edit" defaultMessage="Edit" />,
    link: EXERCISE_EDIT_URI_FACTORY(exerciseId),
    icon: <EditIcon gapRight />,
  },
  canViewTests && {
    caption: <FormattedMessage id="app.navigation.exerciseTests" defaultMessage="Tests" />,
    link: EXERCISE_EDIT_CONFIG_URI_FACTORY(exerciseId),
    icon: <TestsIcon gapRight />,
  },
  canViewLimits && {
    caption: <FormattedMessage id="app.navigation.exerciseLimits" defaultMessage="Limits" />,
    link: EXERCISE_EDIT_LIMITS_URI_FACTORY(exerciseId),
    icon: <LimitsIcon gapRight />,
  },
  canViewAssignments && {
    caption: <FormattedMessage id="app.navigation.exerciseAssignments" defaultMessage="Assignments" />,
    link: EXERCISE_ASSIGNMENTS_URI_FACTORY(exerciseId),
    icon: <AssignmentsIcon gapRight />,
  },
];
