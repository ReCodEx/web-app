import React, { PropTypes } from 'react';

import { Button } from 'react-bootstrap';
import { SendIcon, LoadingIcon, SuccessIcon } from '../../Icons';

const SubmitButton = ({
  handleSubmit,
  submitting,
  hasSucceeded,
  hasFailed,
  invalid,
  messages: {
    submit: submitMsg = '',
    success: successMsg = '',
    submitting: submittingMsg = ''
  }
}) => (
  <Button
    type='submit'
    onClick={handleSubmit}
    bsStyle={hasFailed ? 'danger' : 'success'}
    className='btn-flat'
    disabled={invalid || submitting}>
    {!submitting
      ? hasSucceeded
        ? <span><SuccessIcon /> &nbsp; {successMsg}</span>
        : <span><SendIcon /> &nbsp; {submitMsg}</span>
      : <span><LoadingIcon /> &nbsp; {submittingMsg}</span>}
  </Button>
);

SubmitButton.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  hasSucceeded: PropTypes.bool,
  hasFailed: PropTypes.bool,
  invalid: PropTypes.bool,
  messages: PropTypes.shape({
    submit: PropTypes.oneOfType([ PropTypes.string, PropTypes.element ]),
    success: PropTypes.oneOfType([ PropTypes.string, PropTypes.element ]),
    submitting: PropTypes.oneOfType([ PropTypes.string, PropTypes.element ])
  })
};

export default SubmitButton;
