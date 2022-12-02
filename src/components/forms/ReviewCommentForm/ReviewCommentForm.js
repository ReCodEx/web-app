import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Container, Row, Col, FormLabel } from 'react-bootstrap';

import UsersNameContainer from '../../../containers/UsersNameContainer';
import DateTime from '../../widgets/DateTime';
import SubmitButton from '../SubmitButton';
import Callout from '../../widgets/Callout';
import Explanation from '../../widgets/Explanation';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import { CloseIcon } from '../../icons';
import { CheckboxField, MarkdownTextAreaField } from '../Fields';

const textValidator = text => !text || text.trim() === '';

const ReviewCommentForm = ({
  authorId = null,
  createdAt = null,
  onCancel = null,
  showSuppressor = false,
  submitting,
  handleSubmit,
  submitFailed = false,
  submitSucceeded = false,
  invalid,
  intl: { locale },
}) => (
  <div className="commentForm pt-3">
    <Container fluid>
      <Row>
        <Col>
          {authorId && createdAt && (
            <small className="float-right">
              <UsersNameContainer userId={authorId} showEmail="icon" />
              <span className="ml-3">
                <DateTime unixts={createdAt} showRelative />
              </span>
            </small>
          )}

          <FormLabel>
            {createdAt === null ? (
              <FormattedMessage id="app.reviewCommentForm.labelNew" defaultMessage="Create new comment:" />
            ) : (
              <FormattedMessage id="app.reviewCommentForm.labelEdit" defaultMessage="Modify existing commment:" />
            )}
          </FormLabel>
          <Field
            name="text"
            component={MarkdownTextAreaField}
            validate={textValidator}
            focus
            commands={[
              {
                name: 'save',
                bindKey: { win: 'Ctrl-enter', mac: 'Cmd-enter' },
                exec: editor => {
                  const button = editor.container.closest('.commentForm').querySelector('button[type=submit]');
                  if (button) {
                    button.click();
                  }
                },
              },
            ]}
          />
          <hr />
        </Col>
      </Row>
      <Row>
        <Col>
          <Field
            name="issue"
            component={CheckboxField}
            onOff
            label={
              <>
                <FormattedMessage id="app.reviewCommentForm.isIssue" defaultMessage="Issue" />
                <Explanation id="isIssue">
                  <FormattedMessage
                    id="app.reviewCommentForm.isIssueExplanation"
                    defaultMessage="Comments marked as issues are expected to be addressed and fixed by the author in the next submission."
                  />
                </Explanation>
              </>
            }
          />
        </Col>

        {showSuppressor && (
          <Col sm="auto">
            <Field
              name="suppressNotification"
              component={CheckboxField}
              onOff
              label={
                <>
                  <FormattedMessage
                    id="app.reviewCommentForm.suppressNotification"
                    defaultMessage="Suppress e-mail notification"
                  />
                  <Explanation id="suppressNotification" placement="bottom">
                    <FormattedMessage
                      id="app.reviewCommentForm.suppressNotificationExplanation"
                      defaultMessage="When the review is closed, a notification is sent to the author with every change. You may suppress the notification if the change you are performing is not significant."
                    />
                  </Explanation>
                </>
              }
            />
          </Col>
        )}

        <Col sm="auto">
          <TheButtonGroup>
            <SubmitButton
              id="groupInvitationSubmit"
              handleSubmit={handleSubmit}
              submitting={submitting}
              disabled={invalid}
              hasSucceeded={submitSucceeded}
              hasFailed={submitFailed}
              size="sm"
              messages={{
                submit: <FormattedMessage id="generic.save" defaultMessage="Save" />,
                submitting: <FormattedMessage id="generic.saving" defaultMessage="Saving..." />,
                success: <FormattedMessage id="generic.saved" defaultMessage="Saved" />,
              }}
            />

            {onCancel && (
              <Button variant="secondary" size="sm" onClick={onCancel}>
                <CloseIcon gapRight />
                <FormattedMessage id="generic.cancel" defaultMessage="Cancel" />
              </Button>
            )}
          </TheButtonGroup>
        </Col>
      </Row>
    </Container>

    {submitFailed && (
      <Callout variant="danger">
        <FormattedMessage id="generic.operationFailed" defaultMessage="Operation failed. Please try again later." />
      </Callout>
    )}
  </div>
);

ReviewCommentForm.propTypes = {
  createdAt: PropTypes.number,
  authorId: PropTypes.string,
  onCancel: PropTypes.func,
  showSuppressor: PropTypes.bool,
  handleSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  intl: PropTypes.object.isRequired,
};

export default reduxForm({
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
})(injectIntl(ReviewCommentForm));
