import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import { SendIcon, LoadingIcon, SuccessIcon, WarningIcon } from '../../icons';

class SubmitButton extends Component {
  componentWillMount() {
    this.setState({ saved: false });
  }

  submit = data => {
    const { handleSubmit, reset } = this.props;
    return handleSubmit(data).then(() => {
      this.setState({ saved: true });
      setTimeout(() => {
        this.setState({ saved: false });
        reset && reset();
      }, 2000);
    });
  };

  render() {
    const {
      submitting,
      dirty,
      hasFailed,
      invalid,
      asyncValidating = false,
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
        disabled={invalid || asyncValidating !== false || submitting}
      >
        {!submitting
          ? hasSucceeded
              ? <span><SuccessIcon /> &nbsp; {successMsg}</span>
              : asyncValidating !== false
                  ? <span><LoadingIcon /> &nbsp; {validatingMsg}</span>
                  : dirty && invalid
                      ? <span><WarningIcon /> &nbsp; {invalidMsg}</span>
                      : <span><SendIcon /> &nbsp; {submitMsg}</span>
          : <span><LoadingIcon /> &nbsp; {submittingMsg}</span>}
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
  invalid: PropTypes.bool,
  reset: PropTypes.func,
  messages: PropTypes.shape({
    submit: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    success: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    submitting: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    validating: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
  })
};

export default SubmitButton;
