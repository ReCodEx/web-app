import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Dropdown, Overlay, Popover } from 'react-bootstrap';

import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Icon, { CloseIcon, EditIcon, LoadingIcon, SuccessIcon } from '../../icons';

const ActionDropdown = ({ actions, placement = 'bottom', id, captionAsTooltip }) => {
  const [confirmAction, setConfirmAction] = useState(null);
  const target = useRef(null);
  const anyPending = actions.some(a => a.pending);

  return (
    <Dropdown as="span">
      <Dropdown.Toggle variant="warning" size="xs" ref={target} className={anyPending ? 'half-opaque' : ''}>
        {anyPending ? <LoadingIcon gapRight={!captionAsTooltip} /> : <EditIcon gapRight={!captionAsTooltip} />}
        {!captionAsTooltip && <FormattedMessage id="generic.update" defaultMessage="Update" />}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {actions.map(action => (
          <Dropdown.Item
            key={action.icon}
            onClick={action.confirm ? () => setConfirmAction(action) : action.handler}
            disabled={action.pending}>
            <small>
              {action.pending ? (
                <LoadingIcon gapRight />
              ) : (
                <Icon icon={action.icon} className={`text-${action.variant || 'success'}`} gapRight />
              )}
              {action.label}
            </small>
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>

      <Overlay target={target} placement={placement} show={target !== null && confirmAction !== null}>
        <Popover id={id}>
          <Popover.Title>{confirmAction && confirmAction.confirm}</Popover.Title>
          <Popover.Content className="text-center">
            <TheButtonGroup>
              <Button
                onClick={() => {
                  confirmAction.handler();
                  setConfirmAction(null);
                }}
                size="sm"
                variant="success">
                <SuccessIcon gapRight />
                <FormattedMessage id="app.confirm.yes" defaultMessage="Yes" />
              </Button>
              <Button
                onClick={() => {
                  setConfirmAction(null);
                }}
                size="sm"
                variant="danger">
                <CloseIcon gapRight />
                <FormattedMessage id="app.confirm.no" defaultMessage="No" />
              </Button>
            </TheButtonGroup>
          </Popover.Content>
        </Popover>
      </Overlay>
    </Dropdown>
  );
};

ActionDropdown.propTypes = {
  actions: PropTypes.array.isRequired,
  placement: PropTypes.string,
  id: PropTypes.string.isRequired,
  captionAsTooltip: PropTypes.bool,
};

export default ActionDropdown;
