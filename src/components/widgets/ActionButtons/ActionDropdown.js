import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Dropdown, Overlay, Popover } from 'react-bootstrap';

import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Icon, { CloseIcon, EditIcon, LoadingIcon, SuccessIcon } from '../../icons';

const ActionDropdown = ({ id, actions, label, placement = 'bottom' }) => {
  const [confirmAction, setConfirmAction] = useState(null);
  const target = useRef(null);
  const anyPending = actions.some(a => a.pending);

  return (
    <Dropdown as="span" drop="down">
      <Dropdown.Toggle variant="warning" size="xs" ref={target} className={anyPending ? 'opacity-50' : ''}>
        {anyPending ? <LoadingIcon gapRight={Boolean(label)} /> : <EditIcon gapRight={Boolean(label)} />}
        {label}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {actions.map(action => (
          <Dropdown.Item
            key={action.key}
            onClick={action.confirm ? () => setConfirmAction(action) : action.handler}
            disabled={action.pending}>
            <small>
              {action.pending ? (
                <LoadingIcon gapRight={2} />
              ) : action.icon && (typeof action.icon === 'string' || Array.isArray(action.icon)) ? (
                <Icon icon={action.icon} className={`text-${action.variant || 'success'}`} gapRight={2} />
              ) : (
                action.icon
              )}
              {action.label}
            </small>
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>

      <Overlay target={target} placement={placement} show={target !== null && confirmAction !== null}>
        <Popover id={id}>
          <Popover.Header>{confirmAction && confirmAction.confirm}</Popover.Header>
          <Popover.Body className="text-center">
            <TheButtonGroup>
              <Button
                onClick={() => {
                  confirmAction.handler();
                  setConfirmAction(null);
                }}
                size="sm"
                variant="success">
                <SuccessIcon gapRight={2} />
                <FormattedMessage id="app.confirm.yes" defaultMessage="Yes" />
              </Button>
              <Button
                onClick={() => {
                  setConfirmAction(null);
                }}
                size="sm"
                variant="danger">
                <CloseIcon gapRight={2} />
                <FormattedMessage id="app.confirm.no" defaultMessage="No" />
              </Button>
            </TheButtonGroup>
          </Popover.Body>
        </Popover>
      </Overlay>
    </Dropdown>
  );
};

ActionDropdown.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string, PropTypes.array]),
      label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
      tooltip: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
      confirm: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
      pending: PropTypes.bool,
      variant: PropTypes.string,
      handler: PropTypes.func,
    })
  ).isRequired,
  label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  placement: PropTypes.string,
  id: PropTypes.string.isRequired,
};

export default ActionDropdown;
