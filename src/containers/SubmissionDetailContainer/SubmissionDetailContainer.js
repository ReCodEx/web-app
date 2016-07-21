import React, { PropTypes, Component } from 'react';
import SubmissionDetail from '../../components/SubmissionDetail';
import { ASSIGNMENT_DETAIL_URI_FACTORY } from '../../links';

class SubmissionDetailContainer extends Component {

  state = { isOpen: true };

  onHide = () =>
    this.setState({ isOpen: false });

  onExited = () =>
    this.context.router.push(
      ASSIGNMENT_DETAIL_URI_FACTORY(this.props.params.assignmentId)
    );

  render = () => (
    <SubmissionDetail
      open={this.state.isOpen}
      onHide={this.onHide}
      onExited={this.onExited} />
  );

}

SubmissionDetailContainer.contextTypes = {
  router: PropTypes.object
};

SubmissionDetailContainer.propTypes = {
  params: PropTypes.object.isRequired
};

export default SubmissionDetailContainer;
