import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Popover, Overlay, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { SuccessIcon, CloseIcon } from '../../icons';
import Button, { TheButtonGroup } from '../../widgets/TheButton';

const renderConfirmChild = (children, id, tooltip, tooltipPlacement, onClick) =>
  tooltip ? (
    <OverlayTrigger placement={tooltipPlacement} overlay={<Tooltip id={`${id}.tooltip`}>{tooltip}</Tooltip>}>
      {React.cloneElement(children, { onClick })}
    </OverlayTrigger>
  ) : (
    React.cloneElement(children, { onClick })
  );

const Confirm = ({
  id,
  children,
  disabled,
  question,
  yes = (
    <>
      <SuccessIcon gapRight />
      <FormattedMessage id="app.confirm.yes" defaultMessage="Yes" />
    </>
  ),
  no = (
    <>
      <CloseIcon gapRight />
      <FormattedMessage id="app.confirm.no" defaultMessage="No" />
    </>
  ),
  placement = 'bottom',
  tooltip = null,
  tooltipPlacement = 'bottom',
  onConfirmed,
}) => {
  const [showTarget, setShowTarget] = useState(null);

  return disabled ? (
    renderConfirmChild(children, id, tooltip, tooltipPlacement, ev => {
      ev.preventDefault();
      onConfirmed();
    })
  ) : (
    <>
      {renderConfirmChild(children, id, tooltip, tooltipPlacement, ev => {
        ev.preventDefault();
        setShowTarget(ev.target);
      })}
      <Overlay target={showTarget} placement={placement} show={showTarget !== null}>
        <Popover id={id}>
          <Popover.Header>{question}</Popover.Header>
          <Popover.Body className="text-center">
            <TheButtonGroup>
              <Button
                onClick={() => {
                  setShowTarget(null);
                  onConfirmed();
                }}
                size="sm"
                variant="success">
                {yes}
              </Button>
              <Button
                onClick={() => {
                  setShowTarget(null);
                }}
                size="sm"
                variant="danger">
                {no}
              </Button>
            </TheButtonGroup>
          </Popover.Body>
        </Popover>
      </Overlay>
    </>
  );
};

const stringOrFormattedMessage = PropTypes.oneOfType([PropTypes.string, PropTypes.element]);

Confirm.propTypes = {
  id: PropTypes.string.isRequired,
  onConfirmed: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  question: stringOrFormattedMessage.isRequired,
  yes: stringOrFormattedMessage,
  no: stringOrFormattedMessage,
  placement: PropTypes.string,
  tooltip: stringOrFormattedMessage,
  tooltipPlacement: PropTypes.string,
  children: PropTypes.element.isRequired,
  className: PropTypes.string,
};

export default Confirm;
