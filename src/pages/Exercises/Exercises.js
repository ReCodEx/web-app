import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router';
import { defaultMemoize } from 'reselect';

import App from '../../containers/App';
import PageContent from '../../components/layout/PageContent';
import ExercisesListContainer from '../../containers/ExercisesListContainer';
import CreateExerciseForm from '../../components/forms/CreateExerciseForm';
import Box from '../../components/widgets/Box';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { create as createExercise } from '../../redux/modules/exercises';
import { notArchivedGroupsSelector, groupDataAccessorSelector } from '../../redux/selectors/groups';

import { getGroupCanonicalLocalizedName } from '../../helpers/localizedData';
import { hasPermissions } from '../../helpers/common';
import withLinks from '../../helpers/withLinks';

const CREATE_EXERCISE_FORM_INITIAL_VALUES = {
  groupId: '',
};

const prepareGroupOptions = defaultMemoize((groups, groupsAccessor, locale) =>
  groups
    .filter(group => hasPermissions(group, 'createExercise'))
    .map(group => ({
      key: group.id,
      name: getGroupCanonicalLocalizedName(group, groupsAccessor, locale),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, locale))
);

class Exercises extends Component {
  createExercise = ({ groupId }) => {
    const {
      createGroupExercise,
      history: { push },
      links: { EXERCISE_EDIT_URI_FACTORY },
    } = this.props;
    createGroupExercise(groupId).then(({ value: exercise }) => {
      App.ignoreNextLocationChange();
      push(EXERCISE_EDIT_URI_FACTORY(exercise.id));
    });
  };

  render() {
    const {
      groups,
      groupsAccessor,
      intl: { locale },
    } = this.props;

    return (
      <PageContent
        title={<FormattedMessage id="app.exercises.title" defaultMessage="Exercises List" />}
        description={<FormattedMessage id="app.instance.description" defaultMessage="Instance overview" />}>
        <>
          <Box title={<FormattedMessage id="app.exercises.listTitle" defaultMessage="Exercises" />} unlimitedHeight>
            <ExercisesListContainer id="exercises-all" showGroups />
          </Box>

          <ResourceRenderer resource={groups.toArray()} returnAsArray>
            {groups => (
              <CreateExerciseForm
                groups={prepareGroupOptions(groups, groupsAccessor, locale)}
                onSubmit={this.createExercise}
                initialValues={CREATE_EXERCISE_FORM_INITIAL_VALUES}
              />
            )}
          </ResourceRenderer>
        </>
      </PageContent>
    );
  }
}

Exercises.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }),
  groups: ImmutablePropTypes.map,
  groupsAccessor: PropTypes.func.isRequired,
  query: PropTypes.string,
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
  )(injectIntl(withRouter(Exercises)))
);
