import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage, intlShape } from 'react-intl';
import { Alert, Form } from 'react-bootstrap';
import { reduxForm, Field } from 'redux-form';
import { defaultMemoize } from 'reselect';

import { SelectField } from '../Fields';
import SubmitButton from '../SubmitButton';
import Icon, { WarningIcon } from '../../../components/icons';
import { getGroupCanonicalLocalizedName } from '../../../helpers/localizedData';
import { hasPermissions } from '../../../helpers/common';

export const getPossibleParentsOfGroup = defaultMemoize((groups, group) =>
  groups.filter(g => g.id !== group.id && hasPermissions(g, 'addSubgroup') && !g.parentGroupsIds.includes(group.id))
);

const RelocateGroupForm = ({
  submitting,
  handleSubmit,
  submitFailed,
  submitSucceeded,
  invalid,
  groups,
  groupsAccessor,
  intl: { locale },
}) => (
  <div>
    {submitFailed && (
      <Alert variant="danger">
        <WarningIcon gapRight />
        <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
      </Alert>
    )}
    <Form>
      <Field
        name={'groupId'}
        component={SelectField}
        label={<FormattedMessage id="app.relocateGroupForm.parentGroup" defaultMessage="Parent Group:" />}
        options={groups
          .map(group => ({
            key: group.id,
            name: getGroupCanonicalLocalizedName(group, groupsAccessor, locale),
          }))
          .sort((a, b) => a.name.localeCompare(b.name, locale))}
      />

      <div className="text-center">
        <SubmitButton
          id="relocateGroup"
          disabled={invalid}
          submitting={submitting}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          handleSubmit={handleSubmit}
          defaultIcon={<Icon icon="people-carry" gapRight />}
          messages={{
            submit: <FormattedMessage id="app.relocateGroupForm.submit" defaultMessage="Relocate" />,
            submitting: <FormattedMessage id="app.relocateGroupForm.submitting" defaultMessage="Relocating..." />,
            success: <FormattedMessage id="app.relocateGroupForm.success" defaultMessage="Group Relocated" />,
          }}
        />
      </div>
    </Form>
  </div>
);

RelocateGroupForm.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }),
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  handleSubmit: PropTypes.func.isRequired,
  links: PropTypes.object,
  groups: PropTypes.array,
  groupsAccessor: PropTypes.func.isRequired,
  intl: intlShape,
};

export default reduxForm({
  form: 'relocateGroup',
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
})(injectIntl(RelocateGroupForm));
