import React, { Component } from 'react';
import { Alert, Table, Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import Icon from 'react-fontawesome';

import { EditLimitsField, CheckboxField } from '../Fields';
import SubmitButton from '../SubmitButton';
import FormBox from '../../widgets/FormBox';
import Button from '../../widgets/FlatButton';
import { RefreshIcon } from '../../icons';
import { encodeId, encodeNumId } from '../../../helpers/common';
import { validateLimitsTimeTotals } from '../../../helpers/exerciseLimits';

import styles from './styles.less';

class EditLimitsForm extends Component {
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
                    id="app.editLimitsForm.reset"
                    defaultMessage="Reset"
                  />
                </Button>{' '}
              </span>}
            <SubmitButton
              id="editLimits"
              invalid={invalid}
              submitting={submitting}
              dirty={dirty}
              hasSucceeded={submitSucceeded}
              hasFailed={submitFailed}
              handleSubmit={handleSubmit}
              messages={{
                submit: (
                  <FormattedMessage
                    id="app.editLimitsForm.submit"
                    defaultMessage="Save Limits"
                  />
                ),
                submitting: (
                  <FormattedMessage
                    id="app.editLimitsForm.submitting"
                    defaultMessage="Saving Limits ..."
                  />
                ),
                success: (
                  <FormattedMessage
                    id="app.editLimitsForm.success"
                    defaultMessage="Limits Saved"
                  />
                ),
                validating: (
                  <FormattedMessage
                    id="app.editLimitsForm.validating"
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
              id="app.editLimitsForm.failed"
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
                    id="app.editLimitsForm.preciseTime"
                    defaultMessage="Precise Time Measurement"
                  />
                }
              />
            </div>
          </Col>
          <Col lg={9}>
            <div>
              <p className={styles.preciseTimeTooltip}>
                <Icon name="info-circle" />
                <FormattedMessage
                  id="app.editLimitsForm.preciseTimeTooltip"
                  defaultMessage="If precise time measurement is selected, ReCodEx will measure the consumed CPU time of tested solutions. Otherwise, the wall time will be measured. CPU is better in cases when serial time complexity of the solution is tested and tight time limits are set. Wall time is better in general cases as it better reflects the actual time consumed by the solution (including I/O), but it is more susceptible to errors of measurement."
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
                      encodeNumId(test.id) + '.' + encodeId(environment.id);
                    return (
                      <td
                        key={`td.${id}`}
                        className={
                          environments.length > 1 ? styles.colSeparator : ''
                        }
                      >
                        <EditLimitsField
                          prefix={`limits.${id}`}
                          id={id}
                          testsCount={tests.length}
                          environmentsCount={environments.length}
                          cloneVertically={cloneVertically(
                            'editLimits',
                            test.id,
                            environment.id
                          )}
                          cloneHorizontally={cloneHorizontally(
                            'editLimits',
                            test.id,
                            environment.id
                          )}
                          cloneAll={cloneAll(
                            'editLimits',
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

EditLimitsForm.propTypes = {
  tests: PropTypes.array.isRequired,
  environments: PropTypes.array,
  constraints: PropTypes.object,
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

const validate = ({ limits }, { constraints }) => {
  const errors = {};
  const limitsErrors = validateLimitsTimeTotals(limits, constraints.totalTime);

  Object.keys(limitsErrors).forEach(test => {
    Object.keys(limitsErrors[test]).forEach(env => {
      limitsErrors[test][env] = {
        time: (
          <FormattedMessage
            id="app.editLimitsForm.validation.totalTime"
            defaultMessage="The time limits total is out of range. See limits constraints for details."
          />
        )
      };
    });
  });
  if (Object.keys(limitsErrors).length > 0) {
    errors['limits'] = limitsErrors;
  }

  return errors;
};

export default reduxForm({
  form: 'editLimits',
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
})(injectIntl(EditLimitsForm));
