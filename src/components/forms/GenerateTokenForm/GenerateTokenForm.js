import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Overlay, Tooltip, Row, Col } from 'react-bootstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import FormBox from '../../widgets/FormBox';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Callout from '../../widgets/Callout';
import InsetPanel from '../../widgets/InsetPanel';
import SubmitButton from '../SubmitButton';
import { CheckboxField, SelectField } from '../Fields';
import { CopyIcon, CopySuccessIcon, SendIcon } from '../../icons';
import { objectMap } from '../../../helpers/common.js';

import './GenerateTokenForm.css';

const scopes = [
  {
    name: (
      <FormattedMessage id="app.generateTokenForm.scope.master" defaultMessage="Master (all operations, default)" />
    ),
    key: 'master',
  },
  { name: <FormattedMessage id="app.generateTokenForm.scope.readAll" defaultMessage="Read-only" />, key: 'read-all' },
  {
    name: <FormattedMessage id="app.generateTokenForm.scope.plagiarism" defaultMessage="Plagiarism detection" />,
    key: 'plagiarism',
  },
  {
    name: <FormattedMessage id="app.generateTokenForm.scope.ref-solutions" defaultMessage="Reference solutions" />,
    key: 'ref-solutions',
  },
];

const superAdminScopes = [
  ...scopes,
  {
    name: (
      <FormattedMessage id="app.generateTokenForm.scope.group-external" defaultMessage="External groups management" />
    ),
    key: 'group-external',
  },
];

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

export const initialValues = {
  scope: 'master',
  expiration: '604800', // one week (in string)
  refresh: true,
};

const GenerateTokenForm = ({
  isSuperAdmin = false,
  error,
  submitting,
  handleSubmit,
  submitFailed = false,
  submitSucceeded = false,
  invalid,
  lastToken,
  intl: { formatMessage },
}) => {
  const [copied, setCopied] = useState(false);
  const btnTarget = useRef(null);

  return (
    <FormBox
      title={<FormattedMessage id="app.generateTokenForm.title" defaultMessage="Generate Application Token" />}
      type={submitSucceeded ? 'success' : undefined}
      footer={
        <div className="text-center">
          <TheButtonGroup>
            {lastToken && (
              <>
                <CopyToClipboard text={lastToken} onCopy={() => setCopied(!copied)}>
                  <Button variant={copied ? 'secondary' : 'info'} ref={btnTarget}>
                    {copied ? <CopySuccessIcon gapRight={2} fixedWidth /> : <CopyIcon gapRight={2} fixedWidth />}
                    <FormattedMessage id="app.generateTokenForm.copyToClipboard" defaultMessage="Copy to Clipboard" />
                  </Button>
                </CopyToClipboard>
                <Overlay target={btnTarget.current} show={copied} placement="bottom">
                  {props => (
                    <Tooltip id="token-copied" {...props}>
                      <FormattedMessage id="app.generateTokenForm.copied" defaultMessage="Copied!" />
                    </Tooltip>
                  )}
                </Overlay>
              </>
            )}

            <SubmitButton
              id="generateToken"
              handleSubmit={handleSubmit}
              submitting={submitting}
              hasSucceeded={submitSucceeded}
              hasFailed={submitFailed}
              invalid={invalid}
              defaultIcon={<SendIcon gapRight={2} />}
              messages={{
                submit: <FormattedMessage id="app.generateTokenForm.generate" defaultMessage="Generate" />,
                submitting: <FormattedMessage id="app.generateTokenForm.generating" defaultMessage="Generating..." />,
                success: <FormattedMessage id="app.generateTokenForm.generated" defaultMessage="Generated" />,
              }}
            />
          </TheButtonGroup>
        </div>
      }>
      <InsetPanel>
        <FormattedMessage
          id="app.generateTokenForm.info"
          defaultMessage="This form should help advanced users to access API directly. It may be used to generate security tokens which are used for authentication and authorization of API operations. The scopes may restrict the set of operations authorized by the token beyond the limitations of the user role."
        />
      </InsetPanel>

      <Row>
        <Col md={12} lg={6} xl={4}>
          <Field
            name="scope"
            component={SelectField}
            options={isSuperAdmin ? superAdminScopes : scopes}
            label={<FormattedMessage id="app.generateTokenForm.scope" defaultMessage="Scope:" />}
            ignoreDirty
          />
        </Col>
        <Col md={12} lg={6} xl={4}>
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
        </Col>
        <Col lg={12} xl={4} className="align-self-end">
          <Field
            name="refresh"
            component={CheckboxField}
            onOff
            label={
              <FormattedMessage
                id="app.generateTokenForm.scope.refresh"
                defaultMessage="Allow refreshing indefinitely"
              />
            }
            ignoreDirty
          />
        </Col>
      </Row>

      {error && <Callout variant="danger">{error}</Callout>}

      {submitFailed && (
        <Callout variant="danger">
          <FormattedMessage
            id="app.generateTokenForm.failed"
            defaultMessage="The process of token creation has failed. Please try again later."
          />
        </Callout>
      )}

      {lastToken !== '' && (
        <div>
          <hr />
          <h4>
            <FormattedMessage id="app.generateTokenForm.lastToken" defaultMessage="Last Token:" />
          </h4>
          <InsetPanel className="tokenWell">
            <code>{lastToken}</code>
          </InsetPanel>
        </div>
      )}
    </FormBox>
  );
};

GenerateTokenForm.propTypes = {
  isSuperAdmin: PropTypes.bool,
  error: PropTypes.any,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  lastToken: PropTypes.string,
  intl: PropTypes.object.isRequired,
};

const validate = ({ scope, expiration }) => {
  const errors = {};
  if (!scope || !expiration) {
    return errors;
  }

  if (scope === 'master' && expiration > WEEK_SEC) {
    errors._error = (
      <FormattedMessage
        id="app.generateTokenForm.validate.expirationTooLong"
        defaultMessage="The <i>Master</i> scope has restricted maximal expiration time to one week at the moment."
        values={{
          i: contents => (
            <i>
              {Array.isArray(contents)
                ? contents.map((c, i) => <React.Fragment key={i}>{c}</React.Fragment>)
                : contents}
            </i>
          ),
        }}
      />
    );
  }
  return errors;
};

export default injectIntl(
  reduxForm({
    form: 'generate-token',
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
    validate,
  })(GenerateTokenForm)
);
