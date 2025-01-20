import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import { lruMemoize } from 'reselect';

import Button from '../../widgets/TheButton';
import { SendIcon, LoadingIcon, SuccessIcon, WarningIcon } from '../../icons';
import Confirm from '../Confirm';
import { getErrorMessage } from '../../../locales/apiErrorMessages.js';

const getIcons = lruMemoize(defaultIcon => ({
  submit: defaultIcon || <SendIcon gapRight={2} />,
  success: <SuccessIcon gapRight={2} />,
  submitting: <LoadingIcon gapRight={2} />,
  validating: <LoadingIcon gapRight={2} />,
  invalid: <WarningIcon gapRight={2} />,
}));

const getMessages = lruMemoize(messages => {
  const messageDefaults = {
    submit: <FormattedMessage id="generic.submit" defaultMessage="Submit" />,
    success: <FormattedMessage id="generic.submitted" defaultMessage="Submitted" />,
    submitting: <FormattedMessage id="generic.submitting" defaultMessage="Submitting..." />,
    validating: <FormattedMessage id="generic.validating" defaultMessage="Validating..." />,
    invalid: <FormattedMessage id="app.submitButton.invalid" defaultMessage="Some input is invalid." />,
  };

  Object.keys(messageDefaults).forEach(key => {
    if (messages[key] === undefined) {
      messages[key] = messageDefaults[key];
    }
  });
  return messages;
});

class SubmitButton extends Component {
  state = { saved: false, lastError: null };

  componentWillUnmount() {
    this.unmounted = true;
    if (this.resetAfterSomeTime) {
      window.clearTimeout(this.resetAfterSomeTime);
      this.resetAfterSomeTime = undefined;
      this.reset();
    }
  }

  submit = () => {
    const { handleSubmit, onSubmit = null } = this.props;

    // reset button internal state
    this.setState({ saved: false, lastError: null });

    onSubmit && onSubmit();

    return handleSubmit().then(
      res => {
        if (!this.unmounted) {
          this.setState({ saved: true });
          this.resetAfterSomeTime = window.setTimeout(this.reset, 2000);
        } else {
          const { reset } = this.props;
          reset && reset(); // the redux form must be still reset
        }
        return res;
      },
      lastError => {
        this.setState({ lastError });
      }
    );
  };

  reset = () => {
    const { reset } = this.props;
    this.setState({ saved: false, lastError: null });
    reset && reset();
  };

  getButtonState = () => {
    const { submitting, invalid, asyncValidating = false } = this.props;
    if (submitting) return 'submitting';
    if (this.state.saved) return 'success';
    if (asyncValidating !== false) return 'validating';
    if (invalid) return 'invalid';
    return 'submit';
  };

  getButtonVariant() {
    const { submitting, hasFailed, invalid } = this.props;
    return hasFailed && !submitting
      ? 'danger'
      : this.state.saved || submitting
        ? 'success'
        : invalid
          ? 'warning'
          : 'success';
  }

  isButtonDisabled() {
    const { submitting, invalid, asyncValidating = false, disabled = false } = this.props;
    return invalid || asyncValidating !== false || submitting || disabled;
  }

  render() {
    const {
      id,
      hasFailed,
      confirmQuestion = '',
      noIcons = false,
      defaultIcon = null,
      noShadow = false,
      size,
      messages = {},
      intl: { formatMessage },
    } = this.props;

    const buttonState = this.getButtonState();
    const icons = getIcons(defaultIcon);
    const formattedMessages = getMessages(messages);

    return hasFailed && this.state.lastError ? (
      <OverlayTrigger
        placement="top"
        overlay={
          <Popover id={`error-popover-${id}`}>
            <Popover.Header className="bg-danger">
              <FormattedMessage id="app.submitButton.lastError.title" defaultMessage="An error occured" />
            </Popover.Header>
            <Popover.Body className="text-center">{getErrorMessage(formatMessage)(this.state.lastError)}</Popover.Body>
          </Popover>
        }>
        <Button
          type="submit"
          variant={this.getButtonVariant()}
          disabled={this.isButtonDisabled()}
          noShadow={noShadow}
          size={size}
          onClick={this.submit}>
          {!noIcons && icons[buttonState]}
          {formattedMessages[buttonState]}
        </Button>
      </OverlayTrigger>
    ) : (
      <Confirm
        id={`confirm-submit-${id}`}
        onConfirmed={this.submit}
        question={confirmQuestion}
        disabled={!confirmQuestion}>
        <Button
          type="submit"
          variant={this.getButtonVariant()}
          disabled={this.isButtonDisabled()}
          noShadow={noShadow}
          size={size}>
          {!noIcons && icons[buttonState]}
          {formattedMessages[buttonState]}
        </Button>
      </Confirm>
    );
  }
}

SubmitButton.propTypes = {
  id: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  hasFailed: PropTypes.bool,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  noIcons: PropTypes.bool,
  defaultIcon: PropTypes.any,
  invalid: PropTypes.bool,
  disabled: PropTypes.bool,
  reset: PropTypes.func,
  onSubmit: PropTypes.func,
  messages: PropTypes.shape({
    submit: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    success: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    submitting: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    validating: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  }),
  confirmQuestion: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  noShadow: PropTypes.bool,
  size: PropTypes.string,
  intl: PropTypes.object,
};

export default injectIntl(SubmitButton);
