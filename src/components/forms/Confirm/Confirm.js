import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Popover, Overlay, ButtonGroup } from 'react-bootstrap';
import { SuccessIcon, CloseIcon } from '../../icons';
import Button from '../../widgets/TheButton';

const wrapperSpanStyle = { display: 'inline-block', position: 'relative' };

class Confirm extends Component {
  state = { showPopup: false };

  askForConfirmation = ev => {
    const { disabled = false, onConfirmed } = this.props;
    ev.preventDefault();
    if (disabled === false) {
      this.setState({ showPopup: true, target: ev.target });
    } else {
      onConfirmed();
    }
  };

  dismiss = ev => {
    ev.preventDefault();
    this.setState({ showPopup: false });
  };

  confirm = ev => {
    this.dismiss(event);
    this.props.onConfirmed();
  };

  renderQuestion() {
    const {
      question,
      id,
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
    } = this.props;
    const { target, showPopup } = this.state;

    return (
      <Overlay show={showPopup} target={target} placement={placement}>
        <Popover id={id}>
          <Popover.Title>{question}</Popover.Title>
          <Popover.Content className="text-center">
            <ButtonGroup size="sm">
              <Button onClick={this.confirm} variant="success">
                {yes}
              </Button>
              <Button onClick={this.dismiss} variant="danger">
                {no}
              </Button>
            </ButtonGroup>
          </Popover.Content>
        </Popover>
      </Overlay>
    );
  }

  render() {
    const { children, className = '' } = this.props;
    return (
      <span style={wrapperSpanStyle} className={className}>
        {React.cloneElement(children, {
          onClick: this.askForConfirmation,
        })}
        {this.renderQuestion()}
      </span>
    );
  }
}

const stringOrFormattedMessage = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.element,
  PropTypes.oneOf([FormattedMessage]),
]);

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
