import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import DeleteButton from '../../components/buttons/DeleteButton';
import { getSolution } from '../../redux/selectors/solutions.js';
import { deleteSolution } from '../../redux/modules/solutions.js';

const DeleteSolutionButtonContainer = ({ solution, deleteSolution, onDeleted, groupId, ...props }) => (
  <DeleteButton {...props} resource={solution} deleteAction={deleteSolution} />
);

DeleteSolutionButtonContainer.propTypes = {
  id: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  solution: ImmutablePropTypes.map,
  deleteSolution: PropTypes.func.isRequired,
  onDeleted: PropTypes.func,
};

export default connect(
  (state, { id }) => ({
    solution: getSolution(state, id),
  }),
  (dispatch, { id, groupId, onDeleted }) => ({
    deleteSolution: () => {
      const promise = dispatch(deleteSolution(id, groupId));
      if (onDeleted) {
        promise.then(onDeleted);
      }
      return promise;
    },
  })
)(DeleteSolutionButtonContainer);
