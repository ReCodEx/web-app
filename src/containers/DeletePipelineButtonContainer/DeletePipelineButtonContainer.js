import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import DeleteButton from '../../components/buttons/DeleteButton';
import ConfirmDeleteButton from '../../components/buttons/DeleteButton/ConfirmDeleteButton';
import { deletePipeline } from '../../redux/modules/pipelines';
import { getPipeline } from '../../redux/selectors/pipelines';

const DeletePipelineButtonContainer = ({
  resourceless = false,
  pipeline,
  deletePipeline,
  onDeleted,
  ...props
}) =>
  resourceless
    ? <ConfirmDeleteButton {...props} onClick={deletePipeline} />
    : <DeleteButton
        {...props}
        resource={pipeline}
        deleteResource={deletePipeline}
      />;

DeletePipelineButtonContainer.propTypes = {
  id: PropTypes.string.isRequired,
  resourceless: PropTypes.bool,
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
