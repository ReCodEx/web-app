import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Alert, Row, Col } from 'react-bootstrap';

import { CheckboxField } from '../Fields';
import SubmitButton from '../SubmitButton';

class EditEnvironmentSimpleForm extends Component {
  render() {
    const {
      anyTouched,
      submitting,
      handleSubmit,
      hasFailed = false,
      hasSucceeded = false,
      invalid,
      runtimeEnvironments
    } = this.props;

    return (
      <div>
        {hasFailed &&
          <Alert bsStyle="danger">
            <FormattedMessage
              id="app.editEnvironmentSimpleForm.failed"
              defaultMessage="Saving failed. Please try again later."
            />
          </Alert>}

        <Row>
          {runtimeEnvironments.map((environment, i) =>
            <Col key={i} xs={12} sm={6}>
              <Field
                name={`${environment.id}`}
                component={CheckboxField}
                onOff
                label={environment.name}
              />
            </Col>
          )}
        </Row>

        <div className="text-center">
          <SubmitButton
            id="editTests"
            invalid={invalid}
            submitting={submitting}
            hasSucceeded={hasSucceeded}
            dirty={anyTouched}
            hasFailed={hasFailed}
            handleSubmit={handleSubmit}
            messages={{
              submit: (
                <FormattedMessage
                  id="app.editEnvironmentSimpleForm.submit"
                  defaultMessage="Change configuration"
                />
              ),
              submitting: (
                <FormattedMessage
                  id="app.editEnvironmentSimpleForm.submitting"
                  defaultMessage="Saving configuration ..."
                />
              ),
              success: (
                <FormattedMessage
                  id="app.editEnvironmentSimpleForm.success"
                  defaultMessage="Configuration was changed."
                />
              )
            }}
          />
        </div>
      </div>
    );
  }
}

EditEnvironmentSimpleForm.propTypes = {
  values: PropTypes.array,
  handleSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  submitting: PropTypes.bool,
  hasFailed: PropTypes.bool,
  hasSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  runtimeEnvironments: PropTypes.array
};

const validate = formData => {
  const errors = {};

  if (
    Object.values(formData).filter(value => value === true || value === 'true')
      .length === 0
  ) {
    errors['_error'] = (
      <FormattedMessage
        id="app.editEnvironmentSimpleForm.validation.environments"
        defaultMessage="Please add at least one runtime environment."
      />
    );
  }

  return errors;
};

export default reduxForm({
  form: 'editEnvironmentSimple',
  validate
})(EditEnvironmentSimpleForm);
