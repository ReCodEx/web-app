import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

import { fetchExerciseIfNeeded } from '../../redux/modules/exercises';
import { exerciseSelector } from '../../redux/selectors/exercises';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import ExercisesName, { LoadingExercisesName } from '../../components/Exercises/ExercisesName';

class ExercisesNameContainer extends Component {
  componentWillMount() {
    ExercisesNameContainer.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.exerciseId !== newProps.exerciseId) {
      ExercisesNameContainer.loadData(newProps);
    }
  }

  static loadData = ({ loadExerciseIfNeeded }) => {
    loadExerciseIfNeeded();
  };

  render() {
    const {
      exercise,
      noLink,
      intl: { locale },
    } = this.props;
    return (
      <ResourceRenderer resource={exercise} loading={<LoadingExercisesName />}>
        {exercise => <ExercisesName {...exercise} noLink={noLink} locale={locale} />}
      </ResourceRenderer>
    );
  }
}

ExercisesNameContainer.propTypes = {
  exerciseId: PropTypes.string.isRequired,
  exercise: ImmutablePropTypes.map,
  noLink: PropTypes.bool,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
};

export default injectIntl(
  connect(
    (state, { exerciseId }) => ({
      exercise: exerciseSelector(exerciseId)(state),
    }),
    (dispatch, { exerciseId }) => ({
      loadExerciseIfNeeded: () => dispatch(fetchExerciseIfNeeded(exerciseId)),
    })
  )(ExercisesNameContainer)
);
