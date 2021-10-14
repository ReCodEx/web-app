import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Form } from 'react-bootstrap';
import { reduxForm, Field } from 'redux-form';
import { defaultMemoize } from 'reselect';

import { SelectField } from '../Fields';
import SubmitButton from '../SubmitButton';
import Icon, { RefreshIcon, WarningIcon } from '../../icons';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Callout from '../../widgets/Callout';
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
  dirty = false,
  groups,
  groupsAccessor,
  reset,
  intl: { locale },
}) => (
  <div>
    {submitFailed && (
      <Callout variant="danger">
        <WarningIcon gapRight />
        <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
      </Callout>
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
        <TheButtonGroup>
          {dirty && (
            <Button type="reset" onClick={reset} variant="danger">
              <RefreshIcon gapRight />
              <FormattedMessage id="generic.reset" defaultMessage="Reset" />
            </Button>
          )}
          <SubmitButton
            id="relocateGroup"
            disabled={invalid || !dirty}
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
        </TheButtonGroup>
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
  dirty: PropTypes.bool,
  handleSubmit: PropTypes.func.isRequired,
  links: PropTypes.object,
  groups: PropTypes.array,
  groupsAccessor: PropTypes.func.isRequired,
  reset: PropTypes.func,
  intl: PropTypes.object,
};

export default reduxForm({
  form: 'relocateGroup',
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
})(injectIntl(RelocateGroupForm));
