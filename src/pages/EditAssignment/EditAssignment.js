import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Col, Row, Alert } from 'react-bootstrap';
import { connect } from 'react-redux';
import { reset, formValueSelector, SubmissionError } from 'redux-form';
import { LinkContainer } from 'react-router-bootstrap';

import Button from '../../components/widgets/FlatButton';
import Page from '../../components/layout/Page';
import EditAssignmentForm, {
  prepareInitialValues as prepareEditFormInitialValues,
} from '../../components/forms/EditAssignmentForm';
import DeleteAssignmentButtonContainer from '../../containers/DeleteAssignmentButtonContainer';
import Box from '../../components/widgets/Box';
import HierarchyLineContainer from '../../containers/HierarchyLineContainer';
import Icon, { ResultsIcon } from '../../components/icons';
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
      links: {
        ASSIGNMENT_DETAIL_URI_FACTORY,
        GROUP_DETAIL_URI_FACTORY,
        ASSIGNMENT_STATS_URI_FACTORY,
        EXERCISE_URI_FACTORY,
      },
      match: {
        params: { assignmentId },
      },
      history: { replace },
      assignment,
      userId,
      firstDeadline,
      allowSecondDeadline,
      exerciseSync,
      runtimeEnvironments,
      visibility,
    } = this.props;

    return (
      <Page
        resource={assignment}
        title={<FormattedMessage id="app.editAssignment.title" defaultMessage="Edit assignment settings" />}
        description={
          <FormattedMessage
            id="app.editAssignment.description"
            defaultMessage="Change assignment settings and limits"
          />
        }
        breadcrumbs={[
          assignment && assignment.getIn(['data', 'exerciseId'])
            ? {
                resource: assignment,
                iconName: 'stethoscope',
                breadcrumb: assignment => ({
                  text: <FormattedMessage id="app.exercise.title" defaultMessage="Exercise" />,
                  link: EXERCISE_URI_FACTORY(assignment && assignment.exerciseId),
                }),
              }
            : {
                text: <FormattedMessage id="app.exercise.title" defaultMessage="Exercise" />,
                iconName: 'ghost',
              },
          {
            text: <FormattedMessage id="app.assignment.title" />,
            iconName: 'hourglass-start',
            link: ASSIGNMENT_DETAIL_URI_FACTORY(assignmentId),
          },
          {
            text: <FormattedMessage id="app.editAssignment.title" />,
            iconName: ['far', 'edit'],
          },
        ]}>
        {assignment =>
          assignment && (
            <React.Fragment>
              <Row>
                <Col xs={12}>
                  <HierarchyLineContainer groupId={assignment.groupId} />
                  {assignment.permissionHints.viewDetail && (
                    <p>
                      <LinkContainer to={ASSIGNMENT_STATS_URI_FACTORY(assignment.id)}>
                        <Button bsStyle="primary">
                          <ResultsIcon gapRight />
                          <FormattedMessage id="app.assignment.viewResults" defaultMessage="Student Results" />
                        </Button>
                      </LinkContainer>
                      {assignment.permissionHints.resubmitSolutions && (
                        <ResubmitAllSolutionsContainer assignmentId={assignment.id} />
                      )}
                    </p>
                  )}
                </Col>
              </Row>

              {assignment.exerciseId && assignment.permissionHints.update && (
                <AssignmentSync syncInfo={assignment.exerciseSynchronizationInfo} exerciseSync={exerciseSync} />
              )}

              {!assignment.exerciseId && assignment.permissionHints.update && (
                <Alert bsStyle="warning">
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
                </Alert>
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
                      firstDeadline={firstDeadline}
                      allowSecondDeadline={allowSecondDeadline}
                      runtimeEnvironments={envs}
                      visibility={visibility}
                      assignmentIsPublic={
                        assignment.isPublic && (!assignment.visibleFrom || assignment.visibleFrom * 1000 <= Date.now())
                      }
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
                        defaultMessage="Deleting an assignment will remove all the students submissions and you will have to contact the administrator of ReCoVid if you wanted to restore the assignment in the future."
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
            </React.Fragment>
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
  firstDeadline: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  allowSecondDeadline: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
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
        firstDeadline: editAssignmentFormSelector(state, 'firstDeadline'),
        allowSecondDeadline: editAssignmentFormSelector(state, 'allowSecondDeadline'),
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
