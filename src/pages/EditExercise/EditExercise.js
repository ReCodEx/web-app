import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { reset, getFormValues } from 'redux-form';

import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';

import EditExerciseForm from '../../components/forms/EditExerciseForm';
import EditExerciseConfigForm from '../../components/forms/EditExerciseConfigForm/EditExerciseConfigForm';
import EditExerciseRuntimeConfigsForm from '../../components/forms/EditExerciseRuntimeConfigsForm';
import EditPipelinesForm from '../../components/forms/EditPipelinesForm';
import SupplementaryFilesTableContainer from '../../containers/SupplementaryFilesTableContainer';
import AdditionalExerciseFilesTableContainer from '../../containers/AdditionalExerciseFilesTableContainer';
import DeleteExerciseButtonContainer from '../../containers/DeleteExerciseButtonContainer';

import {
  fetchExerciseIfNeeded,
  editExercise,
  editRuntimeConfigs
} from '../../redux/modules/exercises';
import {
  fetchExerciseConfigIfNeeded,
  setExerciseConfig
} from '../../redux/modules/exerciseConfigs';
// import { fetchPipelines } from '../../redux/modules/pipelines';
import { pipelinesSelector } from '../../redux/selectors/pipelines';
import { getExercise } from '../../redux/selectors/exercises';
import { isSubmitting } from '../../redux/selectors/submission';
import { exerciseConfigSelector } from '../../redux/selectors/exerciseConfigs';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments';

import withLinks from '../../hoc/withLinks';

class EditExercise extends Component {
  componentWillMount = () => this.props.loadAsync();
  componentWillReceiveProps = props => {
    if (this.props.params.exerciseId !== props.params.exerciseId) {
      props.reset();
      props.loadAsync();
    }
  };

  static loadAsync = ({ exerciseId }, dispatch) =>
    Promise.all([
      dispatch(fetchExerciseIfNeeded(exerciseId)),
      dispatch(fetchExerciseConfigIfNeeded(exerciseId)),
      dispatch(fetchRuntimeEnvironments())
      // dispatch(fetchPipelines(exerciseId))
    ]);

