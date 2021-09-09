import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { reset, formValueSelector, SubmissionError } from 'redux-form';

import Page from '../../components/layout/Page';
import { AssignmentNavigation } from '../../components/layout/Navigation';
import EditAssignmentForm, {
  prepareInitialValues as prepareEditFormInitialValues,
} from '../../components/forms/EditAssignmentForm';
import DeleteAssignmentButtonContainer from '../../containers/DeleteAssignmentButtonContainer';
import Box from '../../components/widgets/Box';
import Callout from '../../components/widgets/Callout';
import Icon, { EditAssignmentIcon } from '../../components/icons';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { LocalizedExerciseName } from '../../components/helpers/LocalizedNames';

import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { fetchAssignment, editAssignment, syncWithExercise, validateAssignment } from '../../redux/modules/assignments';
import { getAssignment } from '../../redux/selectors/assignments';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { isReady, getJsData } from '../../redux/helpers/resourceManager';
import { ResubmitAllSolutionsContainer } from '../../containers/ResubmitSolutionContainer';
import AssignmentSync from '../../components/Assignments/Assignment/AssignmentSync';
import { hasPermissions } from '../../helpers/common';

import withLinks from '../../helpers/withLinks';

class EditAssignment extends Component {
  componentDidMount = () => this.props.loadAsync();

  componentDidUpdate(prevProps) {
    if (this.props.match.params.assignmentId !== prevProps.match.params.assignmentId) {
      this.props.reset();
      this.props.loadAsync();
    }

    if (isReady(this.props.assignment)) {
      this.groupId = getJsData(this.props.assignment).groupId;
    }
  }

  static loadAsync = ({ assignmentId }, dispatch) =>
    Promise.all([dispatch(fetchAssignment(assignmentId)), dispatch(fetchRuntimeEnvironments())]);

  editAssignmentSubmitHandler = formData => {
    const { assignment, editAssignment, validateAssignment } = this.props;
    const version = assignment.getIn(['data', 'version']);

    // validate assignment version
    return validateAssignment(version)
      .then(res => res.value)
      .then(({ versionIsUpToDate }) => {
        if (versionIsUpToDate === false) {
          throw new SubmissionError({
            _error: (
              <FormattedMessage
                id="app.editAssignment.validation.versionDiffers"
                defaultMessage="Somebody has changed the assignment while you have been editing it. Please reload the page and apply your changes once more."
              />
            ),
          });
        }
      })
      .then(() => editAssignment({ ...formData, version }));
  };

