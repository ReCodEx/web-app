import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field, formValues } from 'redux-form';
import { Container, Row, Col, FormLabel, Modal } from 'react-bootstrap';

import UsersNameContainer from '../../../containers/UsersNameContainer';
import DateTime from '../../widgets/DateTime';
import SubmitButton from '../SubmitButton';
import Callout from '../../widgets/Callout';
import Explanation from '../../widgets/Explanation';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import { CloseIcon, InfoIcon, LinkIcon, EditIcon } from '../../icons';
import { CheckboxField, MarkdownTextAreaField } from '../Fields';
import { storageGetItem, storageSetItem } from '../../../helpers/localStorage.js';

import ReviewCommentSnippetDialog from './ReviewCommentSnippetDialog.js';

const textValidator = text => !text || text.trim() === '';

const localStorageKeyPrefix = 'ReviewCommentForm.snippet-';

const ACE_COMMANDS = [
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
];

export const newCommentFormInitialValues = {
  text: '',
  issue: false,
  suppressNotification: false,
};

class ReviewCommentForm extends Component {
  state = { dialogOpen: false, lastChangedSnippet: null, lastChangedSnippetNew: false, lastChangedSnippetTime: null };

  componentDidMount() {
    for (let i = 0; i <= 9; ++i) {
      this.setState({ [`snippet${i}`]: storageGetItem(`${localStorageKeyPrefix}${i}`, null) });
    }
  }

  componentWillUnmount() {
    this.unmounted = true;
    if (this.resetAfterSomeTime) {
      window.clearTimeout(this.resetAfterSomeTime);
      this.resetAfterSomeTime = undefined;
      this.resetLastChangedSnippet();
    }
  }

  showLastChangedSnippet = (key, isNew) => {
    this.setState({ lastChangedSnippet: key, lastChangedSnippetNew: isNew, lastChangedSnippetTime: Date.now() });

    if (!this.unmounted) {
      if (this.resetAfterSomeTime) {
        window.clearTimeout(this.resetAfterSomeTime);
      }
      this.resetAfterSomeTime = window.setTimeout(this.resetLastChangedSnippet, 2000);
    }
  };

  resetLastChangedSnippet = () => {
    this.setState({ lastChangedSnippet: null, lastChangedSnippetNew: false, lastChangedSnippetTime: null });
  };

  getSnippet = key => this.state[`snippet${key}`] || null;

  setSnippet = (key, value) => {
    const oldSnippet = this.getSnippet(key);
    if (oldSnippet !== value) {
      this.setState({ [`snippet${key}`]: value });
      storageSetItem(`${localStorageKeyPrefix}${key}`, value);

      this.showLastChangedSnippet(key, !oldSnippet);
    }
  };

  useSnippet = key => {
    this.props.change('text', this.getSnippet(key) || '');
  };

  openDialog = () => {
    this.setState({ dialogOpen: true });
  };

  closeDialog = () => {
    this.setState({ dialogOpen: false });
  };

  render() {
    const {
      fileName,
      lineNumber,
      form,
      authorId = null,
      createdAt = null,
      onCancel = null,
      showSuppressor = false,
      submitting,
      handleSubmit,
      submitFailed = false,
      submitSucceeded = false,
      invalid,
    } = this.props;

    const ReviewCommentSnippetDialogWithValues = formValues('text')(ReviewCommentSnippetDialog);

    return (
      <div className="commentForm pt-3">
        <Container fluid>
          <Row>
            <Col>
              {authorId && createdAt && (
                <small className="float-end">
                  <UsersNameContainer userId={authorId} showEmail="icon" />
                  <span className="ms-3">
                    <DateTime unixTs={createdAt} showRelative />
                  </span>
                </small>
              )}

              <FormLabel>
                {createdAt === null ? (
                  <FormattedMessage id="app.reviewCommentForm.labelNew" defaultMessage="Create new comment:" />
                ) : (
                  <FormattedMessage id="app.reviewCommentForm.labelEdit" defaultMessage="Modify existing comment:" />
                )}
              </FormLabel>
              <Field
                name="text"
                component={MarkdownTextAreaField}
                validate={textValidator}
                focus
                hideMarkdownPreview
                getSnippet={this.getSnippet}
                setSnippet={this.setSnippet}
                commands={ACE_COMMANDS}
              />

              {this.state.lastChangedSnippet !== null ? (
                <small key={this.state.lastChangedSnippetTime} className="fadeout-2 fw-bold text-success">
                  <EditIcon gapRight />
                  {this.state.lastChangedSnippetNew ? (
                    <FormattedMessage
                      id="app.reviewCommentForm.snippetNew"
                      defaultMessage="Snippet #{key} was set."
                      values={{ key: this.state.lastChangedSnippet }}
                    />
                  ) : (
                    <FormattedMessage
                      id="app.reviewCommentForm.snippetChanged"
                      defaultMessage="Snippet #{key} was changed."
                      values={{ key: this.state.lastChangedSnippet }}
                    />
                  )}
                </small>
              ) : (
                <small className="text-muted">
                  <InfoIcon gapRight />
                  <FormattedMessage
                    id="app.reviewCommentForm.snippetsInfo"
                    defaultMessage="<code>Ctrl+Alt+[num]</code> record snippets marked #0..#9, <code>Ctrl+[num]</code> inserts previously recorded snippet"
                    values={{
                      code: s => (
                        <code>
                          <b>{s}</b>
                        </code>
                      ),
                    }}
                  />

                  <LinkIcon
                    gapLeft
                    className="text-primary"
                    onClick={this.openDialog}
                    tooltipId="snippet-dialog"
                    tooltip={
                      <FormattedMessage
                        id="app.reviewCommentForm.openSnippetDialog"
                        defaultMessage="Open snippets dialog."
                      />
                    }
                  />
                </small>
              )}

              <hr />
            </Col>
          </Row>
          <Row>
            <Col>
              <Field
                id={`${form}-issue`}
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
                  id={`${form}-suppressNotification`}
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
                    <CloseIcon gapRight={2} />
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

        <Modal show={this.state.dialogOpen} backdrop="static" onHide={this.closeDialog} size="xl">
          <Modal.Header closeButton>
            <Modal.Title>
              <FormattedMessage id="app.reviewCommentForm.snippetsDialog" defaultMessage="Text snippets" />
            </Modal.Title>
          </Modal.Header>

          <ReviewCommentSnippetDialogWithValues
            {...this.state}
            fileName={fileName}
            lineNumber={lineNumber}
            useSnippet={this.useSnippet}
            setSnippet={this.setSnippet}
          />
        </Modal>
      </div>
    );
  }
}

ReviewCommentForm.propTypes = {
  fileName: PropTypes.string,
  lineNumber: PropTypes.number,
  form: PropTypes.string,
  createdAt: PropTypes.number,
  authorId: PropTypes.string,
  onCancel: PropTypes.func,
  showSuppressor: PropTypes.bool,
  handleSubmit: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
};

export default reduxForm({
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
})(ReviewCommentForm);
