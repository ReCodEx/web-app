import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { reset, getFormValues } from 'redux-form';

import Page from '../../components/Page';
import Box from '../../components/AdminLTE/Box';
import EditExerciseForm from '../../components/Forms/EditExerciseForm';
import EditExerciseRuntimeConfigsForm from '../../components/Forms/EditExerciseRuntimeConfigsForm';
import SupplementaryFilesTableContainer from '../../containers/SupplementaryFilesTableContainer';
import DeleteExerciseButtonContainer from '../../containers/DeleteExerciseButtonContainer';

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

  static loadAsync = ({ exerciseId }, dispatch) => Promise.all([
    dispatch(fetchExerciseIfNeeded(exerciseId)),
    dispatch(fetchRuntimeEnvironments())
  ]);

  render() {
    const { links: { EXERCISES_URI, EXERCISE_URI_FACTORY } } = this.context;
    const {
      params: { exerciseId },
      exercise,
      editExercise,
      editSolutionRuntimeConfigs,
      runtimeEnvironments,
      formValues,
      runtimesFormValues
    } = this.props;

    return (
      <Page
        resource={exercise}
        title={exercise => exercise.name}
        description={<FormattedMessage id='app.editExercise.description' defaultMessage='Change exercise settings' />}
        breadcrumbs={[
          {
            text: <FormattedMessage id='app.exercise.title' defaultMessage='Exercise' />,
            iconName: 'puzzle-piece',
            link: EXERCISE_URI_FACTORY(exerciseId)
          },
          {
            text: <FormattedMessage id='app.editExercise.title' defaultMessage='Edit exercise' />,
            iconName: 'pencil'
          }
        ]}>
        {exercise => (
          <div>
            <EditExerciseForm
              initialValues={exercise}
              onSubmit={editExercise}
              formValues={formValues} />

            <SupplementaryFilesTableContainer exerciseId={exerciseId} />

            <EditExerciseRuntimeConfigsForm
              runtimeEnvironments={runtimeEnvironments}
              runtimeConfigs={runtimesFormValues ? runtimesFormValues.runtimeConfigs : {}}
              initialValues={{runtimeConfigs: exercise.solutionRuntimeConfigs}}
              onSubmit={editSolutionRuntimeConfigs} />
            <br />
            <Box
              type='danger'
              title={<FormattedMessage id='app.editAssignment.deleteAssignment' defaultMessage='Delete the assignment' />}>
              <div>
                <p>
                  <FormattedMessage id='app.editAssgintent.deleteAssignmentWarning' defaultMessage='Deleting an assignment will remove all the students submissions and you will have to contact the administrator of ReCodEx if you wanted to restore the assignment in the future.' />
                </p>
                <p className='text-center'>
                  <DeleteExerciseButtonContainer id={exercise.id} onDeleted={() => push(EXERCISES_URI)} />
                </p>
              </div>
            </Box>
          </div>
        )}
      </Page>
    );
  }

}

EditExercise.contextTypes = {
  links: PropTypes.object
};

EditExercise.propTypes = {
  exercise: ImmutablePropTypes.map,
  runtimeEnvironments: PropTypes.object.isRequired,
  loadAsync: PropTypes.func.isRequired,
  editExercise: PropTypes.func.isRequired,
  editSolutionRuntimeConfigs: PropTypes.func.isRequired,
  params: PropTypes.shape({ exerciseId: PropTypes.string.isRequired }).isRequired,
  formValues: PropTypes.object,
  runtimesFormValues: PropTypes.object
};

export default connect(
  (state, { params: { exerciseId } }) => {
    const exerciseSelector = getExercise(exerciseId);
    const userId = loggedInUserIdSelector(state);
    return {
      exercise: exerciseSelector(state),
      submitting: isSubmitting(state),
      userId,
      formValues: getFormValues('editExercise')(state),
      runtimesFormValues: getFormValues('editExerciseRuntimeConfigs')(state),
      runtimeEnvironments: runtimeEnvironmentsSelector(state)
    };
  },
  (dispatch, { params: { exerciseId } }) => ({
    push: (url) => dispatch(push(url)),
    reset: () => dispatch(reset('editExercise')),
    loadAsync: () => EditExercise.loadAsync({ exerciseId }, dispatch),
    editExercise: (data) => dispatch(editExercise(exerciseId, data)),
    editSolutionRuntimeConfigs: (data) => dispatch(editRuntimeConfigs(exerciseId, data))
  })
)(EditExercise);
