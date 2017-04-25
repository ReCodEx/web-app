import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Popover, Overlay, ButtonGroup, Button } from 'react-bootstrap';
import { SuccessIcon, CloseIcon } from '../../icons';

class Confirm extends Component {
  state = { showPopup: false };

  askForConfirmation = e => {
    const { disabled = false, onConfirmed } = this.props;
    if (disabled === false) {
      this.setState({ showPopup: true, target: e.target });
    } else {
      onConfirmed();
    }
  };

  dismiss = e => {
    e.preventDefault();
    this.setState({ showPopup: false });
  };

  confirm = e => {
    this.dismiss(e);
    this.props.onConfirmed();
  };

  renderQuestion() {
    const {
      question,
      id,
      yes = (
        <span>
          <SuccessIcon />
          {' '}
          <FormattedMessage id="app.confirm.yes" defaultMessage="Yes" />
        </span>
      ),
      no = (
        <span>
          <CloseIcon />
          {' '}
          <FormattedMessage id="app.confirm.no" defaultMessage="No" />
        </span>
      )
    } = this.props;
    const { target, showPopup } = this.state;

    return (
      <Overlay show={showPopup} target={target} placement="bottom">
        <Popover id={id} title={question}>
          <div className="text-center">
            <ButtonGroup bsSize="sm">
              <Button onClick={e => this.confirm(e)}>{yes}</Button>
              <Button onClick={e => this.dismiss(e)}>{no}</Button>
            </ButtonGroup>
          </div>
        </Popover>
      </Overlay>
    );
  }

  render() {
    const { children } = this.props;
    return (
      <span style={{ display: 'inline-block', position: 'relative' }}>
        {React.cloneElement(children, {
          onClick: e => this.askForConfirmation(e)
        })}
        {this.renderQuestion()}
      </span>
    );
  }
}

const stringOrFormattedMessage = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.element,
  FormattedMessage
]);

Confirm.propTypes = {
  id: PropTypes.string.isRequired,
  onConfirmed: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  question: stringOrFormattedMessage.isRequired,
  yes: stringOrFormattedMessage,
  no: stringOrFormattedMessage,
  children: PropTypes.element.isRequired
};

export default Confirm;
