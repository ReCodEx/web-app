import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
  defineMessages,
  intlShape
} from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import {
  Alert,
  Well,
  OverlayTrigger,
  Tooltip,
  Grid,
  Row,
  Col
} from 'react-bootstrap';
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
    id: 'app.generateToken.scope.readAll',
    defaultMessage: 'Read-only'
  },
  master: {
    id: 'app.generateToken.scope.master',
    defaultMessage: 'Read-write'
  },
  refresh: {
    id: 'app.generateToken.scope.refresh',
    defaultMessage: 'Allow refreshing indefinitely'
  }
});

const messages = defineMessages({
  [1 * 60 * 60]: {
    id: 'app.generateToken.hour',
    defaultMessage: '1 Hour'
  },
  [24 * 60 * 60]: {
    id: 'app.generateToken.day',
    defaultMessage: '1 Day'
  },
  [7 * 24 * 60 * 60]: {
    id: 'app.generateToken.week',
    defaultMessage: '1 Week'
  },
  [31 * 24 * 60 * 60]: {
    id: 'app.generateToken.month',
    defaultMessage: '1 Month'
  },
  [365 * 24 * 60 * 60]: {
    id: 'app.generateToken.year',
    defaultMessage: '1 Year'
  }
});

const GenerateTokenForm = ({
  submitting,
  handleSubmit,
  submitFailed = false,
  submitSucceeded = false,
  dirty,
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
          dirty={dirty}
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

    <h4>
      <FormattedMessage
        id="app.generateToken.scopes"
        defaultMessage="Scopes:"
      />
    </h4>
    <Grid fluid>
      <Row>
        {Object.values(
          objectMap(availableScopes, (message, scope) =>
            <Col sm={6} key={scope}>
              <Field
                name={`scopes.${scope}`}
                component={CheckboxField}
                onOff
                label={formatMessage(message)}
              />
            </Col>
          )
        )}
      </Row>
    </Grid>
    <hr />

    <Field
      name="expiration"
      component={SelectField}
      options={Object.values(
        objectMap(messages, (value, key) => {
          return { name: formatMessage(value), key };
        })
      )}
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
        <h4>
          <FormattedMessage
            id="app.generateToken.lastToken"
            defaultMessage="Last Token:"
          />
        </h4>
        <Well className="tokenWell">
          <code>
            {lastToken}
          </code>
        </Well>
        <CopyToClipboard text={lastToken}>
          <OverlayTrigger
            trigger="click"
            rootClose
            placement="bottom"
            overlay={
              <Tooltip id={lastToken}>
                <FormattedMessage
                  id="app.generateToken.copied"
                  defaultMessage="Copied!"
                />
              </Tooltip>
            }
          >
            <Button bsStyle="info">
              <CopyIcon gapRight fixedWidth />
              <FormattedMessage
                id="app.generateToken.copyToClipboard"
                defaultMessage="Copy to clipboard"
              />
            </Button>
          </OverlayTrigger>
        </CopyToClipboard>
      </div>}
  </FormBox>;

GenerateTokenForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  dirty: PropTypes.bool,
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
