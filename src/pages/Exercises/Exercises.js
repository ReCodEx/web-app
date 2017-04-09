import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import { push } from 'react-router-redux';

import Page from '../../components/Page';
import Box from '../../components/AdminLTE/Box';
import { AddIcon } from '../../components/Icons';
import { exercisesSelector } from '../../redux/selectors/exercises';
import {
  fetchExercises,
  create as createExercise
} from '../../redux/modules/exercises';
import ExercisesList from '../../components/Exercises/ExercisesList';

import withLinks from '../../hoc/withLinks';

class Exercises extends Component {
  static loadAsync = (params, dispatch) =>
    Promise.all([dispatch(fetchExercises())]);

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
      push(EXERCISE_EDIT_URI_FACTORY(exercise.id)));
  };

  render() {
    const {
      exercises
    } = this.props;

    return (
      <Page
        resource={exercises.toArray()}
        title={
          <FormattedMessage
            id="app.exercises.title"
            defaultMessage="Exercises list"
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
                defaultMessage="Exercises list"
              />
            ),
            iconName: 'puzzle-piece'
          }
        ]}
      >
        {(...exercises) => (
          <div>
            <Box
              title={
                <FormattedMessage
                  id="app.exercises.listTitle"
                  defaultMessage="Exercises"
                />
              }
              noPadding
            >
              <ExercisesList exercises={exercises} />
            </Box>
            <p>
              <Button
                bsStyle="success"
                className="btn-flat"
                bsSize="sm"
                onClick={() => {
                  this.newExercise();
                }}
              >
                <AddIcon />
                {' '}
                <FormattedMessage
                  id="app.exercises.add"
                  defaultMessage="Add exercise"
                />
              </Button>
            </p>
          </div>
        )}
      </Page>
    );
  }
}

Exercises.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  exercises: ImmutablePropTypes.map,
  createExercise: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired
};

export default withLinks(
  connect(
    state => ({
      exercises: exercisesSelector(state)
    }),
    dispatch => ({
      push: url => dispatch(push(url)),
      createExercise: () => dispatch(createExercise()),
      loadAsync: () => Exercises.loadAsync({}, dispatch)
    })
  )(Exercises)
);
