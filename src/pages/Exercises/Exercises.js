import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import Page from '../../components/Page';
import { exercisesSelector } from '../../redux/selectors/exercises';
import { fetchExercisesIfNeeded } from '../../redux/modules/exercises';

class Exercises extends Component {

  static loadAsync = (params, dispatch) => Promise.all([
    dispatch(fetchExercisesIfNeeded())
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
            iconName: 'folder-open'
          }
        ]}>
        {(...exercises) => <span>@todo: list of {exercises.length} exercises</span>}
      </Page>
    );
  }

}

Exercises.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  exercises: PropTypes.array
};

export default connect(
  (state) => ({
    exercises: exercisesSelector(state)
  }),
  (dispatch) => ({
    loadAsync: () => Exercises.loadAsync({}, dispatch)
  })
)(Exercises);
