import React, { Component, PropTypes } from 'react';
import { FormattedMessage, FormattedRelative } from 'react-intl';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { reset, getFormValues } from 'redux-form';

import { Row, Col, Alert } from 'react-bootstrap';
import PageContent from '../../components/PageContent';

import ResourceRenderer from '../../components/ResourceRenderer';
import EditAssignmentForm from '../../components/Forms/EditAssignmentForm';
import EditAssignmentLimitsForm from '../../components/Forms/EditAssignmentLimitsForm';

import { fetchAssignmentIfNeeded, editAssignment } from '../../redux/modules/assignments';
import { fetchLimitsIfNeeded, editAssignmentLimits } from '../../redux/modules/limits';
import { getAssignment, canSubmitSolution } from '../../redux/selectors/assignments';
import { isSubmitting } from '../../redux/selectors/submission';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { isSupervisorOf } from '../../redux/selectors/users';

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
      editAssignment,
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
                initialValues={assignment}
                onSubmit={editAssignment}
                formValues={formValues} />
              <EditAssignmentLimitsForm
                assignment={assignment}
                initialValues={{}} />
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
};

export default connect(
  (state, { params: { assignmentId } }) => {
    const assignmentSelector = getAssignment(assignmentId);
    const userId = loggedInUserIdSelector(state);
    return {
      assignment: assignmentSelector(state),
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
      data.firstDeadline = data.firstDeadline.unix();
      if (data.secondDeadline) {
        data.secondDeadline = data.secondDeadline.unix();
      }

      return dispatch(editAssignment(assignmentId, data));
    },
    editAssignmentLimits: (data) =>
      dispatch(editAssignmentLimits(data))
  })
)(EditAssignment);
