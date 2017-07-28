import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import DeleteButton from '../../components/buttons/DeleteButton';
import { deletePipeline } from '../../redux/modules/pipelines';
import { getPipeline } from '../../redux/selectors/pipelines';

const DeletePipelineButtonContainer = ({
  pipeline,
  deletePipeline,
  onDeleted,
  ...props
}) =>
  <DeleteButton
    {...props}
    resource={pipeline}
    deleteResource={deletePipeline}
  />;

DeletePipelineButtonContainer.propTypes = {
  id: PropTypes.string.isRequired,
  pipeline: ImmutablePropTypes.map,
  deletePipeline: PropTypes.func.isRequired,
  onDeleted: PropTypes.func
};

export default connect(
  (state, { id }) => ({
    pipeline: getPipeline(id)(state)
  }),
  (dispatch, { id, onDeleted }) => ({
    deletePipeline: () => {
      onDeleted && onDeleted();
      return dispatch(deletePipeline(id));
    }
  })
)(DeletePipelineButtonContainer);
