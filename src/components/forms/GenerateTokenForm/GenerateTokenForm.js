import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
  defineMessages,
  intlShape
} from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Alert } from 'react-bootstrap';
import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';

import { CheckboxField, SelectField } from '../Fields';

const availableScopes = ['read-all'];

const messages = defineMessages({
  hour: {
    id: 'app.generateToken.hour',
    defaultMessage: '1 Hour'
  },
  day: {
    id: 'app.generateToken.day',
    defaultMessage: '1 Day'
  },
  week: {
    id: 'app.generateToken.week',
    defaultMessage: '1 Week'
  },
  month: {
    id: 'app.generateToken.month',
    defaultMessage: '1 Month'
  },
  year: {
    id: 'app.generateToken.year',
    defaultMessage: '1 Year'
  }
});

const GenerateTokenForm = ({
  submitting,
  handleSubmit,
  submitFailed = false,
  submitSucceeded = false,
  anyTouched,
  invalid,
  lastToken,
  intl: { formatMessage }
}) =>
  <FormBox
    title={
      <FormattedMessage
        id="app.generateTokenForm.title"
        defaultMessage="Generate Application Token"
      />
    }
    type={submitSucceeded ? 'success' : undefined}
    footer={
      <div className="text-center">
        <SubmitButton
          id="generateToken"
          handleSubmit={handleSubmit}
          submitting={submitting}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          invalid={invalid}
          dirty={anyTouched}
          messages={{
            submit: (
              <FormattedMessage id="generic.submit" defaultMessage="Submit" />
            ),
            submitting: (
              <FormattedMessage
                id="generic.submitting"
                defaultMessage="Submitting"
              />
            ),
            success: (
              <FormattedMessage
                id="generic.submitted"
                defaultMessage="Submitted"
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
          id="generic.savingFailed"
          defaultMessage="Saving failed. Please try again later."
        />
      </Alert>}

    <h3>
      <FormattedMessage
        id="app.generateToken.scopes"
        defaultMessage="Scopes:"
      />
    </h3>
    {availableScopes.map((scope, i) =>
      <Field
        key={i}
        name={`scopes.${scope}`}
        component={CheckboxField}
        onOff
        label={scope}
      />
    )}
    <hr />

    <Field
      name="expiration"
      component={SelectField}
      addEmptyOption
      options={[
        { name: formatMessage(messages.hour), key: 1 * 60 * 60 },
        { name: formatMessage(messages.day), key: 24 * 60 * 60 },
        { name: formatMessage(messages.week), key: 7 * 24 * 60 * 60 },
        { name: formatMessage(messages.month), key: 31 * 24 * 60 * 60 },
        { name: formatMessage(messages.year), key: 365 * 24 * 60 * 60 }
      ]}
      label={
        <FormattedMessage
          id="app.generateToken.expiration"
          defaultMessage="Expires In:"
        />
      }
    />
    {lastToken !== '' &&
      <div>
        <hr />
        <h3>
          <FormattedMessage
            id="app.generateToken.lastToken"
            defaultMessage="Last Token:"
          />
        </h3>
        <code>
          {lastToken}
        </code>
      </div>}
  </FormBox>;

GenerateTokenForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  anyTouched: PropTypes.bool,
  invalid: PropTypes.bool,
  lastToken: PropTypes.string,
  intl: intlShape.isRequired
};

export default injectIntl(
  reduxForm({
    form: 'generate-token',
    enableReinitialize: true,
    keepDirtyOnReinitialize: false
  })(GenerateTokenForm)
);
