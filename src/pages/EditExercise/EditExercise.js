import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
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
import ArchiveExerciseButtonContainer from '../../containers/ArchiveExerciseButtonContainer';
import ExerciseCallouts, { exerciseCalloutsAreVisible } from '../../components/Exercises/ExerciseCallouts';
import EditExerciseUsers from '../../components/Exercises/EditExerciseUsers';
import { EditExerciseIcon } from '../../components/icons';

import { fetchExerciseIfNeeded, editExercise, fetchTags } from '../../redux/modules/exercises';
import { getExercise } from '../../redux/selectors/exercises';
import { isSubmitting } from '../../redux/selectors/submission';
import { loggedInUserSelector } from '../../redux/selectors/users';

import { getLocalizedTextsInitialValues, transformLocalizedTextsFormData } from '../../helpers/localizedData';
import { safeGet } from '../../helpers/common';
import withLinks from '../../helpers/withLinks';
import { withRouterProps } from '../../helpers/withRouter';

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
  componentDidMount() {
    this.props.loadAsync();
    window.scrollTo(0, 0);
  }

  componentDidUpdate(prevProps) {
    if (this.props.params.exerciseId !== prevProps.params.exerciseId) {
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
      navigate,
      exercise,
      loggedUser,
    } = this.props;

    return (
      <Page
        resource={[exercise, loggedUser]}
        icon={<EditExerciseIcon />}
        title={<FormattedMessage id="app.editExercise.title" defaultMessage="Change Basic Exercise Settings" />}>
        {(exercise, loggedUser) =>
          exercise &&
          loggedUser && (
            <div>
              <ExerciseNavigation exercise={exercise} />

              {exerciseCalloutsAreVisible(exercise) && (
                <Row>
                  <Col sm={12}>
                    <ExerciseCallouts {...exercise} />
                  </Col>
                </Row>
              )}

              {exercise.permissionHints.update && (
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

                    {exercise.permissionHints.changeAuthor &&
                      safeGet(loggedUser, ['privateData', 'instancesIds', 0]) && (
                        <EditExerciseUsers
                          exercise={exercise}
                          instanceId={safeGet(loggedUser, ['privateData', 'instancesIds', 0])}
                        />
                      )}
                  </Col>
                </Row>
              )}

              {exercise.permissionHints.archive && (
                <Row>
                  <Col lg={12}>
                    <Box
                      type="warning"
                      title={
                        <FormattedMessage id="app.editExercise.archiveTitle" defaultMessage="Change archived status" />
                      }>
                      <Row className="align-items-center">
                        <Col xs={false} sm="auto">
                          <ArchiveExerciseButtonContainer id={exercise.id} size="lg" className="m-2" />
                        </Col>
                        <Col xs={12} sm className="text-muted">
                          <FormattedMessage
                            id="app.editExercise.archiveExplain"
                            defaultMessage="Archived exercises are not listed by default, cannot be modified, and cannot be assigned. Exercise archive status has no impact on existing assignments. The archiving of exercises is not directly related to group archiving (although they share a similar purpose)."
                          />
                        </Col>
                      </Row>
                    </Box>
                  </Col>
                </Row>
              )}

              {exercise.permissionHints.remove && (
                <Row>
                  <Col lg={12}>
                    <Box
                      type="danger"
                      title={
                        <FormattedMessage id="app.editExercise.deleteExercise" defaultMessage="Delete the exercise" />
                      }>
                      <Row className="align-items-center">
                        <Col xs={false} sm="auto">
                          <DeleteExerciseButtonContainer
                            id={exercise.id}
                            size="lg"
                            className="m-2"
                            onDeleted={() => navigate(EXERCISES_URI, { replace: true })}
                          />
                        </Col>
                        <Col xs={12} sm className="text-muted">
                          <FormattedMessage
                            id="app.editExercise.deleteExerciseWarning"
                            defaultMessage="Deletion of an exercise will not affect any existing assignments nor their solutions, except they could not be synchronized anymore. However, the deletion will effectively remove the exercise from all groups of residence."
                          />
                        </Col>
                      </Row>
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
  exercise: ImmutablePropTypes.map,
  loggedUser: ImmutablePropTypes.map,
  loadAsync: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  editExercise: PropTypes.func.isRequired,
  params: PropTypes.shape({
    exerciseId: PropTypes.string.isRequired,
  }).isRequired,
  links: PropTypes.object.isRequired,
  navigate: withRouterProps.navigate,
};

export default withLinks(
  connect(
    (state, { params: { exerciseId } }) => ({
      exercise: getExercise(exerciseId)(state),
      submitting: isSubmitting(state),
      loggedUser: loggedInUserSelector(state),
    }),
    (dispatch, { params: { exerciseId } }) => ({
      reset: () => dispatch(reset('editExercise')),
      loadAsync: () => EditExercise.loadAsync({ exerciseId }, dispatch),
      editExercise: (version, data) => dispatch(editExercise(exerciseId, { ...data, version })),
    })
  )(EditExercise)
);
