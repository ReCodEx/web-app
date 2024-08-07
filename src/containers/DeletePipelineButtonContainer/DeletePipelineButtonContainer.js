import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import DeleteButton from '../../components/buttons/DeleteButton';
import { deletePipeline } from '../../redux/modules/pipelines.js';
import { getPipeline } from '../../redux/selectors/pipelines.js';

const DeletePipelineButtonContainer = ({
  resourceless = false,
  pipeline = null,
  deletePipeline,
  onDeleted,
  ...props
}) => <DeleteButton {...props} resourceless={resourceless} resource={pipeline} deleteAction={deletePipeline} />;

DeletePipelineButtonContainer.propTypes = {
  id: PropTypes.string.isRequired,
  resourceless: PropTypes.bool,
  pipeline: ImmutablePropTypes.map,
  deletePipeline: PropTypes.func.isRequired,
  onDeleted: PropTypes.func,
};

export default connect(
  (state, { id }) => ({
    pipeline: getPipeline(id)(state),
  }),
  (dispatch, { id, onDeleted }) => ({
    deletePipeline: () => {
      return dispatch(deletePipeline(id)).then(res => {
        onDeleted && onDeleted();
        return res;
      });
    },
  })
)(DeletePipelineButtonContainer);
