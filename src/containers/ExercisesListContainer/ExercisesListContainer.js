import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage, intlShape } from 'react-intl';
import { defaultMemoize } from 'reselect';

import PaginationContainer, {
  createSortingIcon,
  showRangeInfo
} from '../PaginationContainer';
import ExercisesList from '../../components/Exercises/ExercisesList';
import FilterExercisesListForm from '../../components/forms/FilterExercisesListForm';
import { fetchExercisesAuthorsIfNeeded } from '../../redux/modules/exercisesAuthors';
import {
  getAllExericsesAuthors,
  getAllExericsesAuthorsIsLoading,
  getExercisesAuthorsOfGroup,
  getExercisesAuthorsOfGroupIsLoading
} from '../../redux/selectors/exercisesAuthors';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';

import withLinks from '../../helpers/withLinks';

const filterInitialValues = defaultMemoize(
  ({ search = '', authorsIds = [] }) => ({
    search,
    author: authorsIds.length > 0 ? authorsIds[0] : null
  })
);

const transformAndSetFilterData = defaultMemoize(
  setFilters => ({ search, author }) => {
    const data = {};
    if (search.trim()) {
      data.search = search.trim();
    }
    if (author) {
      data.authorsIds = [author];
    }
    return setFilters(data);
  }
);

class ExercisesListContainer extends Component {
  constructor(props) {
    super(props);
    this.defaultFilters = {};
    if (props.rootGroup) {
      this.defaultFilters.groupsIds = [props.rootGroup];
    }
  }

  componentWillMount() {
    ExercisesListContainer.loadData(this.props);
  }

  componentWillReceiveProps({ rootGroup, fetchExercisesAuthorsIfNeeded }) {
    if (this.props.rootGroup !== rootGroup) {
      fetchExercisesAuthorsIfNeeded(rootGroup);
    }
  }

  static loadData = ({ rootGroup, fetchExercisesAuthorsIfNeeded }) =>
    fetchExercisesAuthorsIfNeeded(rootGroup);

  headingCreator = ({
    offset,
    limit,
    totalCount,
    orderByColumn,
    orderByDescending,
    setOrderBy
  }) => {
    const { showGroups } = this.props;
    return (
      <tr>
        <th className="shrink-col" />
        <th>
          <FormattedMessage id="generic.name" defaultMessage="Name" />
          {createSortingIcon(
            'name',
            orderByColumn,
            orderByDescending,
            setOrderBy
          )}
        </th>
        <th>
          <FormattedMessage id="generic.author" defaultMessage="Author" />
        </th>
        <th>
          <FormattedMessage
            id="generic.runtimesShort"
            defaultMessage="Runtimes/Languages"
          />
        </th>
        {showGroups &&
          <th>
            <FormattedMessage
              id="app.exercisesList.groups"
              defaultMessage="Groups"
            />
          </th>}
        <th>
          <FormattedMessage
            id="app.exercisesList.difficulty"
            defaultMessage="Difficulty"
          />
        </th>
        <th>
          <FormattedMessage
            id="app.exercisesList.created"
            defaultMessage="Created"
          />
          {createSortingIcon(
            'createdAt',
            orderByColumn,
            orderByDescending,
            setOrderBy
          )}
        </th>
        <td>
          {showRangeInfo(offset, limit, totalCount)}
        </td>
      </tr>
    );
  };

  filtersCreator = (filters, setFilters) => {
    const { id, authors, authorsLoading, loggedUserId } = this.props;

    return (
      <FilterExercisesListForm
        form={`${id}-filterForm`}
        authors={authors}
        authorsLoading={authorsLoading}
        loggedUserId={loggedUserId}
        onSubmit={setFilters ? transformAndSetFilterData(setFilters) : null}
        initialValues={filterInitialValues(filters)}
      />
    );
  };

  render() {
    const { id, showGroups = false } = this.props;
    return (
      <PaginationContainer
        id={id}
        endpoint="exercises"
        defaultOrderBy="name"
        defaultFilters={this.defaultFilters}
        filtersCreator={this.filtersCreator}
      >
        {({
          data,
          offset,
          limit,
          totalCount,
          orderByColumn,
          orderByDescending,
          setOrderBy,
          reload
        }) =>
          <ExercisesList
            exercises={data}
            showGroups={showGroups}
            heading={this.headingCreator({
              offset,
              limit,
              totalCount,
              orderByColumn,
              orderByDescending,
              setOrderBy
            })}
          />}
      </PaginationContainer>
    );
  }
}

ExercisesListContainer.propTypes = {
  id: PropTypes.string.isRequired,
  rootGroup: PropTypes.string,
  showGroups: PropTypes.bool,
  loggedUserId: PropTypes.string.isRequired,
  authors: ImmutablePropTypes.list,
  authorsLoading: PropTypes.bool.isRequired,
  fetchExercisesAuthorsIfNeeded: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  links: PropTypes.object.isRequired
};

export default withLinks(
  connect(
    (state, { rootGroup }) => ({
      loggedUserId: loggedInUserIdSelector(state),
      authors: rootGroup
        ? getExercisesAuthorsOfGroup(rootGroup)(state)
        : getAllExericsesAuthors(state),
      authorsLoading: rootGroup
        ? getExercisesAuthorsOfGroupIsLoading(rootGroup)(state)
        : getAllExericsesAuthorsIsLoading(state)
    }),
    dispatch => ({
      fetchExercisesAuthorsIfNeeded: groupId =>
        dispatch(fetchExercisesAuthorsIfNeeded(groupId || null))
    })
  )(injectIntl(ExercisesListContainer))
);
