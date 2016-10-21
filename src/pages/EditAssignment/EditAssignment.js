import React, { Component, PropTypes } from 'react';
import { FormattedMessage, FormattedRelative } from 'react-intl';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { reset } from 'redux-form';

import { Row, Col, Alert } from 'react-bootstrap';
import PageContent from '../../components/PageContent';

import ResourceRenderer from '../../components/ResourceRenderer';
import EditAssignmentForm from '../../components/Forms/EditAssignmentForm';

import { fetchAssignmentIfNeeded, editAssignment } from '../../redux/modules/assignments';
import { getAssignment, canSubmitSolution } from '../../redux/selectors/assignments';
import { isSubmitting } from '../../redux/selectors/submission';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { isSupervisorOf } from '../../redux/selectors/users';

class EditAssignment extends Component {

  componentWillMount = () => {
    EditAssignment.loadData(this.props);
    this.checkIfIsDone(this.props);
  };

  componentWillReceiveProps = props => {
    if (this.props.params.assignmentId !== props.params.assignmentId) {
      props.reset();
      EditAssignment.loadData(props);
    }

    this.checkIfIsDone(props);
  };

  static loadData = ({
    loadAssignmentIfNeeded
  }) => {
    loadAssignmentIfNeeded();
  };

  checkIfIsDone = (props) => {
    const { hasSucceeded } = props;
    if (hasSucceeded) {
      setTimeout(() => {
        const { push, reset, params: { assignmentId } } = props;
        const { links: { ASSIGNMENT_EDIT_URI_FACTORY } } = this.context;
        reset();
        push(ASSIGNMENT_EDIT_URI_FACTORY(assignmentId));
      }, 1500);
    }
  };

  render() {
    const { links: { ASSIGNMENT_EDIT_URI_FACTORY } } = this.context;
    const {
      params: { assignmentId },
      assignment,
      editAssignment
    } = this.props;

    return (
      <PageContent
        title={<FormattedMessage id='app.editAssignment.title' defaultMessage='Edit assignment settings' />}
        description={<FormattedMessage id='app.editAssignment.description' defaultMessage='Change assignment settings and limits' />}
        breadcrumbs={[
          {
            text: <FormattedMessage id='app.assignment.title' />,
            iconName: 'puzzle-piece',
            link: ASSIGNMENT_EDIT_URI_FACTORY(assignmentId)
          },
          {
            text: <FormattedMessage id='app.editAssignment.title' />,
            iconName: 'pencil'
          }
        ]}>
        <ResourceRenderer resource={assignment}>
          {assignment => (
            <EditAssignmentForm
              initialValues={assignment}
              handleSubmit={editAssignment} />
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
      canSubmit: canSubmitSolution(assignmentId)(state)
    };
  },
  (dispatch, { params: { assignmentId } }) => ({
    push: (url) => dispatch(push(url)),
    reset: () => dispatch(reset('editAssignment')),
    loadAssignmentIfNeeded: () => dispatch(fetchAssignmentIfNeeded(assignmentId)),
    editAssignment: (data) => dispatch(editAssignment(data))
  })
)(EditAssignment);
