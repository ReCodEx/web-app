import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Button from '../../components/widgets/FlatButton';
import { push } from 'react-router-redux';
import { LinkContainer } from 'react-router-bootstrap';
import DeleteExerciseButtonContainer from '../../containers/DeleteExerciseButtonContainer';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  InputGroup,
  ButtonGroup
} from 'react-bootstrap';

import PageContent from '../../components/layout/PageContent';
import Box from '../../components/widgets/Box';
import { AddIcon, EditIcon, SearchIcon } from '../../components/icons';
import {
  exercisesSelector,
  fetchManyStatus
} from '../../redux/selectors/exercises';
import { canEditExercise } from '../../redux/selectors/users';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import {
  fetchExercises,
  create as createExercise
} from '../../redux/modules/exercises';
import ExercisesList from '../../components/Exercises/ExercisesList';

import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import { getJsData } from '../../redux/helpers/resourceManager';
import withLinks from '../../hoc/withLinks';

class Exercises extends Component {
  static loadAsync = (params, dispatch) =>
    Promise.all([dispatch(fetchExercises())]);

  componentWillMount() {
    this.props.loadAsync();
    this.setState({ visibleExercises: [] });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      visibleExercises: nextProps.exercises
        .toArray()
        .map(exercise => exercise.toJS().data)
    });
  }

  onChange(query, allExercises) {
    const normalizedQuery = query.toLocaleLowerCase();
    const filteredExercises = allExercises.filter(
      exercise =>
        exercise.name.toLocaleLowerCase().startsWith(normalizedQuery) ||
        exercise.id.toLocaleLowerCase().startsWith(normalizedQuery)
    );
    this.setState({
      visibleExercises: filteredExercises
    });
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
      isAuthorOfExercise,
      exercises,
      fetchStatus,
      links: { EXERCISE_EDIT_URI_FACTORY, EXERCISE_EDIT_CONFIG_URI_FACTORY }
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
                  </Button>
                </p>
              }
              noPadding
              unlimitedHeight
            >
              <div>
                <form style={{ padding: '10px' }}>
                  <FormGroup>
                    <ControlLabel>
                      <FormattedMessage
                        id="app.search.title"
                        defaultMessage="Search:"
                      />
                    </ControlLabel>
                    <InputGroup>
                      <FormControl
                        onChange={e => {
                          this.query = e.target.value;
                        }}
                      />
                      <InputGroup.Button>
                        <Button
                          type="submit"
                          onClick={e => {
                            e.preventDefault();
                            this.onChange(this.query, exercises.map(getJsData));
                          }}
                          disabled={false}
                        >
                          <SearchIcon />
                        </Button>
                      </InputGroup.Button>
                    </InputGroup>
                  </FormGroup>
                </form>
                <ExercisesList
                  exercises={this.state.visibleExercises}
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
                      <LinkContainer to={EXERCISE_EDIT_CONFIG_URI_FACTORY(id)}>
                        <Button bsSize="xs" bsStyle="warning">
                          <EditIcon />{' '}
                          <FormattedMessage
                            id="app.exercises.listEditConfig"
                            defaultMessage="Edit config"
                          />
                        </Button>
                      </LinkContainer>
                      <DeleteExerciseButtonContainer id={id} bsSize="xs" />
                    </ButtonGroup>}
                />
              </div>
            </Box>
          </PageContent>}
      </FetchManyResourceRenderer>
    );
  }
}

Exercises.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  exercises: ImmutablePropTypes.map,
  createExercise: PropTypes.func.isRequired,
  isAuthorOfExercise: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  fetchStatus: PropTypes.string
};

export default withLinks(
  connect(
    state => {
      const userId = loggedInUserIdSelector(state);
      return {
        exercises: exercisesSelector(state),
        fetchStatus: fetchManyStatus(state),
        isAuthorOfExercise: exerciseId =>
          canEditExercise(userId, exerciseId)(state)
      };
    },
    dispatch => ({
      push: url => dispatch(push(url)),
      createExercise: () => dispatch(createExercise()),
      loadAsync: () => Exercises.loadAsync({}, dispatch)
    })
  )(Exercises)
);
