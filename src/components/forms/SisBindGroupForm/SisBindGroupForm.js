import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Alert } from 'react-bootstrap';

import FormBox from '../../widgets/FormBox';
import { SelectField } from '../Fields';
import SubmitButton from '../SubmitButton';

import { getGroupCanonicalLocalizedName } from '../../../helpers/localizedData';

const SisBindGroupForm = ({
  invalid,
  anyTouched,
  handleSubmit,
  submitFailed,
  submitting,
  submitSucceeded,
  groups,
  groupsAccessor,
  intl: { locale },
}) => (
  <FormBox
    title={
      <FormattedMessage
        id="app.sisBindGroupForm.title"
        defaultMessage="Bind existing ReCodEx group to SIS"
      />
    }
    succeeded={submitSucceeded}
    dirty={anyTouched}
    footer={
      <div className="text-center">
        <SubmitButton
          id="sisBindGroup"
          invalid={invalid}
          submitting={submitting}
          dirty={anyTouched}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
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
                defaultMessage="Binding..."
              />
            ),
            success: (
              <FormattedMessage
                id="app.sisBindGroupForm.success"
                defaultMessage="The group was bound."
              />
            ),
          }}
        />
      </div>
    }>
    {submitFailed && (
      <Alert bsStyle="danger">
        <FormattedMessage
          id="app.sisBindGroupForm.failed"
          defaultMessage="Binding group failed. Please try again later."
        />
      </Alert>
    )}

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
      options={groups
        .map(group => ({
          key: group.id,
          name: getGroupCanonicalLocalizedName(group, groupsAccessor, locale),
        }))
        .sort((a, b) => a.name.localeCompare(b.name, locale))}
      addEmptyOption
    />
  </FormBox>
);

SisBindGroupForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  handleSubmit: PropTypes.func.isRequired,
  invalid: PropTypes.bool,
  submitting: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitFailed: PropTypes.bool,
  groups: PropTypes.array,
  groupsAccessor: PropTypes.func.isRequired,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
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
  validate,
})(injectIntl(SisBindGroupForm));