  render() {
    const {
      links: { EXERCISES_URI, EXERCISE_URI_FACTORY },
      params: { exerciseId },
      exercise,
      editExercise,
      editRuntimeConfigs,
      setConfig,
      runtimeEnvironments,
      formValues,
      runtimesFormValues,
      // configFormValues,
      exerciseConfig,
      exercisePipelines,
      push
    } = this.props;

    // ~!@#$%^&*()_+
    console.log(exercisePipelines); // eslint-disable-line no-console
    const pipelines = [
      {
        name: 'pipeline1',
        boxes: JSON.stringify(
          {
            id: '8b3602c7-bcb0-4a3b-998a-30ba9d4e2a4e',
            offsetX: 0,
            offsetY: 0,
            zoom: 100,
            links: [
              {
                id: '44b9afae-c361-40d7-aa81-c6d8e02a1c65',
                _class: 'LinkModel',
                selected: false,
                type: 'default',
                source: '4120b567-5931-481a-a98a-ce2d87071ab0',
                sourcePort: '17f751b0-03cc-4af7-bc76-415980b22724',
                target: '83cc5845-d6cd-45cd-a8e0-f0d8dc807d19',
                targetPort: '262ef6d1-1ca3-49ab-9bc0-ce610834acd8',
                points: [
                  {
                    id: '54a1d4c7-142c-45ea-9fdb-938db620c226',
                    _class: 'PointModel',
                    selected: false,
                    x: 158.640625,
                    y: 132.5
                  },
                  {
                    id: '0eecb27d-9bca-456c-b55d-e30ed9e44af5',
                    _class: 'PointModel',
                    selected: false,
                    x: 409.5,
                    y: 132.5
                  }
                ],
                extras: {}
              }
            ],
            nodes: [
              {
                id: '4120b567-5931-481a-a98a-ce2d87071ab0',
                _class: 'DefaultNodeModel',
                selected: false,
                type: 'default',
                x: 100,
                y: 100,
                extras: {},
                ports: [
                  {
                    id: '17f751b0-03cc-4af7-bc76-415980b22724',
                    _class: 'DefaultPortModel',
                    selected: false,
                    name: 'out-1',
                    parentNode: '4120b567-5931-481a-a98a-ce2d87071ab0',
                    links: ['44b9afae-c361-40d7-aa81-c6d8e02a1c65'],
                    in: false,
                    label: 'Out'
                  }
                ],
                name: 'Node 1',
                color: 'rgb(0,192,255)'
              },
              {
                id: '83cc5845-d6cd-45cd-a8e0-f0d8dc807d19',
                _class: 'DefaultNodeModel',
                selected: false,
                type: 'default',
                x: 400,
                y: 100,
                extras: {},
                ports: [
                  {
                    id: '262ef6d1-1ca3-49ab-9bc0-ce610834acd8',
                    _class: 'DefaultPortModel',
                    selected: false,
                    name: 'in-1',
                    parentNode: '83cc5845-d6cd-45cd-a8e0-f0d8dc807d19',
                    links: ['44b9afae-c361-40d7-aa81-c6d8e02a1c65'],
                    in: true,
                    label: 'IN'
                  }
                ],
                name: 'Node 2',
                color: 'rgb(192,255,0)'
              }
            ]
          },
          null,
          '  '
        )
      }
    ];
    // ~!@#$%^&*()_+

    return (
      <Page
        resource={exercise}
        title={exercise => exercise.name}
        description={
          <FormattedMessage
            id="app.editExercise.description"
            defaultMessage="Change exercise settings"
          />
        }
        breadcrumbs={[
          {
            text: (
              <FormattedMessage
                id="app.exercise.title"
                defaultMessage="Exercise"
              />
            ),
            iconName: 'puzzle-piece',
            link: EXERCISE_URI_FACTORY(exerciseId)
          },
          {
            text: (
              <FormattedMessage
                id="app.editExercise.title"
                defaultMessage="Edit exercise"
              />
            ),
            iconName: 'pencil'
          }
        ]}
      >
        {exercise =>
          <div>
            <Row>
              <Col lg={6}>
                <Row>
                  <Col lg={12}>
                    <EditExerciseForm
                      exercise={exercise}
                      initialValues={exercise}
                      onSubmit={formData =>
                        editExercise(exercise.version, formData)}
                      formValues={formValues}
                    />
                  </Col>
                </Row>
              </Col>
              <Col lg={6}>
                <Row>
                  <Col lg={12}>
                    <SupplementaryFilesTableContainer exercise={exercise} />
                  </Col>
                </Row>
                <Row>
                  <Col lg={12}>
                    <AdditionalExerciseFilesTableContainer
                      exercise={exercise}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col lg={12}>
                    <Box
                      title={
                        <FormattedMessage
                          id="app.editExercise.editRuntimeConfig"
                          defaultMessage="Edit runtime configurations"
                        />
                      }
                      unlimitedHeight
                    >
                      <EditExerciseRuntimeConfigsForm
                        runtimeEnvironments={runtimeEnvironments}
                        runtimeConfigs={
                          runtimesFormValues
                            ? runtimesFormValues.runtimeConfigs
                            : [{}]
                        }
                        initialValues={{
                          runtimeConfigs: exercise.runtimeConfigs
                        }}
                        onSubmit={editRuntimeConfigs}
                      />
                    </Box>
                  </Col>
                </Row>
              </Col>
            </Row>
            <br />
            <Row>
              <Col lg={12}>
                <Box
                  title={
                    <FormattedMessage
                      id="app.editExercise.editTestConfig"
                      defaultMessage="Edit configurations"
                    />
                  }
                  unlimitedHeight
                >
                  <ResourceRenderer resource={exerciseConfig}>
                    {config =>
                      <EditExerciseConfigForm
                        runtimeEnvironments={runtimeEnvironments}
                        // testConfigs={
                        //   configFormValues ? configFormValues.testConfigs : [{}]
                        // }
                        initialValues={{ config: config }}
                        onSubmit={setConfig}
                      />}
                  </ResourceRenderer>
                </Box>
                {/*
                <ResourceRenderer resource={exercisePipelines}>
                  {pipelines =>
                */}
                <EditPipelinesForm
                  pipelines={pipelines}
                  initialValues={{ pipelines }}
                />
                {/* }
                </ResourceRenderer>
                */}
              </Col>
              <Col lg={12}>
                <Box
                  type="danger"
                  title={
                    <FormattedMessage
                      id="app.editExercise.deleteExercise"
                      defaultMessage="Delete the exercise"
                    />
                  }
                >
                  <div>
                    <p>
                      <FormattedMessage
                        id="app.editExercise.deleteExerciseWarning"
                        defaultMessage="Deleting an exercise will remove all the students submissions and all assignments."
                      />
                    </p>
                    <p className="text-center">
                      <DeleteExerciseButtonContainer
                        id={exercise.id}
                        onDeleted={() => push(EXERCISES_URI)}
                      />
                    </p>
                  </div>
                </Box>
              </Col>
            </Row>
          </div>}
      </Page>
    );
  }
}

EditExercise.propTypes = {
  exercise: ImmutablePropTypes.map,
  runtimeEnvironments: PropTypes.object.isRequired,
  loadAsync: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  editExercise: PropTypes.func.isRequired,
  setConfig: PropTypes.func.isRequired,
  editRuntimeConfigs: PropTypes.func.isRequired,
  params: PropTypes.shape({
    exerciseId: PropTypes.string.isRequired
  }).isRequired,
  formValues: PropTypes.object,
  runtimesFormValues: PropTypes.object,
  // configFormValues: PropTypes.object,
  exerciseConfig: PropTypes.object,
  exercisePipelines: ImmutablePropTypes.map,
  links: PropTypes.object.isRequired,
  push: PropTypes.func.isRequired
};

export default withLinks(
  connect(
    (state, { params: { exerciseId } }) => {
      const exerciseSelector = getExercise(exerciseId);
      const userId = loggedInUserIdSelector(state);
      return {
        exercise: exerciseSelector(state),
        submitting: isSubmitting(state),
        userId,
        formValues: getFormValues('editExercise')(state),
        runtimesFormValues: getFormValues('editExerciseRuntimeConfigs')(state),
        // configFormValues: getFormValues('editExerciseConfig')(state),
        runtimeEnvironments: runtimeEnvironmentsSelector(state),
        exercisePipelines: pipelinesSelector(exerciseId)(state),
        exerciseConfig: exerciseConfigSelector(exerciseId)(state)
      };
    },
    (dispatch, { params: { exerciseId } }) => ({
      push: url => dispatch(push(url)),
      reset: () => dispatch(reset('editExercise')),
      loadAsync: () => EditExercise.loadAsync({ exerciseId }, dispatch),
      editExercise: (version, data) =>
        dispatch(editExercise(exerciseId, { ...data, version })),
      editRuntimeConfigs: data =>
        dispatch(editRuntimeConfigs(exerciseId, data)),
      setConfig: data => dispatch(setExerciseConfig(exerciseId, data))
    })
  )(EditExercise)
);
