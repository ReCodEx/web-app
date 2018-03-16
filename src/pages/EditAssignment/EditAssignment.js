import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { reset, formValueSelector } from 'redux-form';
import moment from 'moment';
import { LinkContainer } from 'react-router-bootstrap';
import { defaultMemoize } from 'reselect';

import Button from '../../components/widgets/FlatButton';
import Page from '../../components/layout/Page';
import EditAssignmentForm from '../../components/forms/EditAssignmentForm';
import DeleteAssignmentButtonContainer from '../../containers/DeleteAssignmentButtonContainer';
import Box from '../../components/widgets/Box';
import HierarchyLineContainer from '../../containers/HierarchyLineContainer';
import { ResultsIcon } from '../../components/icons';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';

import {
  fetchAssignment,
  editAssignment,
  syncWithExercise
} from '../../redux/modules/assignments';
import { getAssignment } from '../../redux/selectors/assignments';
import { canSubmitSolution } from '../../redux/selectors/canSubmit';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments';
import { isSubmitting } from '../../redux/selectors/submission';
import { isSupervisorOf, isAdminOf } from '../../redux/selectors/users';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { isReady, getJsData } from '../../redux/helpers/resourceManager';
import { ResubmitAllSolutionsContainer } from '../../containers/ResubmitSolutionContainer';
import AssignmentSync from '../../components/Assignments/Assignment/AssignmentSync';
import { getLocalizedTextsLocales } from '../../helpers/getLocalizedData';

import withLinks from '../../helpers/withLinks';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';

class EditAssignment extends Component {
  componentWillMount = () => this.props.loadAsync();
  componentWillReceiveProps = nextProps => {
    if (this.props.params.assignmentId !== nextProps.params.assignmentId) {
      nextProps.reset();
      nextProps.loadAsync();
    }

    if (isReady(nextProps.assignment)) {
      this.groupId = getJsData(nextProps.assignment).groupId;
    }
  };

  static loadAsync = ({ assignmentId }, dispatch) =>
    Promise.all([
      dispatch(fetchAssignment(assignmentId)),
      dispatch(fetchRuntimeEnvironments())
    ]);

  getInitialValues = defaultMemoize(
    ({
      firstDeadline,
      secondDeadline,
      pointsPercentualThreshold,
      disabledRuntimeEnvironmentsIds,
      ...rest
    }) => ({
      firstDeadline: moment.unix(firstDeadline),
      secondDeadline: moment.unix(secondDeadline),
      pointsPercentualThreshold: pointsPercentualThreshold * 100,
      disabledRuntime: disabledRuntimeEnvironmentsIds.reduce(
        (result, item, index, array) => {
          result[item] = true;
          return result;
        },
        {}
      ),
      ...rest
    })
  );

  editAssignmentSubmitHandler = formData => {
    const { assignment, editAssignment } = this.props;

    const disabledEnvironments = formData.disabledRuntime
      ? Object.keys(formData.disabledRuntime).filter(
        key => formData.disabledRuntime[key] === true
      )
      : [];

    delete formData['disabledRuntime'];
    formData['disabledRuntimeEnvironmentIds'] = disabledEnvironments;

    return editAssignment(assignment.getIn(['data', 'version']), formData);
  };

