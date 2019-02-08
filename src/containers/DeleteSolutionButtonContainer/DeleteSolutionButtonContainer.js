import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import DeleteButton from '../../components/buttons/DeleteButton';
import { getSolution } from '../../redux/selectors/solutions';
import { deleteSolution } from '../../redux/modules/solutions';

const DeleteSolutionButtonContainer = ({
  submission,
  deleteSolution,
  onDeleted,
  ...props
}) => (
  <DeleteButton
    {...props}
    resource={submission}
    deleteResource={deleteSolution}
  />
);

DeleteSolutionButtonContainer.propTypes = {
  id: PropTypes.string.isRequired,
  submission: ImmutablePropTypes.map,
  deleteSolution: PropTypes.func.isRequired,
  onDeleted: PropTypes.func,
};

export default connect(
  (state, { id }) => ({
    submission: getSolution(id)(state),
  }),
  (dispatch, { id, onDeleted }) => ({
    deleteSolution: () => {
      const promise = dispatch(deleteSolution(id));
      if (onDeleted) {
        promise.then(onDeleted);
      }
      return promise;
    },
  })
)(DeleteSolutionButtonContainer);
