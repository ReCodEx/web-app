import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { Alert, Grid, Row, Col } from 'react-bootstrap';

import { CheckboxField } from '../Fields';
import SubmitButton from '../SubmitButton';
import Button from '../../widgets/FlatButton';
import { RefreshIcon } from '../../icons';

class EditEnvironmentSimpleForm extends Component {
  render() {
    const {
      dirty,
      submitting,
      reset,
      handleSubmit,
      submitFailed,
      submitSucceeded,
      invalid,
      error,
      runtimeEnvironments,
      intl: { locale },
    } = this.props;

    return (
      <div>
        <Grid fluid>
          <Row>
            {runtimeEnvironments
              .sort((a, b) => a.longName.localeCompare(b.longName, locale))
              .map((environment, i) => (
                <Col key={i} xs={12} sm={6}>
                  <Field
                    name={`${environment.id}`}
                    component={CheckboxField}
                    onOff
                    label={environment.longName}
                  />
                </Col>
              ))}
          </Row>
        </Grid>

        {submitFailed && (
          <Alert bsStyle="danger">
            <FormattedMessage
              id="generic.savingFailed"
              defaultMessage="Saving failed. Please try again later."
            />
          </Alert>
        )}

        {error && <Alert bsStyle="danger">{error}</Alert>}

        <div className="text-center">
          {dirty && (
            <span>
              <Button
                type="reset"
                onClick={reset}
                bsStyle={'danger'}
                className="btn-flat">
                <RefreshIcon gapRight />
                <FormattedMessage id="generic.reset" defaultMessage="Reset" />
              </Button>{' '}
            </span>
          )}

          <SubmitButton
            id="editTests"
            invalid={invalid}
            submitting={submitting}
            hasSucceeded={submitSucceeded}
            dirty={dirty}
            hasFailed={submitFailed}
            handleSubmit={handleSubmit}
            messages={{
              submit: (
                <FormattedMessage
                  id="app.editEnvironmentSimpleForm.submit"
                  defaultMessage="Save Environments"
                />
              ),
              submitting: (
                <FormattedMessage
                  id="app.editEnvironmentSimpleForm.submitting"
                  defaultMessage="Saving Environments..."
                />
              ),
              success: (
                <FormattedMessage
                  id="app.editEnvironmentSimpleForm.success"
                  defaultMessage="Environments Saved."
                />
              ),
            }}
          />
        </div>
      </div>
    );
  }
}

EditEnvironmentSimpleForm.propTypes = {
  values: PropTypes.array,
  reset: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  error: PropTypes.any,
  runtimeEnvironments: PropTypes.array,
  intl: intlShape.isRequired,
};

const validate = formData => {
  const errors = {};
  const allowedEnvrionmentsCount = Object.values(formData).filter(
    value => value === true || value === 'true'
  ).length;

  if (allowedEnvrionmentsCount === 0) {
    errors['_error'] = (
      <FormattedMessage
        id="app.editEnvironmentSimpleForm.validation.environments"
        defaultMessage="Please add at least one runtime environment."
      />
    );
  } else if (formData['data-linux'] && allowedEnvrionmentsCount > 1) {
    errors['_error'] = (
      <FormattedMessage
        id="app.editEnvironmentSimpleForm.validation.dataOnlyCollision"
        defaultMessage="Data-Only environment cannot be combined with any other environment."
      />
    );
  }
  return errors;
};

export default reduxForm({
  form: 'editEnvironmentSimple',
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
  validate,
})(injectIntl(EditEnvironmentSimpleForm));
