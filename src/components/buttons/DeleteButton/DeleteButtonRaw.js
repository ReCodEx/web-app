import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Button from '../../widgets/FlatButton';
import { DeleteIcon } from '../../icons';

const DeleteButtonRaw = ({ id, disabled, small = true, captionAsLabel = false, ...props }) =>
  captionAsLabel ? (
    <OverlayTrigger
      placement="bottom"
      overlay={
        <Tooltip id={`${id}-delete`}>
          <FormattedMessage id="generic.delete" defaultMessage="Delete" />
        </Tooltip>
      }>
      <Button disabled={disabled || !id} bsStyle="danger" bsSize={small ? 'sm' : undefined} {...props}>
        <DeleteIcon smallGapLeft smallGapRight />
      </Button>
    </OverlayTrigger>
  ) : (
    <Button disabled={disabled || !id} bsStyle="danger" bsSize={small ? 'sm' : undefined} {...props}>
      <DeleteIcon gapRight />
      <FormattedMessage id="generic.delete" defaultMessage="Delete" />
    </Button>
  );

DeleteButtonRaw.propTypes = {
  id: PropTypes.string,
  small: PropTypes.bool,
  captionAsLabel: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default DeleteButtonRaw;
