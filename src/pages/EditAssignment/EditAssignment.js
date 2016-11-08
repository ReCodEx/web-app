import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { reset, getFormValues } from 'redux-form';
import moment from 'moment';
import PageContent from '../../components/PageContent';

import ResourceRenderer from '../../components/ResourceRenderer';
import EditAssignmentForm from '../../components/Forms/EditAssignmentForm';
import EditAssignmentLimitsForm from '../../components/Forms/EditAssignmentLimitsForm';

import { fetchAssignmentIfNeeded, editAssignment } from '../../redux/modules/assignments';
import { fetchLimitsIfNeeded, editLimits } from '../../redux/modules/limits';
import { getAssignment } from '../../redux/selectors/assignments';
import { canSubmitSolution } from '../../redux/selectors/canSubmit';
import { getEnvironmentsLimits } from '../../redux/selectors/limits';
import { isSubmitting } from '../../redux/selectors/submission';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { isSupervisorOf } from '../../redux/selectors/users';

const getInitialValues = ({ firstDeadline, secondDeadline, ...rest }) => ({
  firstDeadline: moment(firstDeadline * 1000),
  secondDeadline: moment(secondDeadline * 1000),
  ...rest
});

class EditAssignment extends Component {

  componentWillMount = () => this.props.loadAsync();
  componentWillReceiveProps = (props) => {
    if (this.props.params.assignmentId !== props.params.assignmentId) {
      props.reset();
      props.loadAsync();
    }
  };

  render() {
    const { links: { ASSIGNMENT_DETAIL_URI_FACTORY } } = this.context;
    const {
      params: { assignmentId },
      assignment,
      environments,
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
        <ResourceRenderer resource={assignment}>
          {assignment => (
            <div>
              <EditAssignmentForm
                initialValues={getInitialValues(assignment)}
                onSubmit={editAssignment}
                formValues={formValues} />
              <ResourceRenderer resource={environments}>
                {environments => (
                  <EditAssignmentLimitsForm
                    initialValues={environments}
                    assignment={assignment}
                    onSubmit={editLimits} />
                )}
              </ResourceRenderer>
            </div>
          )}
        </ResourceRenderer>
      </PageContent>
    );
  }

}

EditAssignment.contextTypes = {
  links: PropTypes.object
};

EditAssignment.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  params: PropTypes.shape({
    assignmentId: PropTypes.string.isRequired
  }).isRequired,
  assignment: ImmutablePropTypes.map,
  environments: ImmutablePropTypes.map,
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
      submitting: isSubmitting(state),
      userId,
      isStudentOf: (groupId) => isSupervisorOf(userId, groupId)(state),
      canSubmit: canSubmitSolution(assignmentId)(state),
      formValues: getFormValues('editAssignment')(state)
    };
  },
  (dispatch, { params: { assignmentId } }) => ({
    push: (url) => dispatch(push(url)),
    reset: () => dispatch(reset('editAssignment')),
    loadAsync: () => Promise.all([
      dispatch(fetchAssignmentIfNeeded(assignmentId)),
      dispatch(fetchLimitsIfNeeded(assignmentId))
    ]),
    editAssignment: (data) => {
      // convert deadline times to timestamps
      data.firstDeadline = moment(data.firstDeadline).unix();
      data.secondDeadline = moment(data.secondDeadline).unix();
      return dispatch(editAssignment(assignmentId, data));
    },
    editLimits: (data) => dispatch(editLimits(assignmentId, data))
  })
)(EditAssignment);
