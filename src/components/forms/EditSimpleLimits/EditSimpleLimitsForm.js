import React from 'react';
import { Alert, Table } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm } from 'redux-form';

import { EditSimpleLimitsField } from '../Fields';
import SubmitButton from '../SubmitButton';
import FormBox from '../../widgets/FormBox';

import styles from './styles.less';

const EditSimpleLimitsForm = ({
  environments,
  editLimits,
  tests,
  setHorizontally,
  setVertically,
  setAll,
  anyTouched,
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
    /* type={submitSucceeded ? 'success' : undefined} */
    footer={
      <div className="text-center">
        <SubmitButton
          id="editSimpleLimits"
          invalid={invalid}
          submitting={submitting}
          dirty={anyTouched}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          handleSubmit={f => f}
          /*        asyncValidating={asyncValidating} */
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
                defaultMessage="Limits Saved."
              />
            ),
            validating: (
              <FormattedMessage
                id="app.editSimpleLimitsForm.validating"
                defaultMessage="Validating..."
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
          id="app.bonusPointsForm.failed"
          defaultMessage="Cannot save the bonus points."
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
              {environment.id}
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
                'test' + btoa(test.name) + '.env' + btoa(environment.id);
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
                    setHorizontally={setHorizontally(test.name)}
                    setVertically={setVertically(test.name)}
                    setAll={setAll(test.name)}
                  />
                </td>
              );
            })}

            {/* <LimitsField
            prefix={`limits.${test.name}`}
            label={test}
            id={`${envName}/${test.name}`}
            setHorizontally={setHorizontally(test.name)}
            setVertically={setVertically(test.name)}
            setAll={setAll(test.name)}
          /> */}
          </tr>
        )}
      </tbody>
    </Table>
  </FormBox>;

EditSimpleLimitsForm.propTypes = {
  tests: PropTypes.array.isRequired,
  environments: PropTypes.array,
  editLimits: PropTypes.func.isRequired,
  setHorizontally: PropTypes.func.isRequired,
  setVertically: PropTypes.func.isRequired,
  setAll: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool
};

const validate = ({ limits }) => {
  const errors = {};
  /*
  for (let test of Object.keys(limits)) {
    const testErrors = {};
    const fields = limits[test];

    if (!fields['memory'] || fields['memory'].length === 0) {
      testErrors['memory'] = (
        <FormattedMessage
          id="app.editEnvironmentLimitsForm.validation.memory"
          defaultMessage="You must set the memory limit."
        />
      );
    } else if (
      Number(fields['memory']).toString() !== fields['memory'] ||
      Number(fields['memory']) <= 0
    ) {
      testErrors['memory'] = (
        <FormattedMessage
          id="app.editEnvironmentLimitsForm.validation.memory.mustBePositive"
          defaultMessage="You must set the memory limit to a positive number."
        />
      );
    }

    if (!fields['time'] || fields['time'].length === 0) {
      testErrors['time'] = (
        <FormattedMessage
          id="app.editEnvironmentLimitsForm.validation.time"
          defaultMessage="You must set the time limit."
        />
      );
    } else if (
      Number(fields['time']).toString() !== fields['time'] ||
      Number(fields['time']) <= 0
    ) {
      testErrors['time'] = (
        <FormattedMessage
          id="app.editEnvironmentLimitsForm.validation.time.mustBePositive"
          defaultMessage="You must set the time limit to a positive number."
        />
      );
    }

    if (!fields['parallel'] || fields['parallel'].length === 0) {
      testErrors['parallel'] = (
        <FormattedMessage
          id="app.editEnvironmentLimitsForm.validation.parallel"
          defaultMessage="You must set the limit for the number of parallel processes."
        />
      );
    } else if (
      Number(fields['parallel']).toString() !== fields['parallel'] ||
      Number(fields['parallel']) <= 0
    ) {
      testErrors['parallel'] = (
        <FormattedMessage
          id="app.editEnvironmentLimitsForm.validation.parallel.mustBePositive"
          defaultMessage="You must set the limit for the number of parallel processes to a positive number."
        />
      );
    }

    if (testErrors.length > 0) {
      errors[test] = testErrors;
    }
  }
*/
  return errors;
};

export default reduxForm({
  form: 'editSimpleLimits',
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  validate
})(EditSimpleLimitsForm);
