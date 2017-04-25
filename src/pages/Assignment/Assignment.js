import React, { PropTypes, Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Col, Row } from 'react-bootstrap';
import Button from '../../components/widgets/FlatButton';
import { LinkContainer } from 'react-router-bootstrap';

import { fetchAssignmentIfNeeded } from '../../redux/modules/assignments';
import { canSubmit } from '../../redux/modules/canSubmit';
import {
  init,
  submitAssignmentSolution as submitSolution
} from '../../redux/modules/submission';

import {
  getAssignment,
  runtimeEnvironmentsSelector
} from '../../redux/selectors/assignments';
import { canSubmitSolution } from '../../redux/selectors/canSubmit';
import { isSubmitting } from '../../redux/selectors/submission';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import {
  isSuperAdmin,
  isStudentOf,
  isSupervisorOf
} from '../../redux/selectors/users';

import PageContent from '../../components/PageContent';
import ResourceRenderer from '../../components/ResourceRenderer';
import UsersNameContainer from '../../containers/UsersNameContainer';
import AssignmentDetails, {
  LoadingAssignmentDetails,
  FailedAssignmentDetails
} from '../../components/Assignments/Assignment/AssignmentDetails';

import { EditIcon, ResultsIcon } from '../../components/icons';
import LocalizedTexts from '../../components/LocalizedTexts';
import SubmitSolutionButton
  from '../../components/Assignments/SubmitSolutionButton';
import SubmitSolutionContainer from '../../containers/SubmitSolutionContainer';
import SubmissionsTableContainer
  from '../../containers/SubmissionsTableContainer';

import withLinks from '../../hoc/withLinks';

class Assignment extends Component {
  static loadAsync = ({ assignmentId }, dispatch) =>
    Promise.all([
      dispatch(fetchAssignmentIfNeeded(assignmentId)),
      dispatch(canSubmit(assignmentId))
    ]);

  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.assignmentId !== newProps.params.assignmentId) {
      newProps.loadAsync();
    }
  }

  isAfter = unixTime => {
    return unixTime * 1000 < Date.now();
  };

  render() {
    const {
      assignment,
      submitting,
      userId,
      loggedInUserId,
      init,
      isSuperAdmin,
      isStudentOf,
      isSupervisorOf,
      canSubmit,
      runtimeEnvironmentIds,
      links: { ASSIGNMENT_EDIT_URI_FACTORY, SUPERVISOR_STATS_URI_FACTORY }
    } = this.props;

    return (
      <PageContent
        title={
          <ResourceRenderer resource={assignment}>
            {assignment => <span>{assignment.name}</span>}
          </ResourceRenderer>
        }
        description={
          <FormattedMessage
            id="app.assignment.title"
            defaultMessage="Exercise assignment"
          />
        }
        breadcrumbs={[
          {
            resource: assignment,
            iconName: 'group',
            breadcrumb: assignment => ({
              text: (
                <FormattedMessage
                  id="app.group.title"
                  defaultMessage="Group detail"
                />
              ),
              link: ({ GROUP_URI_FACTORY }) =>
                GROUP_URI_FACTORY(assignment.groupId)
            })
          },
          {
            text: (
              <FormattedMessage
                id="app.assignment.title"
                defaultMessage="Exercise assignment"
              />
            ),
            iconName: 'puzzle-piece'
          }
        ]}
      >
        <ResourceRenderer
          loading={<LoadingAssignmentDetails />}
          failed={<FailedAssignmentDetails />}
          resource={assignment}
        >
          {assignment => (
            <div>
              <Row>
                <Col xs={12}>
                  {loggedInUserId !== userId &&
                    <p>
                      <UsersNameContainer userId={userId} />
                    </p>}
                  {(isSuperAdmin || isSupervisorOf(assignment.groupId)) &&
                    <p>
                      <LinkContainer
                        to={ASSIGNMENT_EDIT_URI_FACTORY(assignment.id)}
                      >
                        <Button bsStyle="warning">
                          <EditIcon />
                          {' '}
                          <FormattedMessage
                            id="app.assignment.editSettings"
                            defaultMessage="Edit assignment settings"
                          />
                        </Button>
                      </LinkContainer>
                      {' '}
                      <LinkContainer
                        to={SUPERVISOR_STATS_URI_FACTORY(assignment.id)}
                      >
                        <Button bsStyle="primary">
                          <ResultsIcon />
                          {' '}
                          <FormattedMessage
                            id="app.assignment.viewResults"
                            defaultMessage="View student results"
                          />
                        </Button>
                      </LinkContainer>
                    </p>}
                </Col>
              </Row>
              <Row>
                <Col lg={6}>
                  <div>
                    {assignment.localizedTexts.length > 0 &&
                      <LocalizedTexts locales={assignment.localizedTexts} />}
                  </div>
                </Col>
                <Col lg={6}>
                  <AssignmentDetails
                    {...assignment}
                    isAfterFirstDeadline={this.isAfter(
                      assignment.firstDeadline
                    )}
                    isAfterSecondDeadline={this.isAfter(
                      assignment.secondDeadline
                    )}
                    canSubmit={canSubmit}
                  />

                  {isStudentOf(assignment.groupId) &&
                    <div>
                      <p className="text-center">
                        <ResourceRenderer
                          loading={<SubmitSolutionButton disabled={true} />}
                          resource={canSubmit}
                        >
                          {canSubmit => (
                            <SubmitSolutionButton
                              onClick={init(assignment.id)}
                              disabled={!canSubmit}
                            />
                          )}
                        </ResourceRenderer>
                      </p>
                      <SubmitSolutionContainer
                        userId={userId}
                        id={assignment.id}
                        onSubmit={submitSolution}
                        onReset={init}
                        isOpen={submitting}
                        runtimeEnvironmentIds={runtimeEnvironmentIds}
                      />

                      <SubmissionsTableContainer
                        userId={userId}
                        assignmentId={assignment.id}
                      />
                    </div>}
                </Col>
              </Row>
            </div>
          )}
        </ResourceRenderer>
      </PageContent>
    );
  }
}

