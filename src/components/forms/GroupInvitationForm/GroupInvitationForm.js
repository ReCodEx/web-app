import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Container, Row, Col } from 'react-bootstrap';
import moment from 'moment';

import SubmitButton from '../SubmitButton';
import Callout from '../../widgets/Callout';
import Explanation from '../../widgets/Explanation';
import { CheckboxField, TextField, DatetimeField } from '../Fields';

export const createNewGroupInvitationInitialData = () => ({
  hasExpiration: false,
  expireAt: moment().add(1, 'months').endOf('day'),
  note: '',
});

export const createEditGroupInvitationInitialData = ({ expireAt = null, note = '' }) => ({
  hasExpiration: expireAt !== null,
  expireAt: expireAt !== null ? moment.unix(expireAt) : moment().add(1, 'months').endOf('day'),
  note,
});

const GroupInvitationForm = ({
  hasExpiration,
  submitting,
  handleSubmit,
  dirty,
  submitFailed = false,
  submitSucceeded = false,
  asyncValidating,
  invalid,
  intl: { locale },
}) => (
  <Container fluid>
    <Row>
      <Col md={6}>
        <Field
          name="hasExpiration"
          component={CheckboxField}
          onOff
          label={
            <FormattedMessage id="app.groupInvitationForm.hasExpirationDate" defaultMessage="Has expiration date" />
          }
        />
      </Col>
      {hasExpiration && (
        <Col md={6}>
          <Field
            name="expireAt"
            component={DatetimeField}
            label={
              <>
                <FormattedMessage id="app.groupInvitationForm.expireAt" defaultMessage="Expire at:" />
                <Explanation id="expire-at">
                  <FormattedMessage
                    id="app.groupInvitationForm.expireAtExplanation"
                    defaultMessage="An invitation link will be still recognized by ReCodEx after the expiration date, but the students will not be allowed to use it."
                  />
                </Explanation>
              </>
            }
          />
        </Col>
      )}
    </Row>

    <Row>
      <Col xs={12}>
        <Field
          name="note"
          component={TextField}
          maxLength={255}
          label={
            <>
              <FormattedMessage id="app.groupInvitationForm.note" defaultMessage="Note:" />
              <Explanation id="note">
                <FormattedMessage
                  id="app.groupInvitationForm.noteExplanation"
                  defaultMessage="The note is displayed to the students before they accept the invitation and join the group."
                />
              </Explanation>
            </>
          }
        />
      </Col>
    </Row>

    <Row>
      <Col xs={12}>
        {submitFailed && (
          <Callout variant="danger">
            <FormattedMessage id="generic.operationFailed" defaultMessage="Operation failed. Please try again later." />
          </Callout>
        )}

        <div className="text-center">
          <SubmitButton
            id="groupInvitationSubmit"
            handleSubmit={handleSubmit}
            submitting={submitting}
            dirty={dirty}
            invalid={invalid}
            hasSucceeded={submitSucceeded}
            hasFailed={submitFailed}
            asyncValidating={asyncValidating}
            messages={{
              submit: <FormattedMessage id="generic.save" defaultMessage="Save" />,
              submitting: <FormattedMessage id="generic.saving" defaultMessage="Saving..." />,
              success: <FormattedMessage id="generic.saved" defaultMessage="Saved" />,
            }}
          />
        </div>
      </Col>
    </Row>
  </Container>
);

GroupInvitationForm.propTypes = {
  hasExpiration: PropTypes.bool,
  handleSubmit: PropTypes.func.isRequired,
  asyncValidate: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  dirty: PropTypes.bool,
  submitting: PropTypes.bool,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  invalid: PropTypes.bool,
  intl: PropTypes.object.isRequired,
};

export default reduxForm({
  form: 'group-invitation',
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
})(injectIntl(GroupInvitationForm));
