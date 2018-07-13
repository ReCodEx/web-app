import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage, intlShape } from 'react-intl';
import { LinkContainer } from 'react-router-bootstrap';

import PaginationContainer, {
  createSortingIcon,
  showRangeInfo
} from '../../containers/PaginationContainer';
import DeleteExerciseButtonContainer from '../../containers/DeleteExerciseButtonContainer';
import ExercisesList from '../../components/Exercises/ExercisesList';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import Button from '../../components/widgets/FlatButton';
import { EditIcon } from '../../components/icons';

import withLinks from '../../helpers/withLinks';

class ExercisesListContainer extends Component {
  constructor(props) {
    super(props);
    this.defaultFilters = {};
    if (props.rootGroup) {
      this.defaultFilters.groupsIds = [props.rootGroup];
    }
  }

  componentWillMount() {
    //    ExercisesNameContainer.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {}

  static loadData = ({ loadExerciseIfNeeded }) => {
    //loadExerciseIfNeeded();
  };

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
    return null;
    /*
    <FilterUsersListForm
      onSubmit={setFilters ? transformAndSetFilterData(setFilters) : null}
      initialValues={filterInitialValues(filters)}
    />;*/
  };

  render() {
    const {
      id,
      showGroups = false,
      links: {
        EXERCISE_EDIT_URI_FACTORY,
        EXERCISE_EDIT_SIMPLE_CONFIG_URI_FACTORY,
        EXERCISE_EDIT_LIMITS_URI_FACTORY
      }
    } = this.props;
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
            createActions={id =>
              <div>
                <LinkContainer to={EXERCISE_EDIT_URI_FACTORY(id)}>
                  <Button bsSize="xs" bsStyle="warning">
                    <EditIcon gapRight />
                    <FormattedMessage
                      id="app.exercises.listEdit"
                      defaultMessage="Settings"
                    />
                  </Button>
                </LinkContainer>
                <LinkContainer to={EXERCISE_EDIT_SIMPLE_CONFIG_URI_FACTORY(id)}>
                  <Button bsSize="xs" bsStyle="warning">
                    <EditIcon gapRight />
                    <FormattedMessage
                      id="app.exercises.listEditConfig"
                      defaultMessage="Tests"
                    />
                  </Button>
                </LinkContainer>
                <LinkContainer to={EXERCISE_EDIT_LIMITS_URI_FACTORY(id)}>
                  <Button bsSize="xs" bsStyle="warning">
                    <EditIcon gapRight />
                    <FormattedMessage
                      id="app.exercises.listEditLimits"
                      defaultMessage="Limits"
                    />
                  </Button>
                </LinkContainer>

                <DeleteExerciseButtonContainer
                  id={id}
                  bsSize="xs"
                  resourceless={true}
                  onDeleted={reload}
                />
              </div>}
          />}
      </PaginationContainer>
    );
    /*
    return (
      <ResourceRenderer resource={exercise} loading={<LoadingExercisesName />}>
        {exercise =>
          <ExercisesName {...exercise} noLink={noLink} locale={locale} />}
      </ResourceRenderer>
    );
*/
  }
}

ExercisesListContainer.propTypes = {
  id: PropTypes.string.isRequired,
  rootGroup: PropTypes.string,
  showGroups: PropTypes.bool,
  intl: intlShape.isRequired,
  links: PropTypes.object.isRequired
};

export default withLinks(
  connect(
    (state, { exerciseId }) => ({
      //exercise: exerciseSelector(exerciseId)(state)
    }),
    (dispatch, { exerciseId }) => ({
      //loadExerciseIfNeeded: () => dispatch(fetchExerciseIfNeeded(exerciseId))
    })
  )(injectIntl(ExercisesListContainer))
);
