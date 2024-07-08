import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import DeleteButton from '../../components/buttons/DeleteButton';
import { deleteMessage } from '../../redux/modules/systemMessages.js';
import { getMessage } from '../../redux/selectors/systemMessages.js';

const DeleteSystemMessageButtonContainer = ({ message, deleteMessage, onDeleted, ...props }) => (
  <DeleteButton {...props} resource={message} deleteAction={deleteMessage} />
);

DeleteSystemMessageButtonContainer.propTypes = {
  id: PropTypes.string.isRequired,
  message: ImmutablePropTypes.map,
  deleteMessage: PropTypes.func.isRequired,
  onDeleted: PropTypes.func,
};

export default connect(
  (state, { id }) => ({
    message: getMessage(state, id),
  }),
  (dispatch, { id, onDeleted }) => ({
    deleteMessage: () => dispatch(deleteMessage(id)).then(() => onDeleted && onDeleted()),
  })
)(DeleteSystemMessageButtonContainer);
