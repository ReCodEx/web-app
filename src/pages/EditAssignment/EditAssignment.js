import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { reset, getFormValues, initialize } from 'redux-form';
import moment from 'moment';
import PageContent from '../../components/PageContent';

import ResourceRenderer from '../../components/ResourceRenderer';
import EditAssignmentForm from '../../components/Forms/EditAssignmentForm';
import EditAssignmentLimitsForm from '../../components/Forms/EditAssignmentLimitsForm';
import DeleteAssignmentButtonContainer from '../../containers/DeleteAssignmentButtonContainer';
import Box from '../../components/AdminLTE/Box';
import { LoadingIcon, WarningIcon } from '../../components/Icons';

import { fetchAssignment, editAssignment } from '../../redux/modules/assignments';
import { fetchLimits, editLimits } from '../../redux/modules/limits';
import { getAssignment } from '../../redux/selectors/assignments';
import { canSubmitSolution } from '../../redux/selectors/canSubmit';
import { getEnvironmentsLimits } from '../../redux/selectors/limits';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments';
import { isSubmitting } from '../../redux/selectors/submission';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { isReady, getJsData } from '../../redux/helpers/resourceManager';

class EditAssignment extends Component {

  componentWillMount = () => this.props.loadAsync();
  componentWillReceiveProps = (props) => {
    if (this.props.params.assignmentId !== props.params.assignmentId) {
      props.reset();
      props.loadAsync();
    }

    if (isReady(props.assignment)) {
      this.groupId = getJsData(props.assignment).groupId;
    }
  };

  static loadAsync = ({ assignmentId }, dispatch) => Promise.all([
    dispatch(fetchAssignment(assignmentId)),
    dispatch(fetchLimits(assignmentId)),
    dispatch(fetchRuntimeEnvironments())
  ]);

  getInitialValues = ({ firstDeadline, secondDeadline, pointsPercentualThreshold, ...rest }) => ({
    firstDeadline: moment(firstDeadline * 1000),
    secondDeadline: moment(secondDeadline * 1000),
    pointsPercentualThreshold: pointsPercentualThreshold * 100,
    ...rest
  });

  render() {
    const {
      links: { ASSIGNMENT_DETAIL_URI_FACTORY, GROUP_URI_FACTORY }
    } = this.context;
    const {
      params: { assignmentId },
      push,
      assignment,
      environments,
      runtimeEnvironments,
      editAssignment,
      editLimits,
      formValues
    } = this.props;

    return (
      <PageContent
        title={<FormattedMessage id='app.editAssignment.title' defaultMessage='Edit assignment settings' />}
        description={<FormattedMessage id='app.editAssignment.description' defaultMessage='Change assignment settings and limits' />}
        breadcrumbs={[
          {
            text: <FormattedMessage id='app.assignment.title' />,
            iconName: 'puzzle-piece',
            link: ASSIGNMENT_DETAIL_URI_FACTORY(assignmentId)
          },
          {
            text: <FormattedMessage id='app.editAssignment.title' />,
            iconName: 'pencil'
          }
        ]}>
        <div>
          <ResourceRenderer
            loading={(
              <Box title={<FormattedMessage id='app.editAssignment.loading' defaultMessage='Loading ...' />}>
                <p>
                  <LoadingIcon /> <FormattedMessage id='app.editAssignment.loadingDescription' defaultMessage='Loading latest assignment settings ...' />
                </p>
              </Box>
            )}
            failed={(
              <Box title={<FormattedMessage id='app.editAssignment.failed' defaultMessage='Failed loading assignment settings' />}>
                <p>
                  <WarningIcon /> <FormattedMessage id='app.editAssignment.failedDescription' defaultMessage='Assignment settings could not have been loaded.' />
                </p>
              </Box>
            )}
            resource={assignment}>
            {data => (
              <div>
                <EditAssignmentForm
                  assignment={data}
                  initialValues={data ? this.getInitialValues(data) : {}}
                  onSubmit={(formData) => editAssignment(data.version, formData)}
                  formValues={formValues} />
                <ResourceRenderer resource={environments}>
                  {environments => (
                    <EditAssignmentLimitsForm
                      initialValues={environments}
                      runtimeEnvironments={runtimeEnvironments}
                      assignment={data}
                      onSubmit={editLimits} />
                  )}
                </ResourceRenderer>
              </div>
            )}
          </ResourceRenderer>
          <br />
          <Box
            type='danger'
            title={<FormattedMessage id='app.editAssignment.deleteAssignment' defaultMessage='Delete the assignment' />}>
            <div>
              <p>
                <FormattedMessage id='app.editAssignment.deleteAssignmentWarning' defaultMessage='Deleting an assignment will remove all the students submissions and you will have to contact the administrator of ReCodEx if you wanted to restore the assignment in the future.' />
              </p>
              <p className='text-center'>
                <DeleteAssignmentButtonContainer id={assignmentId} onDeleted={() => push(GROUP_URI_FACTORY(this.groupId))} />
              </p>
            </div>
          </Box>
        </div>
      </PageContent>
    );
  }

}

EditAssignment.contextTypes = {
  links: PropTypes.object
};

EditAssignment.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  params: PropTypes.shape({
    assignmentId: PropTypes.string.isRequired
  }).isRequired,
  assignment: ImmutablePropTypes.map,
  environments: ImmutablePropTypes.map,
  runtimeEnvironments: ImmutablePropTypes.map,
  editAssignment: PropTypes.func.isRequired,
  editLimits: PropTypes.func.isRequired,
  formValues: PropTypes.object
};

export default connect(
  (state, { params: { assignmentId } }) => {
    const assignmentSelector = getAssignment(assignmentId);
    const environmentsSelector = getEnvironmentsLimits(assignmentId);
    const userId = loggedInUserIdSelector(state);
    return {
      assignment: assignmentSelector(state),
      environments: environmentsSelector(state),
      runtimeEnvironments: runtimeEnvironmentsSelector(state),
      submitting: isSubmitting(state),
      userId,
      canSubmit: canSubmitSolution(assignmentId)(state),
      formValues: getFormValues('editAssignment')(state)
    };
  },
  (dispatch, { params: { assignmentId } }) => ({
    push: (url) => dispatch(push(url)),
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
      return dispatch(editAssignment(assignmentId, processedData))
        .then(() => dispatch(initialize('editAssignment', { ...data, version: version + 1 })));
    },
    editLimits: (data) => dispatch(editLimits(assignmentId, data))
  })
)(EditAssignment);
