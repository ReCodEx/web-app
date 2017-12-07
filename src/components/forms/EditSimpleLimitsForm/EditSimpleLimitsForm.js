import React from 'react';
import { Alert, Table } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm } from 'redux-form';

import { EditSimpleLimitsField } from '../Fields';
import SubmitButton from '../SubmitButton';
import FormBox from '../../widgets/FormBox';
import Button from '../../widgets/FlatButton';
import { RefreshIcon } from '../../icons';

import {
  encodeTestName,
  encodeEnvironmentId
} from '../../../redux/modules/simpleLimits';
import prettyMs from 'pretty-ms';

import styles from './styles.less';

const EditSimpleLimitsForm = ({
  environments,
  tests,
  cloneHorizontally,
  cloneVertically,
  cloneAll,
  reset,
  handleSubmit,
  anyTouched,
  dirty,
  submitting,
  submitFailed,
  submitSucceeded,
  invalid
}) =>
  <FormBox
    title={
      <FormattedMessage
        id="app.editLimitsBox.title"
        defaultMessage="Edit limits"
      />
    }
    unlimitedHeight
    noPadding
    success={submitSucceeded}
    dirty={dirty}
    footer={
      <div className="text-center">
        {dirty &&
          <span>
            <Button
              type="reset"
              onClick={reset}
              bsStyle={'danger'}
              className="btn-flat"
            >
              <RefreshIcon /> &nbsp;
              <FormattedMessage
                id="app.editSimpleLimitsForm.reset"
                defaultMessage="Reset"
              />
            </Button>{' '}
          </span>}
        <SubmitButton
          id="editSimpleLimits"
          invalid={invalid}
          submitting={submitting}
          dirty={dirty}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          handleSubmit={handleSubmit}
          messages={{
            submit: (
              <FormattedMessage
                id="app.editSimpleLimitsForm.submit"
                defaultMessage="Save Limits"
              />
            ),
            submitting: (
              <FormattedMessage
                id="app.editSimpleLimitsForm.submitting"
                defaultMessage="Saving Limits ..."
              />
            ),
            success: (
              <FormattedMessage
                id="app.editSimpleLimitsForm.success"
                defaultMessage="Limits Saved"
              />
            ),
            validating: (
              <FormattedMessage
                id="app.editSimpleLimitsForm.validating"
                defaultMessage="Validating ..."
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
          id="app.editSimpleLimitsForm.failed"
          defaultMessage="Cannot save the exercise limits. Please try again later."
        />
      </Alert>}

    <Table striped>
      <thead>
        <tr>
          <th />
          {environments.map(environment =>
            <th
              key={'th-' + environment.id}
              className={styles.limitsTableHeading}
            >
              {environment.name}
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {tests.map(test =>
          <tr key={test.name}>
            <th className={styles.limitsTableHeading}>
              {test.name}
            </th>

            {environments.map(environment => {
              const id =
                encodeTestName(test.name) +
                '.' +
                encodeEnvironmentId(environment.id);
              return (
                <td
                  key={`td.${id}`}
                  className={environments.length > 1 ? styles.colSeparator : ''}
                >
                  <EditSimpleLimitsField
                    prefix={`limits.${id}`}
                    id={id}
                    testsCount={tests.length}
                    environmentsCount={environments.length}
                    cloneVertically={cloneVertically(
                      'editSimpleLimits',
                      test.name,
                      environment.id
                    )}
                    cloneHorizontally={cloneHorizontally(
                      'editSimpleLimits',
                      test.name,
                      environment.id
                    )}
                    cloneAll={cloneAll(
                      'editSimpleLimits',
                      test.name,
                      environment.id
                    )}
                  />
                </td>
              );
            })}
          </tr>
        )}
      </tbody>
    </Table>
  </FormBox>;

EditSimpleLimitsForm.propTypes = {
  tests: PropTypes.array.isRequired,
  environments: PropTypes.array,
  cloneHorizontally: PropTypes.func.isRequired,
  cloneVertically: PropTypes.func.isRequired,
  cloneAll: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  dirty: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool
};

const validate = ({ limits }) => {
  const errors = {};
  const maxSumTime = 300; // 5 minutes

  // Compute sum of wall times for each environment.
  let sums = {};
  Object.keys(limits).forEach(test =>
    Object.keys(limits[test]).forEach(env => {
      if (limits[test][env]['wall-time']) {
        const val = Number(limits[test][env]['wall-time']);
        if (!Number.isNaN(val) && val > 0) {
          sums[env] = (sums[env] || 0) + val;
        }
      }
    })
  );

  // Check if some environemnts have exceeded the limit ...
  const limitsErrors = {};
  Object.keys(limits).forEach(test => {
    const testsErrors = {};
    Object.keys(sums).forEach(env => {
      if (sums[env] > maxSumTime) {
        testsErrors[env] = {
          'wall-time': (
            <FormattedMessage
              id="app.editSimpleLimitsForm.validation.timeSum"
              defaultMessage="The sum of time limits ({sum}) exceeds allowed maximum ({max})."
              values={{
                sum: prettyMs(sums[env] * 1000),
                max: prettyMs(maxSumTime * 1000)
              }}
            />
          )
        };
      }
    });
    if (Object.keys(testsErrors).length > 0) {
      limitsErrors[test] = testsErrors;
    }
  });
  if (Object.keys(limitsErrors).length > 0) {
    errors['limits'] = limitsErrors;
  }

  return errors;
};

export default reduxForm({
  form: 'editSimpleLimits',
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  immutableProps: [
    'environments',
    'tests',
    'cloneHorizontally',
    'cloneVertically',
    'cloneAll',
    'handleSubmit'
  ],
  validate
})(EditSimpleLimitsForm);
