import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, FormattedRelative } from 'react-intl';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { reset, getFormValues } from 'redux-form';

import { Row, Col, Alert } from 'react-bootstrap';
import PageContent from '../../components/PageContent';

import ResourceRenderer from '../../components/ResourceRenderer';
import EditExerciseForm from '../../components/Forms/EditExerciseForm';
import EditExerciseRuntimeConfigsForm from '../../components/Forms/EditExerciseRuntimeConfigsForm';

import { fetchExerciseIfNeeded, editExercise, editRuntimeConfigs } from '../../redux/modules/exercises';
import { getExercise } from '../../redux/selectors/exercises';
import { isSubmitting } from '../../redux/selectors/submission';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments';

class EditExercise extends Component {

  componentWillMount = () => this.props.loadAsync();
  componentWillReceiveProps = (props) => {
    if (this.props.params.exerciseId !== props.params.exerciseId) {
      props.reset();
      props.loadAsync();
    }
  };

  render() {
    const { links: { EXERCISE_URI_FACTORY } } = this.context;
    const {
      params: { exerciseId },
      exercise,
      editExercise,
      editSolutionRuntimeConfigs,
      runtimeEnvironments,
      formValues
    } = this.props;

    return (
      <PageContent
        title={<FormattedMessage id='app.editExercise.title' defaultMessage='Edit exercise' />}
        description={<FormattedMessage id='app.editExercise.description' defaultMessage='Change exercise settings' />}
        breadcrumbs={[
          {
            text: <FormattedMessage id='app.exercise.title' />,
            iconName: 'puzzle-piece',
            link: EXERCISE_URI_FACTORY(exerciseId)
          },
          {
            text: <FormattedMessage id='app.editExercise.title' />,
            iconName: 'pencil'
          }
        ]}>
        <ResourceRenderer resource={exercise}>
          {exercise => (
            <div>
              <EditExerciseForm
                initialValues={exercise}
                onSubmit={editExercise}
                formValues={formValues} />
              <EditExerciseRuntimeConfigsForm
                runtimeEnvironments={runtimeEnvironments}
                initialValues={{runtimeConfigs: exercise.solutionRuntimeConfigs}}
                onSubmit={editSolutionRuntimeConfigs} />
            </div>
          )}
        </ResourceRenderer>
      </PageContent>
    );
  }

}

EditExercise.contextTypes = {
  links: PropTypes.object
};

EditExercise.PropTypes = {
  runtimeEnvironments: PropTypes.object.isRequired,
  editExercise: PropTypes.func.isRequired,
  editSolutionRuntimeConfigs: PropTypes.func.isRequired
};

export default connect(
  (state, { params: { exerciseId } }) => {
    const exerciseSelector = getExercise(exerciseId);
    const userId = loggedInUserIdSelector(state);
    return {
      exercise: exerciseSelector(state),
      submitting: isSubmitting(state),
      userId,
      isStudentOf: (groupId) => isSupervisorOf(userId, groupId)(state),
      formValues: getFormValues('editExercise')(state),
      runtimeEnvironments: runtimeEnvironmentsSelector(state)
    };
  },
  (dispatch, { params: { exerciseId } }) => ({
    push: (url) => dispatch(push(url)),
    reset: () => dispatch(reset('editExercise')),
    loadAsync: () => Promise.all([
      dispatch(fetchExerciseIfNeeded(exerciseId)),
      dispatch(fetchRuntimeEnvironments())
    ]),
    editExercise: (data) => {
      return dispatch(editExercise(exerciseId, data));
    },
    editSolutionRuntimeConfigs: (data) => {
      return dispatch(editRuntimeConfigs(exerciseId, data));
    }
  })
)(EditExercise);
