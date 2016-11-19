import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import Page from '../../components/Page';
import Box from '../../components/AdminLTE/Box';
import { exercisesSelector } from '../../redux/selectors/exercises';
import { fetchExercises } from '../../redux/modules/exercises';
import ExercisesList from '../../components/Exercises/ExercisesList';

class Exercises extends Component {

  static loadAsync = (params, dispatch) => Promise.all([
    dispatch(fetchExercises())
  ]);

  componentWillMount() {
    this.props.loadAsync();
  }

  render() {
    const {
      exercises
    } = this.props;

    return (
      <Page
        resource={exercises.toArray()}
        title={<FormattedMessage id='app.exercises.title' defaultMessage='Exercises list' />}
        description={<FormattedMessage id='app.instance.description' defaultMessage='List and assign exercises to your groups.' />}
        breadcrumbs={[
          {
            text: <FormattedMessage id='app.exercises.title' defaultMessage="Exercises list" />,
            iconName: 'puzzle-piece'
          }
        ]}>
        {(...exercises) => (
          <Box
            title={<FormattedMessage id='app.exercises.listTitle' defaultMessage='Exercises' />}
            noPadding>
            <ExercisesList exercises={exercises} />
          </Box>
        )}
      </Page>
    );
  }

}

Exercises.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  exercises: ImmutablePropTypes.map
};

export default connect(
  (state) => ({
    exercises: exercisesSelector(state)
  }),
  (dispatch) => ({
    loadAsync: () => Exercises.loadAsync({}, dispatch)
  })
)(Exercises);