Assignment.propTypes = {
  userId: PropTypes.string.isRequired,
  loggedInUserId: PropTypes.string,
  params: PropTypes.shape({
    assignmentId: PropTypes.string.isRequired
  }),
  isSuperAdmin: PropTypes.bool,
  isStudentOf: PropTypes.func.isRequired,
  isSupervisorOf: PropTypes.func.isRequired,
  assignment: PropTypes.object,
  canSubmit: ImmutablePropTypes.map,
  submitting: PropTypes.bool.isRequired,
  init: PropTypes.func.isRequired,
  loadAsync: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  runtimeEnvironmentIds: PropTypes.array
};

export default withLinks(
  connect(
    (state, { params: { assignmentId, userId } }) => {
      const assignmentSelector = getAssignment(assignmentId);
      const environments = runtimeEnvironmentsSelector(assignmentId);
      userId = userId || loggedInUserIdSelector(state);
      return {
        assignment: assignmentSelector(state),
        submitting: isSubmitting(state),
        runtimeEnvironmentIds: environments(state).toJS(),
        userId,
        loggeInUserId: loggedInUserIdSelector(state),
        isSuperAdmin: isSuperAdmin(userId)(state),
        isStudentOf: groupId => isStudentOf(userId, groupId)(state),
        isSupervisorOf: groupId => isSupervisorOf(userId, groupId)(state),
        canSubmit: canSubmitSolution(assignmentId)(state)
      };
    },
    (dispatch, { params: { assignmentId } }) => ({
      init: userId => () => dispatch(init(userId, assignmentId)),
      loadAsync: () => Assignment.loadAsync({ assignmentId }, dispatch)
    })
  )(Assignment)
);
