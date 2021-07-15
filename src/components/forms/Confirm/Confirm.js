import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Popover, Overlay } from 'react-bootstrap';
import { SuccessIcon, CloseIcon } from '../../icons';
import Button, { TheButtonGroup } from '../../widgets/TheButton';

const Confirm = ({
  id,
  children,
  disabled,
  question,
  yes = (
    <span>
      <SuccessIcon gapRight />
      <FormattedMessage id="app.confirm.yes" defaultMessage="Yes" />
    </span>
  ),
  no = (
    <span>
      <CloseIcon gapRight />
      <FormattedMessage id="app.confirm.no" defaultMessage="No" />
    </span>
  ),
  placement = 'bottom',
  onConfirmed,
}) => {
  const [showTarget, setShowTarget] = useState(null);

  return disabled ? (
    React.cloneElement(children, {
      onClick: ev => {
        ev.preventDefault();
        onConfirmed();
      },
    })
  ) : (
    <>
      {React.cloneElement(children, {
        onClick: ev => {
          ev.preventDefault();
          setShowTarget(ev.target);
        },
      })}
      <Overlay target={showTarget} placement={placement} show={showTarget !== null}>
        <Popover id={id}>
          <Popover.Title>{question}</Popover.Title>
          <Popover.Content className="text-center">
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
          </Popover.Content>
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
  children: PropTypes.element.isRequired,
  className: PropTypes.string,
};

export default Confirm;
