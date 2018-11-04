import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { reset, formValueSelector, SubmissionError } from 'redux-form';
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
  syncWithExercise,
  validateAssignment
} from '../../redux/modules/assignments';
import { getAssignment } from '../../redux/selectors/assignments';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments';
import { getExerciseOfAssignmentJS } from '../../redux/selectors/exercises';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { fetchExerciseIfNeeded } from '../../redux/modules/exercises';
import { isReady, getJsData } from '../../redux/helpers/resourceManager';
import { ResubmitAllSolutionsContainer } from '../../containers/ResubmitSolutionContainer';
import AssignmentSync from '../../components/Assignments/Assignment/AssignmentSync';
import {
  getLocalizedTextsInitialValues,
  transformLocalizedTextsFormData
} from '../../helpers/localizedData';

import withLinks from '../../helpers/withLinks';

const localizedTextDefaults = {
  name: '',
  text: '',
  link: '',
  studentHint: ''
};

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
      dispatch(fetchAssignment(assignmentId)).then(({ value: assignment }) =>
        dispatch(fetchExerciseIfNeeded(assignment.exerciseId))
      ),
      dispatch(fetchRuntimeEnvironments())
    ]);

  getInitialValues = defaultMemoize(
    ({
      localizedTexts,
      firstDeadline,
      secondDeadline,
      pointsPercentualThreshold,
      disabledRuntimeEnvironmentIds,
      runtimeEnvironmentIds,
      ...rest
    }) => ({
      localizedTexts: getLocalizedTextsInitialValues(
        localizedTexts,
        localizedTextDefaults
      ),
      firstDeadline: moment.unix(firstDeadline),
      secondDeadline: moment.unix(secondDeadline),
      pointsPercentualThreshold: pointsPercentualThreshold * 100,
      runtimeEnvironmentIds,
      enabledRuntime: disabledRuntimeEnvironmentIds.reduce(
        (result, item) => {
          result[item] = false;
          return result;
        },
        runtimeEnvironmentIds.reduce((result, item) => {
          result[item] = true;
          return result;
        }, {})
      ),
      sendNotification: true,
      ...rest
    })
  );

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
            )
          });
        }
      })
      .then(() => {
        // prepare the data and submit them
        const { localizedTexts, enabledRuntime, ...data } = formData;
        const disabledRuntimeEnvironmentIds = enabledRuntime
          ? Object.keys(enabledRuntime).filter(
              key => enabledRuntime[key] === false
            )
          : [];

        return editAssignment(version, {
          ...data,
          localizedTexts: transformLocalizedTextsFormData(
            formData.localizedTexts
          ),
          disabledRuntimeEnvironmentIds
        });
      });
  };

  render() {
    const {
      links: {
        ASSIGNMENT_DETAIL_URI_FACTORY,
        GROUP_DETAIL_URI_FACTORY,
        ASSIGNMENT_STATS_URI_FACTORY,
        EXERCISE_URI_FACTORY
      },
      params: { assignmentId },
      push,
      assignment,
      exercise,
      firstDeadline,
      allowSecondDeadline,
      exerciseSync,
      runtimeEnvironments,
      isPublic
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
            iconName: ['far', 'edit']
          }
        ]}
      >
        {assignment =>
          assignment &&
          <React.Fragment>
            <Row>
              <Col xs={12}>
                <HierarchyLineContainer groupId={assignment.groupId} />
                {assignment.permissionHints.viewDetail &&
                  <p>
                    <LinkContainer
                      to={ASSIGNMENT_STATS_URI_FACTORY(assignment.id)}
                    >
                      <Button bsStyle="primary">
                        <ResultsIcon gapRight />
                        <FormattedMessage
                          id="app.assignment.viewResults"
                          defaultMessage="Student Results"
                        />
                      </Button>
                    </LinkContainer>
                    {assignment.permissionHints.resubmitSolutions &&
                      <ResubmitAllSolutionsContainer
                        assignmentId={assignment.id}
                      />}
                  </p>}
              </Col>
            </Row>
            {assignment.permissionHints.update &&
              <AssignmentSync
                syncInfo={assignment.exerciseSynchronizationInfo}
                exerciseSync={exerciseSync}
                isBroken={Boolean(exercise) && exercise.isBroken}
              />}

            <ResourceRenderer
              resource={runtimeEnvironments.toArray()}
              returnAsArray={true}
            >
              {envs =>
                <EditAssignmentForm
                  initialValues={
                    assignment ? this.getInitialValues(assignment) : {}
                  }
                  onSubmit={this.editAssignmentSubmitHandler}
                  firstDeadline={firstDeadline}
                  allowSecondDeadline={allowSecondDeadline}
                  runtimeEnvironments={envs}
                  beingPublished={!assignment.isPublic && isPublic}
                />}
            </ResourceRenderer>

            <br />
            {assignment.permissionHints.remove &&
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
              </Box>}
          </React.Fragment>}
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
  exercise: PropTypes.object,
  runtimeEnvironments: ImmutablePropTypes.map,
  editAssignment: PropTypes.func.isRequired,
  firstDeadline: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  allowSecondDeadline: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  isPublic: PropTypes.bool,
  exerciseSync: PropTypes.func.isRequired,
  validateAssignment: PropTypes.func.isRequired,
  links: PropTypes.object
};

const editAssignmentFormSelector = formValueSelector('editAssignment');

export default connect(
  (state, { params: { assignmentId } }) => {
    const assignment = getAssignment(state)(assignmentId);
    return {
      assignment,
      exercise: getExerciseOfAssignmentJS(state)(assignmentId),
      runtimeEnvironments: runtimeEnvironmentsSelector(state),
      firstDeadline: editAssignmentFormSelector(state, 'firstDeadline'),
      allowSecondDeadline: editAssignmentFormSelector(
        state,
        'allowSecondDeadline'
      ),
      isPublic: editAssignmentFormSelector(state, 'isPublic')
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
    exerciseSync: () => dispatch(syncWithExercise(assignmentId)),
    validateAssignment: version =>
      dispatch(validateAssignment(assignmentId, version))
  })
)(withLinks(EditAssignment));
