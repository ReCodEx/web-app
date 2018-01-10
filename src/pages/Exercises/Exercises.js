import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Button from '../../components/widgets/FlatButton';
import { push } from 'react-router-redux';
import { LinkContainer } from 'react-router-bootstrap';
import { ButtonGroup } from 'react-bootstrap';
import DeleteExerciseButtonContainer from '../../containers/DeleteExerciseButtonContainer';
import SearchContainer from '../../containers/SearchContainer';

import PageContent from '../../components/layout/PageContent';
import Box from '../../components/widgets/Box';
import { AddIcon, EditIcon } from '../../components/icons';
import { fetchManyStatus } from '../../redux/selectors/exercises';
import {
  canEditExercise,
  isLoggedAsSuperAdmin
} from '../../redux/selectors/users';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import {
  fetchExercises,
  create as createExercise
} from '../../redux/modules/exercises';
import { searchExercises } from '../../redux/modules/search';
import { getSearchQuery } from '../../redux/selectors/search';
import ExercisesList from '../../components/Exercises/ExercisesList';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import withLinks from '../../hoc/withLinks';

class Exercises extends Component {
  static loadAsync = (params, dispatch) => dispatch(fetchExercises());

  componentWillMount() {
    this.props.loadAsync();
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
      fetchStatus,
      search,
      links: {
        EXERCISE_EDIT_URI_FACTORY,
        EXERCISE_EDIT_SIMPLE_CONFIG_URI_FACTORY
      }
    } = this.props;

    return (
      <FetchManyResourceRenderer
        fetchManyStatus={fetchStatus}
        loading={
          <PageContent
            title={
              <FormattedMessage
                id="app.page.exercises.loading"
                defaultMessage="Loading list of exercises ..."
              />
            }
            description={
              <FormattedMessage
                id="app.page.exercises.loadingDescription"
                defaultMessage="Please wait while we are getting the list of exercises ready."
              />
            }
          />
        }
        failed={
          <PageContent
            title={
              <FormattedMessage
                id="app.page.exercises.failed"
                defaultMessage="Cannot load the list of exercises"
              />
            }
            description={
              <FormattedMessage
                id="app.page.exercises.failedDescription"
                defaultMessage="We are sorry for the inconvenience, please try again later."
              />
            }
          />
        }
      >
        {() =>
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
                      <ButtonGroup>
                        <LinkContainer to={EXERCISE_EDIT_URI_FACTORY(id)}>
                          <Button bsSize="xs" bsStyle="warning">
                            <EditIcon />{' '}
                            <FormattedMessage
                              id="app.exercises.listEdit"
                              defaultMessage="Edit"
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
                              defaultMessage="Edit config"
                            />
                          </Button>
                        </LinkContainer>
                        <DeleteExerciseButtonContainer
                          id={id}
                          bsSize="xs"
                          onDeleted={() => search(query)}
                        />
                      </ButtonGroup>}
                  />}
              />
            </Box>
          </PageContent>}
      </FetchManyResourceRenderer>
    );
  }
}

Exercises.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  query: PropTypes.string,
  createExercise: PropTypes.func.isRequired,
  isSuperAdmin: PropTypes.bool.isRequired,
  isAuthorOfExercise: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  fetchStatus: PropTypes.string,
  search: PropTypes.func
};

export default withLinks(
  connect(
    state => {
      const userId = loggedInUserIdSelector(state);
      return {
        query: getSearchQuery('exercises-page')(state),
        fetchStatus: fetchManyStatus(state),
        isSuperAdmin: isLoggedAsSuperAdmin(state),
        isAuthorOfExercise: exerciseId =>
          canEditExercise(userId, exerciseId)(state)
      };
    },
    dispatch => ({
      push: url => dispatch(push(url)),
      createExercise: () => dispatch(createExercise()),
      loadAsync: () => Exercises.loadAsync({}, dispatch),
      search: query => dispatch(searchExercises()('exercises-page', query))
    })
  )(Exercises)
);
