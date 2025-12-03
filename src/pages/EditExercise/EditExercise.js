import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { reset } from 'redux-form';
import { lruMemoize } from 'reselect';

import Page from '../../components/layout/Page';
import { ExerciseNavigation } from '../../components/layout/Navigation';
import Box from '../../components/widgets/Box';
import EditExerciseForm from '../../components/forms/EditExerciseForm';
import ExerciseFilesLinksContainer from '../../containers/ExerciseFilesLinksContainer';
import AttachmentFilesTableContainer from '../../containers/AttachmentFilesTableContainer';
import ExerciseGroups from '../../components/Exercises/ExerciseGroups';
import ExercisesTagsEditContainer from '../../containers/ExercisesTagsEditContainer';
import DeleteExerciseButtonContainer from '../../containers/DeleteExerciseButtonContainer';
import ArchiveExerciseButtonContainer from '../../containers/ArchiveExerciseButtonContainer';
import ExerciseCallouts, { exerciseCalloutsAreVisible } from '../../components/Exercises/ExerciseCallouts';
import ExerciseButtons from '../../components/Exercises/ExerciseButtons';
import EditExerciseUsers from '../../components/Exercises/EditExerciseUsers';
import { EditExerciseIcon } from '../../components/icons';

import {
  fetchExerciseIfNeeded,
  editExercise,
  fetchTags,
  attachExerciseToGroup,
  detachExerciseFromGroup,
  sendNotification,
} from '../../redux/modules/exercises.js';
import { fetchAllGroups } from '../../redux/modules/groups.js';
import { fetchByIds } from '../../redux/modules/users.js';
import {
  getExercise,
  getExerciseAttachingGroupId,
  getExerciseDetachingGroupId,
} from '../../redux/selectors/exercises.js';
import { isSubmitting } from '../../redux/selectors/submission.js';
import { loggedInUserSelector } from '../../redux/selectors/users.js';
import { getGroupsAdmins, groupDataAccessorSelector } from '../../redux/selectors/groups.js';

import { getLocalizedTextsInitialValues, transformLocalizedTextsFormData } from '../../helpers/localizedData.js';
import { safeGet } from '../../helpers/common.js';
import withLinks from '../../helpers/withLinks.js';
import { withRouterProps } from '../../helpers/withRouter.js';

const localizedTextDefaults = {
  name: '',
  text: '',
  link: '',
  description: '',
};

const prepareInitialValues = lruMemoize(
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
  static customLoadGroups = true; // Marker for the App async load, that we will load groups ourselves.

  static loadAsync = ({ exerciseId }, dispatch) =>
    Promise.all([
      dispatch(fetchExerciseIfNeeded(exerciseId)),
      dispatch(fetchAllGroups({ archived: true })).then(({ value: groups }) =>
        dispatch(fetchByIds(getGroupsAdmins(groups)))
      ),
      dispatch(fetchTags()),
    ]);

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
      attachingGroupId,
      detachingGroupId,
      attachExerciseToGroup,
      detachExerciseFromGroup,
      sendNotification,
      groupDataAccessor,
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

              <ExerciseButtons {...exercise} sendNotification={sendNotification} />

              {exercise.permissionHints.update && (
                <Row>
                  <Col lg={6}>
                    <EditExerciseForm
                      initialValues={prepareInitialValues(exercise)}
                      onSubmit={this.editExerciseSubmitHandler}
                      localizedTextsLinks={exercise.localizedTextsLinks}
                    />
                  </Col>
                  <Col lg={6}>
                    <ExerciseFilesLinksContainer exercise={exercise} />

                    <AttachmentFilesTableContainer exercise={exercise} />

                    {safeGet(loggedUser, ['privateData', 'instancesIds', 0]) && (
                      <EditExerciseUsers
                        exercise={exercise}
                        instanceId={safeGet(loggedUser, ['privateData', 'instancesIds', 0])}
                      />
                    )}

                    <ExerciseGroups
                      showButtons
                      groupsIds={exercise.groupsIds}
                      attachingGroupId={attachingGroupId}
                      detachingGroupId={detachingGroupId}
                      attachExerciseToGroup={attachExerciseToGroup}
                      detachExerciseFromGroup={detachExerciseFromGroup}
                      groupDataAccessor={groupDataAccessor}
                    />

                    <Box title={<FormattedMessage id="app.editExercise.editTags" defaultMessage="Edit Tags" />}>
                      <ExercisesTagsEditContainer exerciseId={exercise.id} />
                    </Box>
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
                        <Col xs={12} sm className="text-body-secondary">
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
                        <Col xs={12} sm className="text-body-secondary">
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
  attachingGroupId: PropTypes.string,
  detachingGroupId: PropTypes.string,
  groupDataAccessor: PropTypes.func.isRequired,
  loadAsync: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  editExercise: PropTypes.func.isRequired,
  attachExerciseToGroup: PropTypes.func.isRequired,
  detachExerciseFromGroup: PropTypes.func.isRequired,
  sendNotification: PropTypes.func.isRequired,
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
      attachingGroupId: getExerciseAttachingGroupId(exerciseId)(state),
      detachingGroupId: getExerciseDetachingGroupId(exerciseId)(state),
      groupDataAccessor: groupDataAccessorSelector(state),
    }),
    (dispatch, { params: { exerciseId } }) => ({
      reset: () => dispatch(reset('editExercise')),
      loadAsync: () => EditExercise.loadAsync({ exerciseId }, dispatch),
      editExercise: (version, data) => dispatch(editExercise(exerciseId, { ...data, version })),
      attachExerciseToGroup: groupId => dispatch(attachExerciseToGroup(exerciseId, groupId)),
      detachExerciseFromGroup: groupId => dispatch(detachExerciseFromGroup(exerciseId, groupId)),
      sendNotification: message => dispatch(sendNotification(exerciseId, message)),
    })
  )(EditExercise)
);