  render() {
    const {
      links: {
        ASSIGNMENT_DETAIL_URI_FACTORY,
        GROUP_DETAIL_URI_FACTORY,
        SUPERVISOR_STATS_URI_FACTORY,
        EXERCISE_URI_FACTORY
      },
      params: { assignmentId },
      push,
      assignment,
      isSupervisorOf,
      isAdminOf,
      firstDeadline,
      allowSecondDeadline,
      localizedTexts,
      exerciseSync,
      runtimeEnvironments
    } = this.props;

    return (
      <Page
        resource={assignment}
        title={
          <FormattedMessage
            id="app.editAssignment.title"
            defaultMessage="Edit assignment settings"
          />
        }
        description={
          <FormattedMessage
            id="app.editAssignment.description"
            defaultMessage="Change assignment settings and limits"
          />
        }
        breadcrumbs={[
          {
            resource: assignment,
            iconName: 'puzzle-piece',
            breadcrumb: assignment => ({
              text: (
                <FormattedMessage
                  id="app.exercise.title"
                  defaultMessage="Exercise"
                />
              ),
              link: EXERCISE_URI_FACTORY(assignment && assignment.exerciseId)
            })
          },
          {
            text: <FormattedMessage id="app.assignment.title" />,
            iconName: 'hourglass-start',
            link: ASSIGNMENT_DETAIL_URI_FACTORY(assignmentId)
          },
          {
            text: <FormattedMessage id="app.editAssignment.title" />,
            iconName: 'pencil'
          }
        ]}
      >
        {assignment =>
          assignment &&
          <div>
            <Row>
              <Col xs={12}>
                <HierarchyLineContainer groupId={assignment.groupId} />
                {(isAdminOf(assignment.groupId) ||
                  isSupervisorOf(assignment.groupId)) &&
                  <p>
                    <LinkContainer
                      to={SUPERVISOR_STATS_URI_FACTORY(assignment.id)}
                    >
                      <Button bsStyle="primary">
                        <ResultsIcon />{' '}
                        <FormattedMessage
                          id="app.assignment.viewResults"
                          defaultMessage="Student Results"
                        />
                      </Button>
                    </LinkContainer>
                    <ResubmitAllSolutionsContainer
                      assignmentId={assignment.id}
                    />
                  </p>}
              </Col>
            </Row>
            {(isAdminOf(assignment.groupId) ||
              isSupervisorOf(assignment.groupId)) &&
              <AssignmentSync
                syncInfo={assignment.exerciseSynchronizationInfo}
                exerciseSync={exerciseSync}
              />}

            <ResourceRenderer
              resource={runtimeEnvironments.toArray()}
              returnAsArray={true}
            >
              {envs =>
                <EditAssignmentForm
                  assignment={assignment}
                  initialValues={
                    assignment ? this.getInitialValues(assignment) : {}
                  }
                  onSubmit={this.editAssignmentSubmitHandler}
                  firstDeadline={firstDeadline}
                  allowSecondDeadline={allowSecondDeadline}
                  localizedTextsLocales={getLocalizedTextsLocales(
                    localizedTexts
                  )}
                  runtimeEnvironments={envs}
                />}
            </ResourceRenderer>

            <br />
            <Box
              type="danger"
              title={
                <FormattedMessage
                  id="app.editAssignment.deleteAssignment"
                  defaultMessage="Delete the assignment"
                />
              }
            >
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
                    onDeleted={() =>
                      push(GROUP_DETAIL_URI_FACTORY(this.groupId))}
                  />
                </p>
              </div>
            </Box>
          </div>}
      </Page>
    );
  }
}

EditAssignment.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  params: PropTypes.shape({
    assignmentId: PropTypes.string.isRequired
  }).isRequired,
  assignment: ImmutablePropTypes.map,
  runtimeEnvironments: ImmutablePropTypes.map,
  editAssignment: PropTypes.func.isRequired,
  firstDeadline: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  allowSecondDeadline: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  localizedTexts: PropTypes.array,
  exerciseSync: PropTypes.func.isRequired,
  links: PropTypes.object,
  isSupervisorOf: PropTypes.func.isRequired,
  isAdminOf: PropTypes.func.isRequired
};

const editAssignmentFormSelector = formValueSelector('editAssignment');

export default connect(
  (state, { params: { assignmentId } }) => {
    const loggedInUserId = loggedInUserIdSelector(state);
    return {
      assignment: getAssignment(state)(assignmentId),
      runtimeEnvironments: runtimeEnvironmentsSelector(state),
      submitting: isSubmitting(state),
      canSubmit: canSubmitSolution(assignmentId)(state),
      firstDeadline: editAssignmentFormSelector(state, 'firstDeadline'),
      allowSecondDeadline: editAssignmentFormSelector(
        state,
        'allowSecondDeadline'
      ),
      localizedTexts: editAssignmentFormSelector(state, 'localizedTexts'),
      isSupervisorOf: groupId => isSupervisorOf(loggedInUserId, groupId)(state),
      isAdminOf: groupId => isAdminOf(loggedInUserId, groupId)(state)
    };
  },
  (dispatch, { params: { assignmentId } }) => ({
    push: url => dispatch(push(url)),
    reset: () => dispatch(reset('editAssignment')),
    loadAsync: () => EditAssignment.loadAsync({ assignmentId }, dispatch),
    editAssignment: (version, data) => {
      // convert deadline times to timestamps
      const processedData = Object.assign({}, data, {
        firstDeadline: moment(data.firstDeadline).unix(),
        secondDeadline: moment(data.secondDeadline).unix(),
        submissionsCountLimit: Number(data.submissionsCountLimit),
        version
      });
      if (!processedData.allowSecondDeadline) {
        delete processedData.secondDeadline;
        delete processedData.maxPointsBeforeSecondDeadline;
      }
      return dispatch(editAssignment(assignmentId, processedData));
    },
    exerciseSync: () => dispatch(syncWithExercise(assignmentId))
  })
)(withLinks(EditAssignment));
