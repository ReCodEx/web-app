import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { reset } from 'redux-form';
import { defaultMemoize } from 'reselect';

import Page from '../../components/layout/Page';
import { ExerciseNavigation } from '../../components/layout/Navigation';
import Box from '../../components/widgets/Box';
import EditExerciseForm from '../../components/forms/EditExerciseForm';
import AttachmentFilesTableContainer from '../../containers/AttachmentFilesTableContainer';
import ExercisesTagsEditContainer from '../../containers/ExercisesTagsEditContainer';
import DeleteExerciseButtonContainer from '../../containers/DeleteExerciseButtonContainer';
import ExerciseCallouts, { exerciseCalloutsAreVisible } from '../../components/Exercises/ExerciseCallouts';

import { fetchExerciseIfNeeded, editExercise, fetchTags } from '../../redux/modules/exercises';
import { getExercise } from '../../redux/selectors/exercises';
import { isSubmitting } from '../../redux/selectors/submission';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';

import withLinks from '../../helpers/withLinks';
import {
  getLocalizedName,
  getLocalizedTextsInitialValues,
  transformLocalizedTextsFormData,
} from '../../helpers/localizedData';
import { hasPermissions } from '../../helpers/common';

const localizedTextDefaults = {
  name: '',
  text: '',
  link: '',
  description: '',
};

const prepareInitialValues = defaultMemoize(
  ({
    id,
    version,
    localizedTexts,
    difficulty,
    mergeJudgeLogs,
    isPublic,
    isLocked,
    solutionFilesLimit,
    solutionSizeLimit,
  }) => ({
    id,
    version,
    localizedTexts: getLocalizedTextsInitialValues(localizedTexts, localizedTextDefaults),
    difficulty,
    mergeJudgeLogs,
    isPublic,
    isLocked,
    solutionFilesLimit,
    solutionSizeLimit: solutionSizeLimit && Math.ceil(solutionSizeLimit / 1024), // if not null, convert B -> KiB
  })
);

class EditExercise extends Component {
  componentDidMount = () => {
    this.props.loadAsync();
    window.scrollTo(0, 0);
  };

  componentDidUpdate(prevProps) {
    if (this.props.match.params.exerciseId !== prevProps.match.params.exerciseId) {
      this.props.reset();
      this.props.loadAsync();
    }
  }

  static loadAsync = ({ exerciseId }, dispatch) =>
    Promise.all([dispatch(fetchExerciseIfNeeded(exerciseId)), dispatch(fetchTags())]);

  editExerciseSubmitHandler = formData => {
    const { exercise, editExercise } = this.props;
    const { localizedTexts, solutionSizeLimit, ...data } = formData;
    return editExercise(exercise.getIn(['data', 'version']), {
      localizedTexts: transformLocalizedTextsFormData(localizedTexts),
      solutionSizeLimit: solutionSizeLimit ? solutionSizeLimit * 1024 : null, // if not null, convert KiB -> B
      ...data,
    });
  };

  render() {
    const {
      links: { EXERCISES_URI },
      history: { replace },
      exercise,
      intl: { locale },
    } = this.props;

    return (
      <Page
        resource={exercise}
        title={exercise => getLocalizedName(exercise, locale)}
        description={<FormattedMessage id="app.editExercise.description" defaultMessage="Change exercise settings" />}>
        {exercise =>
          exercise && (
            <div>
              <ExerciseNavigation
                exerciseId={exercise.id}
                canEdit={hasPermissions(exercise, 'update')}
                canViewTests={hasPermissions(exercise, 'viewPipelines', 'viewScoreConfig')}
                canViewLimits={hasPermissions(exercise, 'viewLimits')}
                canViewAssignments={hasPermissions(exercise, 'viewAssignments')}
              />

              {exerciseCalloutsAreVisible(exercise) && (
                <Row>
                  <Col sm={12}>
                    <ExerciseCallouts {...exercise} />
                  </Col>
                </Row>
              )}

              <Row>
                <Col lg={6}>
                  <EditExerciseForm
                    initialValues={prepareInitialValues(exercise)}
                    onSubmit={this.editExerciseSubmitHandler}
                  />
                </Col>
                <Col lg={6}>
                  <AttachmentFilesTableContainer exercise={exercise} />
                  <Box title={<FormattedMessage id="app.editExercise.editTags" defaultMessage="Edit Tags" />}>
                    <ExercisesTagsEditContainer exerciseId={exercise.id} />
                  </Box>
                </Col>
              </Row>
              <br />
              {exercise.permissionHints.remove && (
                <Row>
                  <Col lg={12}>
                    <Box
                      type="danger"
                      title={
                        <FormattedMessage id="app.editExercise.deleteExercise" defaultMessage="Delete the exercise" />
                      }>
                      <div>
                        <p>
                          <FormattedMessage
                            id="app.editExercise.deleteExerciseWarning"
                            defaultMessage="Deletion of an exercise will not affect any existing assignments nor their solutions, except they could not be synchronized anymore. However, the deletion will effectively remove the exercise from all groups of residence."
                          />
                        </p>
                        <p className="text-center">
                          <DeleteExerciseButtonContainer id={exercise.id} onDeleted={() => replace(EXERCISES_URI)} />
                        </p>
                      </div>
                    </Box>
                  </Col>
                </Row>
              )}
            </div>
          )
        }
      </Page>
    );
  }
}

EditExercise.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }),
  exercise: ImmutablePropTypes.map,
  loadAsync: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  editExercise: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      exerciseId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  links: PropTypes.object.isRequired,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
};

export default withLinks(
  connect(
    (
      state,
      {
        match: {
          params: { exerciseId },
        },
      }
    ) => {
      return {
        exercise: getExercise(exerciseId)(state),
        submitting: isSubmitting(state),
        userId: loggedInUserIdSelector(state),
      };
    },
    (
      dispatch,
      {
        match: {
          params: { exerciseId },
        },
      }
    ) => ({
      reset: () => dispatch(reset('editExercise')),
      loadAsync: () => EditExercise.loadAsync({ exerciseId }, dispatch),
      editExercise: (version, data) => dispatch(editExercise(exerciseId, { ...data, version })),
    })
  )(injectIntl(EditExercise))
);
