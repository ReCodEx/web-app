import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Alert } from 'react-bootstrap';

import FormBox from '../../widgets/FormBox';
import { SelectField } from '../Fields';
import SubmitButton from '../SubmitButton';
import { getGroupCanonicalLocalizedName } from '../../../helpers/localizedData';

class SisCreateGroupForm extends Component {
  render() {
    const {
      invalid,
      anyTouched,
      handleSubmit,
      submitFailed,
      submitting,
      submitSucceeded,
      groups,
      groupsAccessor,
      intl: { locale },
    } = this.props;

    return (
      <FormBox
        title={<FormattedMessage id="app.sisCreateGroupForm.title" defaultMessage="Create ReCoVid group from SIS" />}
        succeeded={submitSucceeded}
        dirty={anyTouched}
        footer={
          <div className="text-center">
            <SubmitButton
              id="sisCreateGroup"
              invalid={invalid}
              submitting={submitting}
              dirty={anyTouched}
              hasSucceeded={submitSucceeded}
              hasFailed={submitFailed}
              handleSubmit={handleSubmit}
              messages={{
                submit: <FormattedMessage id="app.sisCreateGroupForm.submit" defaultMessage="Create" />,
                submitting: <FormattedMessage id="app.sisCreateGroupForm.submitting" defaultMessage="Creating..." />,
                success: (
                  <FormattedMessage id="app.sisCreateGroupForm.success" defaultMessage="The group was created." />
                ),
              }}
            />
          </div>
        }>
        {submitFailed && (
          <Alert bsStyle="danger">
            <FormattedMessage
              id="app.sisCreateGroupForm.failed"
              defaultMessage="Creating group failed. Please try again later."
            />
          </Alert>
        )}

        <Field
          name="parentGroupId"
          required
          component={SelectField}
          label={<FormattedMessage id="app.sisCreateGroupForm.parentGroup" defaultMessage="Parent group:" />}
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
  }
}

SisCreateGroupForm.propTypes = {
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

const validate = ({ parentGroupId }) => {
  const errors = {};

  if (!parentGroupId) {
    errors.parentGroupId = (
      <FormattedMessage id="app.sisCreateGroupForm.emptyParentGroup" defaultMessage="Please fill the parent group." />
    );
  }

  return errors;
};

export default reduxForm({
  form: 'sisCreateGroup',
  validate,
})(injectIntl(SisCreateGroupForm));
