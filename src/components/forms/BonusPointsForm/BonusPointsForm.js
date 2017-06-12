import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Alert } from 'react-bootstrap';
import isInt from 'validator/lib/isInt';
import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';

import { TextField } from '../Fields';

const BonusPointsForm = ({
  submitting,
  handleSubmit,
  anyTouched,
  submitFailed = false,
  submitSucceeded = false,
  invalid
}) =>
  <FormBox
    title={
      <FormattedMessage
        id="app.bonusPointsForm.title"
        defaultMessage="Set bonus points"
      />
    }
    type={submitSucceeded ? 'success' : undefined}
    isOpen={false}
    collapsable={true}
    footer={
      <div className="text-center">
        <SubmitButton
          id="bonus-points"
          handleSubmit={handleSubmit}
          submitting={submitting}
          dirty={anyTouched}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          invalid={invalid}
          messages={{
            submit: (
              <FormattedMessage
                id="app.bonusPointsForm.set"
                defaultMessage="Set bonus points"
              />
            ),
            submitting: (
              <FormattedMessage
                id="app.bonusPointsForm.processing"
                defaultMessage="Saving ..."
              />
            ),
            success: (
              <FormattedMessage
                id="app.bonusPointsForm.success"
                defaultMessage="Bonus points were set."
              />
            )
          }}
        />
      </div>
    }
  >
    {submitFailed &&
      <Alert bsStyle="danger">
        <FormattedMessage
          id="app.bonusPointsForm.failed"
          defaultMessage="Cannot save the bonus points."
        />
      </Alert>}

    <Field
      name="bonusPoints"
      component={TextField}
      label={
        <FormattedMessage
          id="app.bonusPointsForm.bonusPoints"
          defaultMessage="Bonus points:"
        />
      }
    />
  </FormBox>;

BonusPointsForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  anyTouched: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool
};

const validate = ({ bonusPoints }) => {
  const errors = {};
  if (!isInt(String(bonusPoints))) {
    errors['bonusPoints'] = (
      <FormattedMessage
        id="app.bonusPointsForm.validation.points"
        defaultMessage="The bonus must be an integer."
      />
    );
  }

  return errors;
};

export default reduxForm({
  form: 'bonus-points',
  validate
})(BonusPointsForm);
