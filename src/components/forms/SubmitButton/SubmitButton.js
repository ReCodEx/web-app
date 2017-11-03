import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import { SendIcon, LoadingIcon, SuccessIcon, WarningIcon } from '../../icons';

class SubmitButton extends Component {
  componentWillMount() {
    this.setState({ saved: false });
  }

  componentWillUnmount() {
    this.unmounted = true;
    if (this.resetAfterSomeTime) {
      clearTimeout(this.resetAfterSomeTime);
      this.resetAfterSomeTime = undefined;
      this.reset();
    }
  }

  submit = data => {
    const { handleSubmit } = this.props;
    return handleSubmit(data).then(() => {
      if (!this.unmounted) {
        this.setState({ saved: true });
        this.resetAfterSomeTime = setTimeout(this.reset, 2000);
      } else {
        const { reset } = this.props;
        reset && reset(); // the redux form must be still reset
      }
    });
  };

  reset = () => {
    const { reset } = this.props;
    this.setState({ saved: false });
    reset && reset();
  };

  render() {
    const {
      submitting,
      dirty,
      hasFailed,
      invalid,
      asyncValidating = false,
      noIcons = false,
      disabled = false,
      messages: {
        submit: submitMsg = (
          <FormattedMessage
            id="app.editExerciseForm.submit"
            defaultMessage="Submit"
          />
        ),
        success: successMsg = (
          <FormattedMessage
            id="app.editExerciseForm.success"
            defaultMessage="Successfully submitted"
          />
        ),
        submitting: submittingMsg = (
          <FormattedMessage
            id="app.editExerciseForm.submitting"
            defaultMessage="Submitting..."
          />
        ),
        validating: validatingMsg = (
          <FormattedMessage
            id="app.submitButton.validating"
            defaultMessage="Validating..."
          />
        ),
        invalid: invalidMsg = (
          <FormattedMessage
            id="app.submitButton.invalid"
            defaultMessage="Some input is invalid"
          />
        )
      }
    } = this.props;

    const { saved: hasSucceeded } = this.state;

    return (
      <Button
        type="submit"
        onClick={data => this.submit(data)}
        bsStyle={
          hasSucceeded
            ? 'success'
            : hasFailed ? 'danger' : dirty ? 'warning' : 'success'
        }
        className="btn-flat"
        disabled={
          invalid || asyncValidating !== false || submitting || disabled
        }
      >
        {!submitting
          ? hasSucceeded
            ? <span>
                {!noIcons && <SuccessIcon />} &nbsp;
                {successMsg}
              </span>
            : asyncValidating !== false
              ? <span>
                  {!noIcons && <LoadingIcon />} &nbsp; {validatingMsg}
                </span>
              : dirty && invalid
                ? <span>
                    {!noIcons && <WarningIcon />} &nbsp; {invalidMsg}
                  </span>
                : <span>
                    {!noIcons && <SendIcon />} &nbsp; {submitMsg}
                  </span>
          : <span>
              {!noIcons && <LoadingIcon />} &nbsp; {submittingMsg}
            </span>}
      </Button>
    );
  }
}

SubmitButton.propTypes = {
  id: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool.isRequired,
  submitting: PropTypes.bool,
  hasSucceeded: PropTypes.bool,
  hasFailed: PropTypes.bool,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  noIcons: PropTypes.bool,
  invalid: PropTypes.bool,
  disabled: PropTypes.bool,
  reset: PropTypes.func,
  messages: PropTypes.shape({
    submit: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    success: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    submitting: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    validating: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
  })
};

export default SubmitButton;
