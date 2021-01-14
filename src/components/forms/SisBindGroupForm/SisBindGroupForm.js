import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Alert, Modal, Well } from 'react-bootstrap';

import { SelectField } from '../Fields';
import SubmitButton from '../SubmitButton';
import Button from '../../widgets/FlatButton';
import { getGroupCanonicalLocalizedName } from '../../../helpers/localizedData';
import CourseLabel from '../../SisIntegration/CourseLabel';
import { CloseIcon, InfoIcon } from '../../icons';

const SisBindGroupForm = ({
  isOpen,
  onClose,
  invalid,
  anyTouched,
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
  <Modal show={isOpen} backdrop="static" onHide={onClose} size="lg">
    <Modal.Header closeButton>
      <Modal.Title>
        <FormattedMessage
          id="app.sisBindGroupForm.title"
          defaultMessage="Bind existing ReCodEx group with SIS scheduling event"
        />
      </Modal.Title>
      <hr />
      {course && <CourseLabel {...course} groupsCount={courseGroupsCount} />}
    </Modal.Header>

    <Modal.Body>
      <Well>
        <InfoIcon gapRight />
        <FormattedMessage
          id="app.sisBindGroupForm.info"
          defaultMessage="The selected course (mentioned above) will be bound to selected existing group. If you do not have an appropriate group yet, use 'Create group' button instead."
        />
      </Well>

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
        <Alert bsStyle="danger">
          <FormattedMessage
            id="app.sisBindGroupForm.failed"
            defaultMessage="Binding group failed. Please try again later."
          />
        </Alert>
      )}

      {warning && <div className="callout callout-warning">{warning}</div>}
    </Modal.Body>

    <Modal.Footer>
      <div className="text-center">
        <SubmitButton
          id="sisBindGroup"
          invalid={invalid}
          submitting={submitting}
          dirty={anyTouched}
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

        <Button bsStyle="default" onClick={onClose}>
          <CloseIcon gapRight />
          <FormattedMessage id="generic.close" defaultMessage="Close" />
        </Button>
      </div>
    </Modal.Footer>
  </Modal>
);

SisBindGroupForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
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
  intl: intlShape.isRequired,
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
