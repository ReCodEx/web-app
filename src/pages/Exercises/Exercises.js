import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { push } from 'react-router-redux';
import { LinkContainer } from 'react-router-bootstrap';

import PageContent from '../../components/layout/PageContent';
import Box from '../../components/widgets/Box';
import DeleteExerciseButtonContainer from '../../containers/DeleteExerciseButtonContainer';
import SearchContainer from '../../containers/SearchContainer';
import ExercisesList from '../../components/Exercises/ExercisesList';
import Button from '../../components/widgets/FlatButton';
import { AddIcon, EditIcon } from '../../components/icons';

import { create as createExercise } from '../../redux/modules/exercises';
import { searchExercises } from '../../redux/modules/search';
import { fetchUser } from '../../redux/modules/users';
import { fetchInstanceGroups } from '../../redux/modules/groups';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import {
  canLoggedUserEditExercise,
  isLoggedAsSuperAdmin
} from '../../redux/selectors/users';
import { getSearchQuery } from '../../redux/selectors/search';

import withLinks from '../../helpers/withLinks';

class Exercises extends Component {
  static loadAsync = (params, dispatch, userId) =>
    userId
      ? dispatch(fetchUser(userId)).then(({ value: data }) =>
          dispatch(fetchInstanceGroups(data.privateData.instanceId))
        )
      : Promise.resolve();

  componentWillMount() {
    this.props.loadAsync(this.props.userId);
  }

  newExercise = () => {
    const {
      createExercise,
      push,
      links: { EXERCISE_EDIT_URI_FACTORY }
    } = this.props;
    createExercise().then(({ value: exercise }) =>
      push(EXERCISE_EDIT_URI_FACTORY(exercise.id))
    );
  };

  render() {
    const {
      query,
      isSuperAdmin,
      isAuthorOfExercise,
      search,
      links: {
        EXERCISE_EDIT_URI_FACTORY,
        EXERCISE_EDIT_SIMPLE_CONFIG_URI_FACTORY,
        EXERCISE_EDIT_LIMITS_URI_FACTORY
      }
    } = this.props;

    return (
      <PageContent
        title={
          <FormattedMessage
            id="app.exercises.title"
            defaultMessage="Exercise list"
          />
        }
        description={
          <FormattedMessage
            id="app.instance.description"
            defaultMessage="List and assign exercises to your groups."
          />
        }
        breadcrumbs={[
          {
            text: (
              <FormattedMessage
                id="app.exercises.title"
                defaultMessage="Exercise list"
              />
            ),
            iconName: 'puzzle-piece'
          }
        ]}
      >
        <Box
          title={
            <FormattedMessage
              id="app.exercises.listTitle"
              defaultMessage="Exercises"
            />
          }
          footer={
            <p className="text-center">
              {isSuperAdmin &&
                <Button
                  bsStyle="success"
                  className="btn-flat"
                  bsSize="sm"
                  onClick={() => {
                    this.newExercise();
                  }}
                >
                  <AddIcon />{' '}
                  <FormattedMessage
                    id="app.exercises.add"
                    defaultMessage="Add exercise"
                  />
                </Button>}
            </p>
          }
          unlimitedHeight
        >
          <SearchContainer
            type="exercises"
            id="exercises-page"
            search={search}
            showAllOnEmptyQuery={true}
            renderList={exercises =>
              <ExercisesList
                exercises={exercises}
                createActions={id =>
                  isAuthorOfExercise(id) &&
                  <div>
                    <LinkContainer to={EXERCISE_EDIT_URI_FACTORY(id)}>
                      <Button bsSize="xs" bsStyle="warning">
                        <EditIcon />{' '}
                        <FormattedMessage
                          id="app.exercises.listEdit"
                          defaultMessage="Settings"
                        />
                      </Button>
                    </LinkContainer>
                    <LinkContainer
                      to={EXERCISE_EDIT_SIMPLE_CONFIG_URI_FACTORY(id)}
                    >
                      <Button bsSize="xs" bsStyle="warning">
                        <EditIcon />{' '}
                        <FormattedMessage
                          id="app.exercises.listEditConfig"
                          defaultMessage="Configuration"
                        />
                      </Button>
                    </LinkContainer>
                    <LinkContainer to={EXERCISE_EDIT_LIMITS_URI_FACTORY(id)}>
                      <Button bsSize="xs" bsStyle="warning">
                        <EditIcon />{' '}
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
                      onDeleted={() => search(query)}
                    />
                  </div>}
              />}
          />
        </Box>
      </PageContent>
    );
  }
}

Exercises.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  query: PropTypes.string,
  createExercise: PropTypes.func.isRequired,
  isSuperAdmin: PropTypes.bool.isRequired,
  isAuthorOfExercise: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  search: PropTypes.func
};

export default withLinks(
  connect(
    state => {
      return {
        userId: loggedInUserIdSelector(state),
        query: getSearchQuery('exercises-page')(state),
        isSuperAdmin: isLoggedAsSuperAdmin(state),
        isAuthorOfExercise: exerciseId =>
          canLoggedUserEditExercise(exerciseId)(state)
      };
    },
    dispatch => ({
      loadAsync: userId => Exercises.loadAsync({}, dispatch, userId),
      push: url => dispatch(push(url)),
      createExercise: () => dispatch(createExercise()),
      search: query => dispatch(searchExercises()('exercises-page', query))
    })
  )(Exercises)
);
