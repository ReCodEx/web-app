import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Modal } from 'react-bootstrap';

import { SelectField } from '../Fields';
import SubmitButton from '../SubmitButton';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Callout from '../../widgets/Callout';
import InsetPanel from '../../widgets/InsetPanel';
import { getGroupCanonicalLocalizedName } from '../../../helpers/localizedData.js';
import CourseLabel from '../../SisIntegration/CourseLabel';
import { CloseIcon, InfoIcon } from '../../icons';

const SisBindGroupForm = ({
  isOpen,
  onClose,
  invalid,
  dirty,
  handleSubmit,
  submitFailed,
  submitting,
  submitSucceeded,
  warning,
  groups,
  groupsAccessor,
  course,
  courseGroupsCount,
  intl: { locale },
}) => (
  <Modal show={isOpen} backdrop="static" onHide={onClose} size="xl">
    <Modal.Header closeButton>
      <Modal.Title>
        <FormattedMessage
          id="app.sisBindGroupForm.title"
          defaultMessage="Bind existing ReCodEx group with SIS scheduling event"
        />
      </Modal.Title>
    </Modal.Header>

    <Modal.Body>
      {course && <CourseLabel {...course} groupsCount={courseGroupsCount} />}
      <hr />
      <InsetPanel className="small">
        <InfoIcon gapRight={2} />
        <FormattedMessage
          id="app.sisBindGroupForm.info"
          defaultMessage="The selected course (mentioned above) will be bound to selected existing group. If you do not have an appropriate group yet, use 'Create group' button instead."
        />
      </InsetPanel>

      <Field
        name="groupId"
        required
        component={SelectField}
        label={<FormattedMessage id="app.sisBindGroupForm.group" defaultMessage="Group to bind:" />}
        options={(groups || [])
          .map(group => ({
            key: group.id,
            name: getGroupCanonicalLocalizedName(group, groupsAccessor, locale),
          }))
          .sort((a, b) => a.name.localeCompare(b.name, locale))}
        addEmptyOption
        ignoreDirty
      />

      {submitFailed && (
        <Callout variant="danger">
          <FormattedMessage
            id="app.sisBindGroupForm.failed"
            defaultMessage="Binding group failed. Please try again later."
          />
        </Callout>
      )}

      {warning && <Callout variant="warning">{warning}</Callout>}
    </Modal.Body>

    <Modal.Footer>
      <div className="text-center">
        <TheButtonGroup>
          <SubmitButton
            id="sisBindGroup"
            invalid={invalid}
            submitting={submitting}
            dirty={dirty}
            hasSucceeded={submitSucceeded}
            hasFailed={submitFailed}
            handleSubmit={handleSubmit}
            disabled={Boolean(warning)}
            messages={{
              submit: <FormattedMessage id="app.sisBindGroupForm.submit" defaultMessage="Bind" />,
              submitting: <FormattedMessage id="app.sisBindGroupForm.submitting" defaultMessage="Binding..." />,
              success: <FormattedMessage id="app.sisBindGroupForm.success" defaultMessage="The group was bound." />,
            }}
          />

          <Button variant="outline-secondary" onClick={onClose}>
            <CloseIcon gapRight={2} />
            <FormattedMessage id="generic.close" defaultMessage="Close" />
          </Button>
        </TheButtonGroup>
      </div>
    </Modal.Footer>
  </Modal>
);

SisBindGroupForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool,
  handleSubmit: PropTypes.func.isRequired,
  invalid: PropTypes.bool,
  submitting: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitFailed: PropTypes.bool,
  warning: PropTypes.object,
  groups: PropTypes.array,
  groupsAccessor: PropTypes.func.isRequired,
  course: PropTypes.object,
  courseGroupsCount: PropTypes.number,
  intl: PropTypes.object.isRequired,
};

const warn = ({ groupId }) => {
  const warnings = {};

  if (!groupId) {
    warnings._warning = (
      <FormattedMessage id="app.sisBindGroupForm.emptyGroup" defaultMessage="You need to select the group first." />
    );
  }

  return warnings;
};

export default reduxForm({
  form: 'sisBindGroup',
  warn,
})(injectIntl(SisBindGroupForm));
