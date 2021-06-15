import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { defaultMemoize } from 'reselect';

import Button from '../../widgets/TheButton';
import { SendIcon, LoadingIcon, SuccessIcon, WarningIcon } from '../../icons';
import Confirm from '../Confirm';

const getIcons = defaultMemoize(defaultIcon => ({
  submit: defaultIcon || <SendIcon gapRight />,
  success: <SuccessIcon gapRight />,
  submitting: <LoadingIcon gapRight />,
  validating: <LoadingIcon gapRight />,
  invalid: <WarningIcon gapRight />,
}));

const getMessages = defaultMemoize(messages => {
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
  state = { saved: false };

  componentWillUnmount() {
    this.unmounted = true;
    if (this.resetAfterSomeTime) {
      clearTimeout(this.resetAfterSomeTime);
      this.resetAfterSomeTime = undefined;
      this.reset();
    }
  }

  submit = () => {
    const { handleSubmit, onSubmit = null } = this.props;
    onSubmit && onSubmit();
    return handleSubmit().then(res => {
      if (!this.unmounted) {
        this.setState({ saved: true });
        this.resetAfterSomeTime = setTimeout(this.reset, 2000);
      } else {
        const { reset } = this.props;
        reset && reset(); // the redux form must be still reset
      }
      return res;
    });
  };

  reset = () => {
    const { reset } = this.props;
    this.setState({ saved: false });
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

  render() {
    const {
      submitting,
      hasFailed,
      invalid,
      asyncValidating = false,
      noIcons = false,
      defaultIcon = null,
      disabled = false,
      confirmQuestion = '',
      messages = {},
    } = this.props;
    const { saved: hasSucceeded } = this.state;

    const buttonState = this.getButtonState();
    const icons = getIcons(defaultIcon);
    const formattedMessages = getMessages(messages);

    return (
      <Confirm id="confirm-submit" onConfirmed={this.submit} question={confirmQuestion} disabled={!confirmQuestion}>
        <Button
          type="submit"
          variant={hasSucceeded ? 'success' : hasFailed ? 'danger' : invalid ? 'warning' : 'success'}
          disabled={invalid || asyncValidating !== false || submitting || disabled}>
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
  hasSucceeded: PropTypes.bool,
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
  confirmQuestion: PropTypes.oneOfType([PropTypes.string, PropTypes.element, FormattedMessage]),
};

export default SubmitButton;
