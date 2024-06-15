import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { lruMemoize } from 'reselect';

import PageContent from '../../components/layout/PageContent';
import ExercisesListContainer from '../../containers/ExercisesListContainer';
import CreateExerciseForm from '../../components/forms/CreateExerciseForm';
import Box from '../../components/widgets/Box';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { ExerciseIcon } from '../../components/icons';
import { create as createExercise } from '../../redux/modules/exercises';
import { notArchivedGroupsSelector, groupDataAccessorSelector } from '../../redux/selectors/groups';

import { getGroupCanonicalLocalizedName } from '../../helpers/localizedData';
import { hasPermissions } from '../../helpers/common';
import withLinks from '../../helpers/withLinks';
import { suspendAbortPendingRequestsOptimization } from '../../pages/routes';

const CREATE_EXERCISE_FORM_INITIAL_VALUES = {
  groupId: '',
};

const prepareGroupOptions = lruMemoize((groups, groupsAccessor, locale) =>
  groups
    .filter(group => hasPermissions(group, 'createExercise'))
    .map(group => ({
      key: group.id,
      name: getGroupCanonicalLocalizedName(group, groupsAccessor, locale),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, locale))
);

const Exercises = ({
  groups,
  groupsAccessor,
  createGroupExercise,
  links: { EXERCISE_EDIT_URI_FACTORY },
  intl: { locale },
}) => {
  const navigate = useNavigate();
  const createExercise = ({ groupId }) => {
    createGroupExercise(groupId).then(({ value: exercise }) => {
      suspendAbortPendingRequestsOptimization();
      navigate(EXERCISE_EDIT_URI_FACTORY(exercise.id));
    });
  };

  return (
    <PageContent
      icon={<ExerciseIcon />}
      title={<FormattedMessage id="app.exercises.title" defaultMessage="List of All Exercises" />}>
      <>
        <Box title={<FormattedMessage id="app.exercises.listTitle" defaultMessage="Exercises" />} unlimitedHeight>
          <ExercisesListContainer id="exercises-all" showGroups />
        </Box>

        <ResourceRenderer resource={groups.toArray()} returnAsArray>
          {groups => (
            <CreateExerciseForm
              groups={prepareGroupOptions(groups, groupsAccessor, locale)}
              onSubmit={createExercise}
              initialValues={CREATE_EXERCISE_FORM_INITIAL_VALUES}
            />
          )}
        </ResourceRenderer>
      </>
    </PageContent>
  );
};

Exercises.propTypes = {
  groups: ImmutablePropTypes.map,
  groupsAccessor: PropTypes.func.isRequired,
  intl: PropTypes.object,
  links: PropTypes.object.isRequired,
  createGroupExercise: PropTypes.func.isRequired,
};

export default withLinks(
  connect(
    state => ({
      groups: notArchivedGroupsSelector(state),
      groupsAccessor: groupDataAccessorSelector(state),
    }),
    dispatch => ({
      createGroupExercise: groupId => dispatch(createExercise({ groupId })),
    })
  )(injectIntl(Exercises))
);
