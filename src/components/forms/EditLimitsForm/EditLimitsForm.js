import React, { Component } from 'react';
import { Table, Container, Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import classnames from 'classnames';

import { EditLimitsField, CheckboxField } from '../Fields';
import SubmitButton from '../SubmitButton';
import FormBox from '../../widgets/FormBox';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Callout from '../../widgets/Callout';
import { InfoIcon, SaveIcon, RefreshIcon } from '../../icons';
import { encodeId, encodeNumId, identity } from '../../../helpers/common.js';
import { validateLimitsTimeTotals } from '../../../helpers/exercise/limits.js';

import * as styles from './styles.less';

class EditLimitsForm extends Component {
  render() {
    const {
      readOnly = false,
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
      error,
      intl: { locale },
    } = this.props;

    return (
      <FormBox
        id="limits-form"
        title={<FormattedMessage id="app.editLimitsBox.title" defaultMessage="Execution Limits" />}
        unlimitedHeight
        noPadding
        success={submitSucceeded}
        dirty={dirty}
        footer={
          !readOnly ? (
            <div className="text-center">
              <TheButtonGroup>
                {dirty && (
                  <Button type="reset" onClick={reset} variant="danger">
                    <RefreshIcon gapRight={2} />
                    <FormattedMessage id="generic.reset" defaultMessage="Reset" />
                  </Button>
                )}
                <SubmitButton
                  id="editLimits"
                  invalid={invalid}
                  submitting={submitting}
                  dirty={dirty}
                  hasSucceeded={submitSucceeded}
                  hasFailed={submitFailed}
                  handleSubmit={handleSubmit}
                  defaultIcon={<SaveIcon gapRight={2} />}
                  messages={{
                    submit: <FormattedMessage id="app.editLimitsForm.submit" defaultMessage="Save Limits" />,
                    submitting: (
                      <FormattedMessage id="app.editLimitsForm.submitting" defaultMessage="Saving Limits..." />
                    ),
                    success: <FormattedMessage id="app.editLimitsForm.success" defaultMessage="Limits Saved" />,
                    validating: <FormattedMessage id="generic.validating" defaultMessage="Validating..." />,
                  }}
                />
              </TheButtonGroup>
            </div>
          ) : null
        }>
        <Container fluid>
          <Row>
            <Col lg={3}>
              <div className={styles.preciseTime}>
                <Field
                  name="preciseTime"
                  component={CheckboxField}
                  onOff
                  disabled={readOnly}
                  label={
                    <FormattedMessage id="app.editLimitsForm.preciseTime" defaultMessage="Precise Time Measurement" />
                  }
                />
              </div>
            </Col>
            <Col lg={9}>
              <div>
                <p className={styles.preciseTimeTooltip}>
                  <InfoIcon gapRight={2} />
                  <FormattedMessage
                    id="app.editLimitsForm.preciseTimeTooltip"
                    defaultMessage="If precise time measurement is selected, ReCodEx will measure the consumed CPU time of tested solutions. Otherwise, the wall time will be measured. CPU is better in cases when serial time complexity of the solution is tested and tight time limits are set. Wall time is better in general cases as it better reflects the actual time consumed by the solution (including I/O), but it is more susceptible to errors of measurement."
                  />
                </p>
              </div>
            </Col>
          </Row>
        </Container>

        <hr />

        <Table striped>
          <thead>
            <tr>
              <th />
              {environments.map(environment => (
                <th key={`th-${environment.id}`} className={styles.limitsTableHeading}>
                  {environment.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tests
              .sort((a, b) => a.name.localeCompare(b.name, locale))
              .map(test => (
                <tr key={test.name}>
                  <th className={styles.limitsTableHeading}>{test.name}</th>

                  {environments.map(environment => {
                    const id = encodeNumId(test.id) + '.' + encodeId(environment.id);
                    return (
                      <td
                        key={`td.${id}`}
                        className={classnames({
                          [styles.colSeparator]: environments.length > 1,
                          [styles.limitsCell]: true,
                        })}>
                        <EditLimitsField
                          prefix={`limits.${id}`}
                          id={id}
                          testsCount={tests.length}
                          environmentsCount={environments.length}
                          disabled={readOnly}
                          cloneVertically={cloneVertically('editLimits', test.id, environment.id)}
                          cloneHorizontally={cloneHorizontally('editLimits', test.id, environment.id)}
                          cloneAll={cloneAll('editLimits', test.id, environment.id)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
          </tbody>
        </Table>

        {submitFailed && (
          <Callout variant="danger">
            <FormattedMessage
              id="app.editLimitsForm.failed"
              defaultMessage="Cannot save the exercise limits. Please try again later."
            />
          </Callout>
        )}

        {error && (
          <div className="px-3">
            <Callout variant="danger">{error}</Callout>
          </div>
        )}
      </FormBox>
    );
  }
}

EditLimitsForm.propTypes = {
  readOnly: PropTypes.bool,
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
  error: PropTypes.any,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
};

const validate = ({ limits }, { constraints, environments }) => {
  const errors = {};
  if (!limits) {
    return errors;
  }

  const brokenEnvironments = validateLimitsTimeTotals(limits, constraints.totalTime);

  if (brokenEnvironments && brokenEnvironments.length > 0) {
    errors._error = (
      <FormattedMessage
        id="app.editLimitsForm.validation.totalTime"
        defaultMessage="The time limits for some environments ({environments}) are violating the total allowed time per exercise constraint. Please, make sure that the total sum of the time limits is within the constraints of the selected hardware group."
        values={{
          environments: brokenEnvironments
            .map(env => environments.find(({ id }) => encodeId(id) === env))
            .filter(identity)
            .map(env => env.name)
            .join(', '),
        }}
      />
    );
  }
  return errors;
};

export default reduxForm({
  form: 'editLimits',
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
  immutableProps: ['environments', 'tests', 'cloneHorizontally', 'cloneVertically', 'cloneAll', 'handleSubmit'],
  validate,
})(injectIntl(EditLimitsForm));