  render() {
    const {
      links: { GROUP_DETAIL_URI_FACTORY },
      match: {
        params: { assignmentId },
      },
      history: { replace },
      assignment,
      userId,
      deadlines,
      exerciseSync,
      runtimeEnvironments,
      visibility,
    } = this.props;

    return (
      <Page
        resource={assignment}
        icon={<EditAssignmentIcon />}
        title={<FormattedMessage id="app.editAssignment.title" defaultMessage="Edit Assignment Settings" />}>
        {assignment =>
          assignment && (
            <>
              <AssignmentNavigation
                assignmentId={assignment.id}
                groupId={assignment.groupId}
                exerciseId={assignment.exerciseId}
                canEdit={hasPermissions(assignment, 'update')}
                canViewSolutions={hasPermissions(assignment, 'viewAssignmentSolutions')}
                canViewExercise={true}
              />

              {hasPermissions(assignment, 'resubmitSolutions') && (
                <Row>
                  <Col xs={12}>
                    <div className="mb-3">
                      <ResubmitAllSolutionsContainer assignmentId={assignment.id} />
                    </div>
                  </Col>
                </Row>
              )}

              {assignment.exerciseId && hasPermissions(assignment, 'update') && (
                <AssignmentSync syncInfo={assignment.exerciseSynchronizationInfo} exerciseSync={exerciseSync} />
              )}

              {!assignment.exerciseId && hasPermissions(assignment, 'update') && (
                <Callout variant="warning">
                  <h3 className="no-margin ">
                    <Icon icon="ghost" gapRight />
                    <FormattedMessage
                      id="app.assignment.exerciseDeleted"
                      defaultMessage="Corresponding exercise has been deleted."
                    />
                  </h3>
                  <p className="halfem-margin-top">
                    <FormattedMessage
                      id="app.assignment.exerciseDeletedInfo"
                      defaultMessage="The assignment may no longer be synchronized with the exercise and no more assignments of this exercise may be created."
                    />
                  </p>
                </Callout>
              )}

              <Box
                title={
                  <FormattedMessage
                    id="app.editAssignmentForm.title"
                    defaultMessage="Edit Assignment — {name}"
                    values={{
                      name: <LocalizedExerciseName entity={assignment} />,
                    }}
                  />
                }
                unlimitedHeight>
                <ResourceRenderer resource={runtimeEnvironments.toArray()} returnAsArray={true}>
                  {envs => (
                    <EditAssignmentForm
                      form="editAssignment"
                      userId={userId}
                      editTexts
                      initialValues={assignment ? prepareEditFormInitialValues(assignment) : {}}
                      onSubmit={this.editAssignmentSubmitHandler}
                      deadlines={deadlines}
                      runtimeEnvironments={envs}
                      visibility={visibility}
                      assignmentIsPublic={
                        assignment.isPublic && (!assignment.visibleFrom || assignment.visibleFrom * 1000 <= Date.now())
                      }
                      mergeJudgeLogs={assignment.mergeJudgeLogs}
                    />
                  )}
                </ResourceRenderer>
              </Box>

              <br />
              {assignment.permissionHints.remove && (
                <Box
                  type="danger"
                  title={
                    <FormattedMessage id="app.editAssignment.deleteAssignment" defaultMessage="Delete the assignment" />
                  }>
                  <div>
                    <p>
                      <FormattedMessage
                        id="app.editAssignment.deleteAssignmentWarning"
                        defaultMessage="Deleting an assignment will remove all the students submissions and you will have to contact the administrator of ReCodEx if you wanted to restore the assignment in the future."
                      />
                    </p>
                    <p className="text-center">
                      <DeleteAssignmentButtonContainer
                        id={assignmentId}
                        onDeleted={() => replace(GROUP_DETAIL_URI_FACTORY(this.groupId))}
                      />
                    </p>
                  </div>
                </Box>
              )}
            </>
          )
        }
      </Page>
    );
  }
}

EditAssignment.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }),
  loadAsync: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      assignmentId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  assignment: ImmutablePropTypes.map,
  userId: PropTypes.string.isRequired,
  runtimeEnvironments: ImmutablePropTypes.map,
  editAssignment: PropTypes.func.isRequired,
  deadlines: PropTypes.string,
  visibility: PropTypes.string,
  allowVisibleFrom: PropTypes.bool,
  exerciseSync: PropTypes.func.isRequired,
  validateAssignment: PropTypes.func.isRequired,
  links: PropTypes.object,
};

const editAssignmentFormSelector = formValueSelector('editAssignment');

export default withLinks(
  connect(
    (
      state,
      {
        match: {
          params: { assignmentId },
        },
      }
    ) => {
      const assignment = getAssignment(state)(assignmentId);
      return {
        assignment,
        userId: loggedInUserIdSelector(state),
        runtimeEnvironments: runtimeEnvironmentsSelector(state),
        deadlines: editAssignmentFormSelector(state, 'deadlines'),
        visibility: editAssignmentFormSelector(state, 'visibility'),
        allowVisibleFrom: editAssignmentFormSelector(state, 'allowVisibleFrom'),
      };
    },
    (
      dispatch,
      {
        match: {
          params: { assignmentId },
        },
      }
    ) => ({
      reset: () => dispatch(reset('editAssignment')),
      loadAsync: () => EditAssignment.loadAsync({ assignmentId }, dispatch),
      editAssignment: data => dispatch(editAssignment(assignmentId, data)),
      exerciseSync: () => dispatch(syncWithExercise(assignmentId)),
      validateAssignment: version => dispatch(validateAssignment(assignmentId, version)),
    })
  )(EditAssignment)
);
