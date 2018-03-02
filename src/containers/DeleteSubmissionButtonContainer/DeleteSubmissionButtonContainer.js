import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import DeleteButton from '../../components/buttons/DeleteButton';
import { getSubmission } from '../../redux/selectors/submissions';
import { deleteSubmission } from '../../redux/modules/submissions';

const DeleteSubmissionButtonContainer = ({
  submission,
  deleteSubmission,
  onDeleted,
  ...props
}) =>
  <DeleteButton
    {...props}
    resource={submission}
    deleteResource={deleteSubmission}
  />;

DeleteSubmissionButtonContainer.propTypes = {
  id: PropTypes.string.isRequired,
  submission: ImmutablePropTypes.map,
  deleteSubmission: PropTypes.func.isRequired,
  onDeleted: PropTypes.func
};

export default connect(
  (state, { id }) => ({
    submission: getSubmission(id)(state)
  }),
  (dispatch, { id, onDeleted }) => ({
    deleteSubmission: () => {
      const promise = dispatch(deleteSubmission(id));
      if (onDeleted) {
        promise.then(onDeleted);
      }
      return promise;
    }
  })
)(DeleteSubmissionButtonContainer);
