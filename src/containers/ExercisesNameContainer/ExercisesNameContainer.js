import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { fetchExerciseIfNeeded } from '../../redux/modules/exercises.js';
import { exerciseSelector } from '../../redux/selectors/exercises.js';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { LocalizedExerciseName } from '../../components/helpers/LocalizedNames';
import { LoadingIcon, ExercisePrefixIcons } from '../../components/icons';
import withLinks from '../../helpers/withLinks.js';

class ExercisesNameContainer extends Component {
  componentDidMount() {
    ExercisesNameContainer.loadData(this.props);
  }

  componentDidUpdate(prevProps) {
    if (this.props.exerciseId !== prevProps.exerciseId) {
      ExercisesNameContainer.loadData(this.props);
    }
  }

  static loadData = ({ loadExerciseIfNeeded }) => {
    loadExerciseIfNeeded();
  };

  render() {
    const {
      exercise,
      noLink,
      links: { EXERCISE_URI_FACTORY },
    } = this.props;
    return (
      <ResourceRenderer
        resource={exercise}
        loading={
          <>
            <LoadingIcon gapRight />
            <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
          </>
        }>
        {({ id, name, localizedTexts, isPublic, isLocked, isBroken, archivedAt, hasReferenceSolutions }) => (
          <>
            <ExercisePrefixIcons
              id={id}
              isPublic={isPublic}
              isLocked={isLocked}
              isBroken={isBroken}
              archivedAt={archivedAt}
              hasReferenceSolutions={hasReferenceSolutions}
            />
            {noLink ? (
              <span>
                <LocalizedExerciseName entity={{ name, localizedTexts }} />
              </span>
            ) : (
              <Link to={EXERCISE_URI_FACTORY(id)}>
                <LocalizedExerciseName entity={{ name, localizedTexts }} />
              </Link>
            )}
          </>
        )}
      </ResourceRenderer>
    );
  }
}

ExercisesNameContainer.propTypes = {
  exerciseId: PropTypes.string.isRequired,
  noLink: PropTypes.bool,
  exercise: ImmutablePropTypes.map,
  links: PropTypes.object.isRequired,
};

export default withLinks(
  connect(
    (state, { exerciseId }) => ({
      exercise: exerciseSelector(exerciseId)(state),
    }),
    (dispatch, { exerciseId }) => ({
      loadExerciseIfNeeded: () => dispatch(fetchExerciseIfNeeded(exerciseId)),
    })
  )(ExercisesNameContainer)
);
