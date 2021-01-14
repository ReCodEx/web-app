import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, intlShape, injectIntl } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Alert } from 'react-bootstrap';
import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';
import { SelectField, NumericTextField } from '../Fields';

const messages = defineMessages({
  summerTerm: {
    id: 'app.addSisTermForm.summer',
    defaultMessage: 'Summer term',
  },
  winterTerm: {
    id: 'app.addSisTermForm.winter',
    defaultMessage: 'Winter term',
  },
});

const AddSisTermForm = ({
  submitting,
  handleSubmit,
  anyTouched,
  submitFailed = false,
  submitSucceeded = false,
  invalid,
  intl: { formatMessage },
}) => (
  <FormBox
    title={<FormattedMessage id="app.addSisTermForm.title" defaultMessage="Add new term" />}
    type={submitSucceeded ? 'success' : undefined}
    isOpen={true}
    collapsable={false}
    footer={
      <div className="text-center">
        <SubmitButton
          id="add-sis-term"
          handleSubmit={handleSubmit}
          submitting={submitting}
          dirty={anyTouched}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          invalid={invalid}
          messages={{
            submit: <FormattedMessage id="app.addSisTermForm.submit" defaultMessage="Save new term" />,
            submitting: <FormattedMessage id="app.addSisTermForm.processing" defaultMessage="Saving..." />,
            success: <FormattedMessage id="app.addSisTermForm.success" defaultMessage="The term is saved." />,
          }}
        />
      </div>
    }>
    {submitFailed && (
      <Alert bsStyle="danger">
        <FormattedMessage id="app.addSisTermForm.failed" defaultMessage="Cannot save the new SIS term." />
      </Alert>
    )}

    <NumericTextField
      name="year"
      validateMin={2000}
      validateMax={2099}
      maxLength={4}
      label={<FormattedMessage id="app.addSisTermForm.year" defaultMessage="Year:" />}
      ignoreDirty
    />
    <Field
      name="term"
      component={SelectField}
      label={<FormattedMessage id="app.addSisTermForm.term" defaultMessage="Term:" />}
      options={[
        { name: formatMessage(messages.winterTerm), key: 1 },
        { name: formatMessage(messages.summerTerm), key: 2 },
      ]}
      addEmptyOption
      ignoreDirty
    />
  </FormBox>
);

AddSisTermForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  anyTouched: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(
  reduxForm({
    form: 'add-sis-term',
  })(AddSisTermForm)
);
