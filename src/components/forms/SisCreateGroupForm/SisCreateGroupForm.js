import React, { Component } from 'react';
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

class SisCreateGroupForm extends Component {
  render() {
    const {
      isOpen,
      onClose,
      invalid,
      anyTouched,
      handleSubmit,
      submitFailed,
      submitting,
      submitSucceeded,
      warning,
      groupIds,
      groupsAccessor,
      course,
      courseGroupsCount,
      intl: { locale },
    } = this.props;

    return (
      <Modal show={isOpen} backdrop="static" onHide={onClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FormattedMessage
              id="app.sisCreateGroupForm.title"
              defaultMessage="Create a new group associated with SIS scheduling event"
            />
          </Modal.Title>
          <hr />
          {course && <CourseLabel {...course} groupsCount={courseGroupsCount} />}
        </Modal.Header>

        <Modal.Body>
          <Well>
            <InfoIcon gapRight />
            <FormattedMessage
              id="app.sisCreateGroupForm.info"
              defaultMessage="The newly created group will be placed right under selected parent group and it will be automatically bind to selected course (mentioned above). The name of the new group will be derived from the name of the course and its scheduling (you may change it later)."
            />
          </Well>

          <Field
            name="parentGroupId"
            required
            component={SelectField}
            label={<FormattedMessage id="app.sisCreateGroupForm.parentGroup" defaultMessage="Parent group:" />}
            options={(groupIds || [])
              .map(groupId => ({
                key: groupId,
                name: getGroupCanonicalLocalizedName(groupId, groupsAccessor, locale),
              }))
              .sort((a, b) => a.name.localeCompare(b.name, locale))}
            addEmptyOption
            ignoreDirty
          />

          {submitFailed && (
            <Alert bsStyle="danger">
              <FormattedMessage
                id="app.sisCreateGroupForm.failed"
                defaultMessage="Creating group failed. Please try again later."
              />
            </Alert>
          )}

          {warning && <div className="callout callout-warning">{warning}</div>}
        </Modal.Body>

        <Modal.Footer>
          <div className="text-center">
            <SubmitButton
              id="sisCreateGroup"
              invalid={invalid}
              submitting={submitting}
              dirty={anyTouched}
              hasSucceeded={submitSucceeded}
              hasFailed={submitFailed}
              handleSubmit={handleSubmit}
              disabled={Boolean(warning)}
              messages={{
                submit: <FormattedMessage id="app.sisCreateGroupForm.submit" defaultMessage="Create" />,
                submitting: <FormattedMessage id="app.sisCreateGroupForm.submitting" defaultMessage="Creating..." />,
                success: (
                  <FormattedMessage id="app.sisCreateGroupForm.success" defaultMessage="The group was created." />
                ),
              }}
            />

            <Button bsStyle="default" className="btn-flat" onClick={onClose}>
              <CloseIcon gapRight />
              <FormattedMessage id="generic.close" defaultMessage="Close" />
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }
}

SisCreateGroupForm.propTypes = {
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
  groupIds: PropTypes.array,
  groupsAccessor: PropTypes.func.isRequired,
  course: PropTypes.object,
  courseGroupsCount: PropTypes.number,
  intl: intlShape.isRequired,
};

const warn = ({ parentGroupId }) => {
  const warnings = {};

  if (!parentGroupId) {
    warnings._warning = (
      <FormattedMessage
        id="app.sisCreateGroupForm.emptyParentGroup"
        defaultMessage="You need to select the parent group first."
      />
    );
  }

  return warnings;
};

export default reduxForm({
  form: 'sisCreateGroup',
  warn,
})(injectIntl(SisCreateGroupForm));
