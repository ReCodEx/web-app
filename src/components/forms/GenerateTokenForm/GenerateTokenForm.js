import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage, injectIntl, defineMessages, intlShape } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Alert, Well, OverlayTrigger, Tooltip, Grid, Row, Col } from 'react-bootstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import FormBox from '../../widgets/FormBox';
import Button from '../../widgets/FlatButton';
import SubmitButton from '../SubmitButton';
import { CheckboxField, SelectField } from '../Fields';
import { CopyIcon } from '../../icons';
import { objectMap } from '../../../helpers/common';

import './GenerateTokenForm.css';

const availableScopes = defineMessages({
  'read-all': {
    id: 'app.generateTokenForm.scope.readAll',
    defaultMessage: 'Read-only',
  },
  master: {
    id: 'app.generateTokenForm.scope.master',
    defaultMessage: 'Read-write',
  },
  refresh: {
    id: 'app.generateTokenForm.scope.refresh',
    defaultMessage: 'Allow refreshing indefinitely',
  },
});

const HOUR_SEC = 3600;
const DAY_SEC = 24 * HOUR_SEC;
const WEEK_SEC = 7 * DAY_SEC;
const MONTH_SEC = 31 * DAY_SEC;
const YEAR_SEC = 356 * DAY_SEC;

const messages = defineMessages({
  [HOUR_SEC]: {
    id: 'app.generateTokenForm.hour',
    defaultMessage: '1 Hour',
  },
  [DAY_SEC]: {
    id: 'app.generateTokenForm.day',
    defaultMessage: '1 Day',
  },
  [WEEK_SEC]: {
    id: 'app.generateTokenForm.week',
    defaultMessage: '1 Week',
  },
  [MONTH_SEC]: {
    id: 'app.generateTokenForm.month',
    defaultMessage: '1 Month',
  },
  [YEAR_SEC]: {
    id: 'app.generateTokenForm.year',
    defaultMessage: '1 Year',
  },
});

const GenerateTokenForm = ({
  warning,
  error,
  submitting,
  handleSubmit,
  submitFailed = false,
  submitSucceeded = false,
  invalid,
  lastToken,
  intl: { formatMessage },
}) => (
  <FormBox
    title={<FormattedMessage id="app.generateTokenForm.title" defaultMessage="Generate Application Token" />}
    type={submitSucceeded ? 'success' : undefined}
    footer={
      <div className="text-center">
        {lastToken && (
          <CopyToClipboard text={lastToken}>
            <OverlayTrigger
              trigger="click"
              rootClose
              placement="bottom"
              overlay={
                <Tooltip id={lastToken}>
                  <FormattedMessage id="app.generateTokenForm.copied" defaultMessage="Copied!" />
                </Tooltip>
              }>
              <Button bsStyle="info">
                <CopyIcon gapRight fixedWidth />
                <FormattedMessage id="app.generateTokenForm.copyToClipboard" defaultMessage="Copy to Clipboard" />
              </Button>
            </OverlayTrigger>
          </CopyToClipboard>
        )}

        <SubmitButton
          id="generateToken"
          handleSubmit={handleSubmit}
          submitting={submitting}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          invalid={invalid}
          messages={{
            submit: <FormattedMessage id="app.generateTokenForm.generate" defaultMessage="Generate" />,
            submitting: <FormattedMessage id="app.generateTokenForm.generating" defaultMessage="Generating..." />,
            success: <FormattedMessage id="app.generateTokenForm.generated" defaultMessage="Generated" />,
          }}
        />
      </div>
    }>
    <Well>
      <FormattedMessage
        id="app.generateTokenForm.info"
        defaultMessage="This form should help advanced users to access API directly. It may be used to generate security tokens which are used for authentication and authorization of API operations. The scopes may restrict the set of operations authorized by the token beyond the limitations of the user role."
      />
    </Well>

    <h4 className="em-margin-bottom">
      <FormattedMessage id="app.generateTokenForm.scopes" defaultMessage="Scopes:" />
    </h4>
    <Grid fluid>
      <Row>
        {Object.values(
          objectMap(availableScopes, (message, scope) => (
            <Col sm={6} key={scope}>
              <Field
                name={`scopes.${scope}`}
                component={CheckboxField}
                onOff
                label={formatMessage(message)}
                ignoreDirty
              />
            </Col>
          ))
        )}
      </Row>
    </Grid>

    {warning && <Alert bsStyle="warning">{warning}</Alert>}

    {error && <Alert bsStyle="danger">{error}</Alert>}

    {submitFailed && (
      <Alert bsStyle="danger">
        <FormattedMessage
          id="app.generateTokenForm.failed"
          defaultMessage="The process of token creation has failed. Please try again later."
        />
      </Alert>
    )}

    <hr />

    <Field
      name="expiration"
      component={SelectField}
      options={Object.values(
        objectMap(messages, (value, key) => {
          return { name: formatMessage(value), key };
        })
      )}
      label={<FormattedMessage id="app.generateTokenForm.expiration" defaultMessage="Expires In:" />}
      ignoreDirty
    />

    {lastToken !== '' && (
      <div>
        <hr />
        <h4>
          <FormattedMessage id="app.generateTokenForm.lastToken" defaultMessage="Last Token:" />
        </h4>
        <Well className="tokenWell">
          <code>{lastToken}</code>
        </Well>
      </div>
    )}
  </FormBox>
);

GenerateTokenForm.propTypes = {
  warning: PropTypes.any,
  error: PropTypes.any,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  lastToken: PropTypes.string,
  intl: intlShape.isRequired,
};

const validate = ({ scopes, expiration }) => {
  const errors = {};
  if (!scopes || !expiration) {
    return errors;
  }

  if (!scopes['read-all'] && !scopes.master) {
    errors._error = (
      <FormattedHTMLMessage
        id="app.generateTokenForm.validate.noScopes"
        defaultMessage="At least one main scope (<i>read-only</i> or <i>read-write</i>) has to be selected."
      />
    );
  } else if (scopes.master && expiration > WEEK_SEC) {
    errors._error = (
      <FormattedHTMLMessage
        id="app.generateTokenForm.validate.expirationTooLong"
        defaultMessage="The <i>read-write</i> scope has restricted maximal expiration time to one week at the moment."
      />
    );
  }
  return errors;
};

const warn = ({ scopes }) => {
  const warnings = {};
  if (scopes && scopes['read-all'] && scopes.master) {
    warnings._warning = (
      <FormattedHTMLMessage
        id="app.generateTokenForm.warnBothMasterAndReadAll"
        defaultMessage="The <i>read-only</i> scope will have no effect whilst <i>read-write</i> scope is set since <i>read-write</i> implicitly contains <i>read-only</i>."
      />
    );
  }
  return warnings;
};

export default injectIntl(
  reduxForm({
    form: 'generate-token',
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
    validate,
    warn,
  })(GenerateTokenForm)
);
