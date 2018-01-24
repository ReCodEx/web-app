import React, { Component } from 'react';
import { Alert, Table, Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import Icon from 'react-fontawesome';

import { EditSimpleLimitsField, CheckboxField } from '../Fields';
import SubmitButton from '../SubmitButton';
import FormBox from '../../widgets/FormBox';
import Button from '../../widgets/FlatButton';
import { RefreshIcon } from '../../icons';
import {
  encodeTestId,
  encodeEnvironmentId
} from '../../../redux/modules/simpleLimits';
import prettyMs from 'pretty-ms';

import styles from './styles.less';

class EditSimpleLimitsForm extends Component {
  render() {
    const {
      environments,
      tests,
      cloneHorizontally,
      cloneVertically,
      cloneAll,
      reset,
      handleSubmit,
      dirty,
      submitting,
      submitFailed,
      submitSucceeded,
      invalid,
      intl: { locale }
    } = this.props;
    return (
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
        <Row>
          <Col lg={3}>
            <div className={styles.preciseTime}>
              <Field
                name="preciseTime"
                component={CheckboxField}
                onOff
                label={
                  <FormattedMessage
                    id="app.editSimpleLimitsForm.preciseTime"
                    defaultMessage="Precise Time Measurement"
                  />
                }
              />
            </div>
          </Col>
          <Col lg={9}>
            <div>
              <p className={styles.preciseTimeTooltip}>
                <Icon name="info-circle" style={{ marginRight: '1em' }} />
                <FormattedMessage
                  id="app.editSimpleLimitsForm.preciseTimeTooltip"
                  defaultMessage="If precise time measurement is selected, ReCodEx will measure the consumed CPU time of tested soltions. Otherwise, the wall time will be measured. CPU is better in cases when serial time complexity of the solution is tested and tight time limits are set. Wall time is better in general cases as it better reflects the actual time consumed by the solution (indcluing I/O), but it is more susceptible to errors of measurement."
                />
              </p>
            </div>
          </Col>
        </Row>
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
            {tests
              .sort((a, b) => a.name.localeCompare(b.name, locale))
              .map(test =>
                <tr key={test.name}>
                  <th className={styles.limitsTableHeading}>
                    {test.name}
                  </th>

                  {environments.map(environment => {
                    const id =
                      encodeTestId(test.id) +
                      '.' +
                      encodeEnvironmentId(environment.id);
                    return (
                      <td
                        key={`td.${id}`}
                        className={
                          environments.length > 1 ? styles.colSeparator : ''
                        }
                      >
                        <EditSimpleLimitsField
                          prefix={`limits.${id}`}
                          id={id}
                          testsCount={tests.length}
                          environmentsCount={environments.length}
                          cloneVertically={cloneVertically(
                            'editSimpleLimits',
                            test.id,
                            environment.id
                          )}
                          cloneHorizontally={cloneHorizontally(
                            'editSimpleLimits',
                            test.id,
                            environment.id
                          )}
                          cloneAll={cloneAll(
                            'editSimpleLimits',
                            test.id,
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
      </FormBox>
    );
  }
}

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
  invalid: PropTypes.bool,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

const validate = ({ limits }) => {
  const errors = {};
  const maxSumTime = 300; // 5 minutes

  // Compute sum of wall times for each environment.
  let sums = {};
  Object.keys(limits).forEach(test =>
    Object.keys(limits[test]).forEach(env => {
      if (limits[test][env]['time']) {
        const val = Number(limits[test][env]['time']);
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
          time: (
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
  keepDirtyOnReinitialize: false,
  immutableProps: [
    'environments',
    'tests',
    'cloneHorizontally',
    'cloneVertically',
    'cloneAll',
    'handleSubmit'
  ],
  validate
})(injectIntl(EditSimpleLimitsForm));
