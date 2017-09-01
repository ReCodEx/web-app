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

import EditExerciseForm from '../../components/forms/EditExerciseForm';
import AdditionalExerciseFilesTableContainer from '../../containers/AdditionalExerciseFilesTableContainer';
import DeleteExerciseButtonContainer from '../../containers/DeleteExerciseButtonContainer';

import {
  fetchExerciseIfNeeded,
  editExercise
} from '../../redux/modules/exercises';
import { getExercise } from '../../redux/selectors/exercises';
import { isSubmitting } from '../../redux/selectors/submission';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';

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
    Promise.all([dispatch(fetchExerciseIfNeeded(exerciseId))]);

  render() {
    const {
      links: { EXERCISES_URI, EXERCISE_URI_FACTORY },
      params: { exerciseId },
      exercise,
      editExercise,
      formValues,
      push
    } = this.props;

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
                <EditExerciseForm
                  initialValues={exercise}
                  onSubmit={formData =>
                    editExercise(exercise.version, formData)}
                  formValues={formValues}
                />
              </Col>
              <Col lg={6}>
                <AdditionalExerciseFilesTableContainer exercise={exercise} />
              </Col>
            </Row>
            <br />
            <Row>
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
  loadAsync: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  editExercise: PropTypes.func.isRequired,
  params: PropTypes.shape({
    exerciseId: PropTypes.string.isRequired
  }).isRequired,
  formValues: PropTypes.object,
  links: PropTypes.object.isRequired,
  push: PropTypes.func.isRequired
};

export default withLinks(
  connect(
    (state, { params: { exerciseId } }) => {
      return {
        exercise: getExercise(exerciseId)(state),
        submitting: isSubmitting(state),
        userId: loggedInUserIdSelector(state),
        formValues: getFormValues('editExercise')(state)
      };
    },
    (dispatch, { params: { exerciseId } }) => ({
      push: url => dispatch(push(url)),
      reset: () => dispatch(reset('editExercise')),
      loadAsync: () => EditExercise.loadAsync({ exerciseId }, dispatch),
      editExercise: (version, data) =>
        dispatch(editExercise(exerciseId, { ...data, version }))
    })
  )(EditExercise)
);
