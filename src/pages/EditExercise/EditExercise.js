import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { reset, getFormValues } from 'redux-form';

import Page from '../../components/Page';
import Box from '../../components/AdminLTE/Box';
import ResourceRenderer from '../../components/ResourceRenderer';

import EditExerciseForm from '../../components/Forms/EditExerciseForm';
import EditExerciseRuntimeConfigsForm from '../../components/Forms/EditExerciseRuntimeConfigsForm';
import EditExerciseLimitsForm from '../../components/Forms/EditExerciseLimitsForm';
import SupplementaryFilesTableContainer from '../../containers/SupplementaryFilesTableContainer';
import DeleteExerciseButtonContainer from '../../containers/DeleteExerciseButtonContainer';

import { fetchExercise, editExercise, editRuntimeConfigs } from '../../redux/modules/exercises';
import { fetchLimits, editLimits } from '../../redux/modules/limits';
import { getExercise } from '../../redux/selectors/exercises';
import { isSubmitting } from '../../redux/selectors/submission';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments';
import { getEnvironmentsLimits } from '../../redux/selectors/limits';

class EditExercise extends Component {

  componentWillMount = () => this.props.loadAsync();
  componentWillReceiveProps = (props) => {
    if (this.props.params.exerciseId !== props.params.exerciseId) {
      props.reset();
      props.loadAsync();
    }
  };

  static loadAsync = ({ exerciseId }, dispatch) => Promise.all([
    dispatch(fetchExercise(exerciseId)),
    dispatch(fetchLimits(exerciseId)),
    dispatch(fetchRuntimeEnvironments())
  ]);

  render() {
    const { links: { EXERCISES_URI, EXERCISE_URI_FACTORY } } = this.context;
    const {
      params: { exerciseId },
      exercise,
      editExercise,
      editRuntimeConfigs,
      runtimeEnvironments,
      environments,
      editLimits,
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
            <Row>
              <Col lg={6}>
                <EditExerciseForm
                  exercise={exercise}
                  initialValues={exercise}
                  onSubmit={(formData) => editExercise(exercise.version, formData)}
                  formValues={formValues} />
              </Col>
              <Col lg={6}>
                <Row>
                  <Col lg={12}>
                    <SupplementaryFilesTableContainer exerciseId={exerciseId} />
                  </Col>
                </Row>
                <Row>
                  <Col lg={12}>
                    <EditExerciseRuntimeConfigsForm
                      runtimeEnvironments={runtimeEnvironments}
                      runtimeConfigs={runtimesFormValues ? runtimesFormValues.runtimeConfigs : [{}]}
                      initialValues={{runtimeConfigs: exercise.runtimeConfigs}}
                      onSubmit={editRuntimeConfigs} />
                  </Col>
                </Row>
                <Row>
                  <Col lg={12}>
                    <ResourceRenderer resource={environments}>
                      {environments => (
                        <EditExerciseLimitsForm
                          initialValues={environments}
                          runtimeEnvironments={runtimeEnvironments}
                          exercise={exercise}
                          onSubmit={editLimits} />
                      )}
                    </ResourceRenderer>
                  </Col>
                </Row>
              </Col>
            </Row>
            <br />
            <Box
              type='danger'
              title={<FormattedMessage id='app.editExercise.deleteExercise' defaultMessage='Delete the exercise' />}>
              <div>
                <p>
                  <FormattedMessage id='app.editExercise.deleteExerciseWarning' defaultMessage='Deleting an exercise will remove all the students submissions and all assignments.' />
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
  editRuntimeConfigs: PropTypes.func.isRequired,
  params: PropTypes.shape({ exerciseId: PropTypes.string.isRequired }).isRequired,
  environments: ImmutablePropTypes.map,
  editLimits: PropTypes.func.isRequired,
  formValues: PropTypes.object,
  runtimesFormValues: PropTypes.object
};

export default connect(
  (state, { params: { exerciseId } }) => {
    const exerciseSelector = getExercise(exerciseId);
    const environmentsSelector = getEnvironmentsLimits(exerciseId);
    const userId = loggedInUserIdSelector(state);
    return {
      exercise: exerciseSelector(state),
      submitting: isSubmitting(state),
      userId,
      formValues: getFormValues('editExercise')(state),
      runtimesFormValues: getFormValues('editExerciseRuntimeConfigs')(state),
      runtimeEnvironments: runtimeEnvironmentsSelector(state),
      environments: environmentsSelector(state)
    };
  },
  (dispatch, { params: { exerciseId } }) => ({
    push: (url) => dispatch(push(url)),
    reset: () => dispatch(reset('editExercise')),
    loadAsync: () => EditExercise.loadAsync({ exerciseId }, dispatch),
    editExercise: (version, data) => dispatch(editExercise(exerciseId, { ...data, version })),
    editRuntimeConfigs: (data) => dispatch(editRuntimeConfigs(exerciseId, data)),
    editLimits: (data) => dispatch(editLimits(exerciseId, data))
  })
)(EditExercise);
