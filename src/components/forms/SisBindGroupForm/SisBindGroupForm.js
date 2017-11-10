import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Alert } from 'react-bootstrap';

import FormBox from '../../widgets/FormBox';
import { SelectField } from '../Fields';
import SubmitButton from '../SubmitButton';

import { getLocalizedName } from '../../../helpers/getLocalizedData';

const SisBindGroupForm = ({
  invalid,
  anyTouched,
  handleSubmit,
  submitFailed: hasFailed,
  submitting,
  hasSucceeded,
  groups,
  intl: { locale }
}) =>
  <FormBox
    title={
      <FormattedMessage
        id="app.sisBindGroupForm.title"
        defaultMessage="Bind existing ReCodEx group to SIS"
      />
    }
    type={hasSucceeded ? 'success' : undefined}
    footer={
      <div className="text-center">
        <SubmitButton
          id="sisBindGroup"
          invalid={invalid}
          submitting={submitting}
          dirty={anyTouched}
          hasSucceeded={hasSucceeded}
          hasFailed={hasFailed}
          handleSubmit={handleSubmit}
          messages={{
            submit: (
              <FormattedMessage
                id="app.sisBindGroupForm.submit"
                defaultMessage="Bind"
              />
            ),
            submitting: (
              <FormattedMessage
                id="app.sisBindGroupForm.submitting"
                defaultMessage="Binding ..."
              />
            ),
            success: (
              <FormattedMessage
                id="app.sisBindGroupForm.success"
                defaultMessage="The group was bound."
              />
            )
          }}
        />
      </div>
    }
  >
    {hasFailed &&
      <Alert bsStyle="danger">
        <FormattedMessage
          id="app.sisBindGroupForm.failed"
          defaultMessage="Binding group failed. Please try again later."
        />
      </Alert>}

    <Field
      name="groupId"
      required
      component={SelectField}
      label={
        <FormattedMessage
          id="app.sisBindGroupForm.group"
          defaultMessage="Group:"
        />
      }
      options={[{ key: '', name: '...' }].concat(
        groups.map(group => ({
          key: group.id,
          name: getLocalizedName(group, locale)
        }))
      )}
    />
  </FormBox>;

SisBindGroupForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  handleSubmit: PropTypes.func.isRequired,
  invalid: PropTypes.bool,
  submitting: PropTypes.bool,
  hasSucceeded: PropTypes.bool,
  submitFailed: PropTypes.bool,
  groups: PropTypes.array,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

const validate = ({ groupId }) => {
  const errors = {};

  if (!groupId) {
    errors['groupId'] = (
      <FormattedMessage
        id="app.sisBindGroupForm.emptyGroup"
        defaultMessage="Please fill the group."
      />
    );
  }

  return errors;
};

export default reduxForm({
  form: 'sisBindGroup',
  validate
})(injectIntl(SisBindGroupForm));
