import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import { lruMemoize } from 'reselect';

import PaginationContainer, { createSortingIcon, showRangeInfo } from '../PaginationContainer';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import ExercisesList from '../../components/Exercises/ExercisesList';
import FilterExercisesListForm from '../../components/forms/FilterExercisesListForm';
import { fetchExercisesAuthorsIfNeeded } from '../../redux/modules/exercisesAuthors.js';
import { create as assignExercise } from '../../redux/modules/assignments.js';
import { fetchTags } from '../../redux/modules/exercises.js';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments.js';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments.js';
import { arrayToObject, EMPTY_OBJ } from '../../helpers/common.js';

import withLinks from '../../helpers/withLinks.js';
import withRouter, { withRouterProps } from '../../helpers/withRouter.js';
import { suspendAbortPendingRequestsOptimization } from '../../pages/routes.js';

const filterInitialValues = lruMemoize(
  ({ search = '', archived = null, authorsIds = [], tags = [], runtimeEnvironments = [] }, allEnvironments) => ({
    search,
    archived: archived === null ? 'default' : archived,
    author: authorsIds.length > 0 ? authorsIds[0] : null,
    tags,
    runtimeEnvironments: arrayToObject(
      allEnvironments,
      rte => rte.id,
      rte => runtimeEnvironments.includes(rte.id)
    ),
  })
);

const transformAndSetFilterData = lruMemoize(
  (setFilters, rootGroup) =>
    ({ search, archived, author, tags, runtimeEnvironments }) => {
      const data = {};
      if (search.trim()) {
        data.search = search.trim();
      }
      if (archived && (archived === 'all' || archived === 'only')) {
        data.archived = archived;
      }
      if (author) {
        data.authorsIds = [author];
      }
      if (rootGroup) {
        data.groupsIds = [rootGroup];
      }
      if (tags && tags.length > 0) {
        data.tags = tags;
      }

      data.runtimeEnvironments = Object.keys(runtimeEnvironments).filter(rte => runtimeEnvironments[rte]);
      if (runtimeEnvironments.length === 0) {
        delete data.runtimeEnvironments;
      }

      return setFilters(data);
    }
);

const getDefaultFilters = lruMemoize(rootGroup => (rootGroup ? { groupsIds: [rootGroup] } : EMPTY_OBJ));

class ExercisesListContainer extends Component {
  componentDidMount() {
    ExercisesListContainer.loadData(this.props);
  }

  componentDidUpdate(prevProps) {
    if (this.props.rootGroup !== prevProps.rootGroup) {
      this.props.fetchExercisesAuthorsIfNeeded(this.props.rootGroup);
      this.props.fetchTags();
    }
  }

  static loadData = ({ rootGroup, fetchExercisesAuthorsIfNeeded, fetchTags, fetchRuntimeEnvironments }) =>
    Promise.all([fetchExercisesAuthorsIfNeeded(rootGroup), fetchTags(), fetchRuntimeEnvironments()]);

  headingCreator = ({ offset, limit, totalCount, orderByColumn, orderByDescending, setOrderBy }) => {
    const { showGroups } = this.props;
    return (
      <tr>
        <th className="shrink-col" />
        <th>
          <FormattedMessage id="generic.name" defaultMessage="Name" />
          {createSortingIcon('name', orderByColumn, orderByDescending, setOrderBy)}
        </th>
        <th>
          <FormattedMessage id="generic.author" defaultMessage="Author" />
        </th>
        <th>
          <FormattedMessage id="generic.runtimesShort" defaultMessage="Runtimes/Languages" />
        </th>
        <th>
          <FormattedMessage id="generic.tags" defaultMessage="Tags" />
        </th>
        {showGroups && (
          <th>
            <FormattedMessage id="app.exercisesList.groups" defaultMessage="Groups" />
          </th>
        )}
        <th>
          <FormattedMessage id="app.exercisesList.difficulty" defaultMessage="Difficulty" />
        </th>
        <th className="text-nowrap">
          <FormattedMessage id="app.exercisesList.created" defaultMessage="Created" />
          {createSortingIcon('createdAt', orderByColumn, orderByDescending, setOrderBy)}
        </th>
        <td>{showRangeInfo(offset, limit, totalCount)}</td>
      </tr>
    );
  };

  filtersCreator = (filters, setFilters) => {
    const { id, runtimeEnvironments, rootGroup } = this.props;

    return (
      <ResourceRenderer resourceArray={runtimeEnvironments} bulkyLoading>
        {envs => (
          <FilterExercisesListForm
            form={`${id}-filterForm`}
            rootGroup={rootGroup}
            runtimeEnvironments={envs}
            onSubmit={setFilters ? transformAndSetFilterData(setFilters, rootGroup) : null}
            initialValues={filterInitialValues(filters, envs)}
          />
        )}
      </ResourceRenderer>
    );
  };

  assignExercise = exerciseId => {
    const {
      assignExercise,
      navigate,
      links: { ASSIGNMENT_EDIT_URI_FACTORY },
    } = this.props;
    assignExercise(exerciseId).then(({ value: assignment }) => {
      suspendAbortPendingRequestsOptimization();
      navigate(ASSIGNMENT_EDIT_URI_FACTORY(assignment.id));
    });
  };

  render() {
    const { id, showGroups = false, showAssignButton = false, rootGroup = null } = this.props;
    return (
      <PaginationContainer
        id={id}
        endpoint="exercises"
        defaultOrderBy="name"
        defaultFilters={getDefaultFilters(rootGroup)}
        filtersCreator={this.filtersCreator}>
        {({ data, offset, limit, totalCount, orderByColumn, orderByDescending, setOrderBy, reload }) => (
          <ExercisesList
            exercises={data}
            showGroups={showGroups}
            showAssignButton={Boolean(showAssignButton && rootGroup)}
            assignExercise={this.assignExercise}
            heading={this.headingCreator({
              offset,
              limit,
              totalCount,
              orderByColumn,
              orderByDescending,
              setOrderBy,
            })}
            reload={reload}
          />
        )}
      </PaginationContainer>
    );
  }
}

ExercisesListContainer.propTypes = {
  id: PropTypes.string.isRequired,
  rootGroup: PropTypes.string,
  showGroups: PropTypes.bool,
  showAssignButton: PropTypes.bool,
  fetchExercisesAuthorsIfNeeded: PropTypes.func.isRequired,
  fetchTags: PropTypes.func.isRequired,
  runtimeEnvironments: ImmutablePropTypes.map.isRequired,
  assignExercise: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
  links: PropTypes.object.isRequired,
  navigate: withRouterProps.navigate,
};

export default withRouter(
  withLinks(
    connect(
      state => ({
        runtimeEnvironments: runtimeEnvironmentsSelector(state),
      }),
      (dispatch, { rootGroup = null }) => ({
        fetchExercisesAuthorsIfNeeded: groupId => dispatch(fetchExercisesAuthorsIfNeeded(groupId || null)),
        fetchTags: () => dispatch(fetchTags()),
        fetchRuntimeEnvironments: () => dispatch(fetchRuntimeEnvironments()),
        assignExercise: exerciseId => dispatch(assignExercise(rootGroup, exerciseId)),
      })
    )(injectIntl(ExercisesListContainer))
  )
);
