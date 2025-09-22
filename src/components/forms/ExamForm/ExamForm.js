import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Container, Row, Col, Form } from 'react-bootstrap';
import moment from 'moment';

import Callout from '../../widgets/Callout';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Explanation from '../../widgets/Explanation';
import SubmitButton from '../SubmitButton';
import { CloseIcon, SendIcon } from '../../icons';

import { TextField, CheckboxField, DatetimeField } from '../Fields';

export const secondsToTime = seconds => {
  if (seconds < 0) {
    return '';
  }
  let minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  minutes -= hours * 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

export const timeToSeconds = timeStr => {
  const res = timeStr.match(/^([0-9]+):([0-9]{2})$/);
  if (!res || res.length !== 3) {
    return null;
  }

  const hours = parseInt(res[1]);
  const minutes = parseInt(res[2]);
  return !isNaN(hours) && !isNaN(minutes) ? hours * 3600 + minutes * 60 : null;
};

export const prepareInitValues = (begin = null, end = null, strict = false) => ({
  beginImmediately: false,
  endRelative: false,
  begin: begin ? moment.unix(begin) : moment().add(2, 'hour').startOf('hour'),
  end: end ? moment.unix(end) : begin ? moment.unix(begin).add(2, 'hour') : moment().add(4, 'hour').startOf('hour'),
  strict,
  length: begin && end ? secondsToTime(end - begin) : '2:00',
});

export const transformSubmittedData = ({ beginImmediately, endRelative, begin, end, length, strict = false }) => {
  const beginTs = beginImmediately ? Math.ceil(Date.now() / 1000) : moment.isMoment(begin) ? begin.unix() : null;
  const endTs = endRelative
    ? beginTs && timeToSeconds(length)
      ? beginTs + timeToSeconds(length)
      : null
    : moment.isMoment(end)
      ? end.unix()
      : null;
  return { begin: beginTs, end: endTs, strict };
};

const ExamForm = ({
  error,
  submitting,
  handleSubmit,
  onSubmit,
  dirty = false,
  submitFailed = false,
  submitSucceeded = false,
  invalid,
  reset,
  beginImmediately = false,
  endRelative = false,
  createNew = false,
  examInProgress = false,
  onCancel = null,
}) => (
  <Form method="POST" onSubmit={onSubmit}>
    {submitFailed && (
      <Callout variant="danger">
        <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
      </Callout>
    )}

    <Container fluid>
      <Row>
        <Col lg={6}>
          {examInProgress ? (
            <Callout variant="info">
              <FormattedMessage id="app.examForm.alreadyStarted" defaultMessage="The exam has already started..." />
            </Callout>
          ) : (
            <>
              <Field
                name="beginImmediately"
                tabIndex={1}
                component={CheckboxField}
                ignoreDirty
                onOff
                label={<FormattedMessage id="app.examForm.beginImmediately" defaultMessage="Begin immediately" />}
              />

              {!beginImmediately && (
                <Field
                  name="begin"
                  tabIndex={2}
                  component={DatetimeField}
                  ignoreDirty={createNew}
                  label={
                    <>
                      <FormattedMessage id="app.editAssignmentForm.onlyDeadline" defaultMessage="Deadline:" />
                    </>
                  }
                />
              )}
            </>
          )}
        </Col>

        <Col lg={6}>
          <Field
            name="endRelative"
            tabIndex={3}
            component={CheckboxField}
            ignoreDirty
            onOff
            label={
              <>
                <FormattedMessage id="app.examForm.endRelative" defaultMessage="Set length (instead of explicit end)" />
                <Explanation id="endRelativeExplanation">
                  <FormattedMessage
                    id="app.examForm.endRelativeExplanation"
                    defaultMessage="The end of the exam can be set as explicit date (default), or as a period from the beginning (if this checkbox is set)."
                  />
                </Explanation>
              </>
            }
          />

          {endRelative ? (
            <Field
              name="length"
              tabIndex={4}
              component={TextField}
              ignoreDirty={createNew}
              maxLength={5}
              required
              label={<FormattedMessage id="app.examForm.length" defaultMessage="Length [h:mm]:" />}
            />
          ) : (
            <Field
              name="end"
              tabIndex={4}
              component={DatetimeField}
              ignoreDirty={createNew}
              label={<FormattedMessage id="app.examForm.end" defaultMessage="End:" />}
            />
          )}
        </Col>
      </Row>
      {!examInProgress && (
        <Row>
          <Col xs={12}>
            <hr />
            <Field
              name="strict"
              tabIndex={5}
              component={CheckboxField}
              ignoreDirty
              onOff
              label={
                <>
                  <FormattedMessage id="app.examForm.strict" defaultMessage="Strict lock" />
                  <Explanation id="strictLockExplanation">
                    <FormattedMessage
                      id="app.examForm.strictLockExplanation"
                      defaultMessage="During the exam, students will be required to lock themselves in the group. When locked, access to all other groups is restricted. In case of regular locks, other groups are read-only. If the lock is strict, the groups may not be accessed at all. Use strict locking when the students are to be prevented from utilizing pieced of previously submitted code."
                    />
                  </Explanation>
                </>
              }
            />
          </Col>
        </Row>
      )}
    </Container>

    {error && dirty && <Callout variant="danger">{error}</Callout>}

    <hr />
    <div className="text-center">
      <TheButtonGroup>
        <SubmitButton
          id="editGroup"
          handleSubmit={handleSubmit(data => onSubmit(data).then(reset))}
          submitting={submitting}
          dirty={dirty}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          invalid={invalid}
          defaultIcon={createNew ? <SendIcon gapRight={2} /> : null}
          messages={{
            submit: createNew ? (
              <FormattedMessage id="app.editGroup.examButton" defaultMessage="Create Exam" />
            ) : (
              <FormattedMessage id="app.examForm.saveExam" defaultMessage="Save Exam" />
            ),
            submitting: <FormattedMessage id="generic.saving" defaultMessage="Saving..." />,
            success: <FormattedMessage id="generic.saved" defaultMessage="Saved" />,
          }}
        />
        {onCancel && (
          <Button onClick={onCancel} variant="secondary">
            <CloseIcon gapRight={2} />
            <FormattedMessage id="generic.close" defaultMessage="Close" />
          </Button>
        )}
      </TheButtonGroup>
    </div>
  </Form>
);

ExamForm.propTypes = {
  error: PropTypes.any,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  reset: PropTypes.func,
  onCancel: PropTypes.func,
  createNew: PropTypes.bool,
  beginImmediately: PropTypes.bool,
  endRelative: PropTypes.bool,
  examInProgress: PropTypes.bool,
};

const validate = ({ beginImmediately, begin, endRelative, end, length }, { examInProgress, initialValues }) => {
  const errors = {};
  const tolerance = 60;
  const now = Math.ceil(Date.now() / 1000);

  // check begin time and save its unix ts
  let beginTs = null;
  if (!examInProgress) {
    if (!beginImmediately) {
      if (!moment.isMoment(begin) || begin.unix() < now + tolerance) {
        errors.begin = (
          <FormattedMessage
            id="app.examForm.errors.begin"
            defaultMessage="The beginning must be a valid time record in the future."
          />
        );
      } else {
        beginTs = begin.unix();
      }
    } else {
      beginTs = now;
    }
  } else {
    beginTs = initialValues.begin.unix();
  }

  // check end time and save its unix ts
  let endTs = null;
  if (endRelative) {
    const lengthSec = timeToSeconds(length);
    if (!lengthSec) {
      errors.length = (
        <FormattedMessage
          id="app.examForm.errors.length"
          defaultMessage="The length must be in valid format and not zero."
        />
      );
    } else {
      endTs = beginTs && beginTs + lengthSec;
    }
  } else {
    if (!moment.isMoment(end)) {
      errors.end = (
        <FormattedMessage id="app.examForm.errors.end" defaultMessage="The end must be a valid time record." />
      );
    } else {
      endTs = end.unix();
    }
  }

  // end must be in the future
  if (endTs && endTs < now + tolerance) {
    errors[endRelative ? 'length' : 'end'] = (
      <FormattedMessage id="app.examForm.errors.endInPast" defaultMessage="The end must be in the future." />
    );
  }

  // check the end relative to beginning
  if (beginTs && endTs) {
    if (beginTs >= endTs) {
      errors.end = (
        <FormattedMessage id="app.examForm.errors.endBeforeBegin" defaultMessage="The end must be after beginning." />
      );
    }

    if (endTs - beginTs > 86400) {
      errors[endRelative ? 'length' : 'end'] = (
        <FormattedMessage
          id="app.examForm.errors.tooLongExam"
          defaultMessage="The exam must not be longer than 24 hours."
        />
      );
    }
  }

  return errors;
};

export default reduxForm({
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
  validate,
})(ExamForm);
