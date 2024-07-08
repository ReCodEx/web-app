import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field, FieldArray } from 'redux-form';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Container, Row, Col } from 'react-bootstrap';

import Callout from '../../widgets/Callout';
import FormBox from '../../widgets/FormBox';
import { SaveIcon } from '../../icons';
import { CheckboxField, NumericTextField, DatetimeField } from '../Fields';
import LocalizedTextsFormField from '../LocalizedTextsFormField';
import SubmitButton from '../SubmitButton';
import Explanation from '../../widgets/Explanation';
import { LocalizedExerciseName } from '../../helpers/LocalizedNames';
import { validateLocalizedTextsFormData } from '../../../helpers/localizedData.js';
import { safeGet } from '../../../helpers/common.js';

const EditShadowAssignmentForm = ({
  initialValues: shadowAssignment,
  dirty,
  submitting,
  handleSubmit,
  onSubmit,
  reset,
  submitFailed,
  submitSucceeded,
  asyncValidating,
  invalid,
  error,
  beingPublished,
}) => (
  <div>
    <FormBox
      title={
        safeGet(shadowAssignment, ['localizedTexts'], []).filter(lt => lt._enabled && lt.name).length > 0 ? (
          <FormattedMessage
            id="app.editShadowAssignment.titleName"
            defaultMessage="Edit Shadow Assignment — {name}"
            values={{
              name: <LocalizedExerciseName entity={shadowAssignment} />,
            }}
          />
        ) : (
          <FormattedMessage id="app.editShadowAssignment.titleShort" defaultMessage="Edit Shadow Assignment" />
        )
      }
      successful={submitSucceeded}
      dirty={dirty}
      unlimitedHeight
      footer={
        <div className="text-center">
          <SubmitButton
            id="editShadowAssignmentForm"
            invalid={invalid}
            submitting={submitting}
            dirty={dirty}
            hasSucceeded={submitSucceeded}
            hasFailed={submitFailed}
            handleSubmit={handleSubmit(data => onSubmit(data).then(reset))}
            asyncValidating={asyncValidating}
            defaultIcon={<SaveIcon gapRight />}
            messages={{
              submit: <FormattedMessage id="generic.save" defaultMessage="Save" />,
              submitting: <FormattedMessage id="generic.saving" defaultMessage="Saving..." />,
              success: <FormattedMessage id="generic.saved" defaultMessage="Saved" />,
            }}
          />
        </div>
      }>
      {submitFailed && (
        <Callout variant="danger">
          <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
        </Callout>
      )}

      <FieldArray name="localizedTexts" component={LocalizedTextsFormField} fieldType="shadowAssignment" />

      <Container fluid>
        <Row>
          <Col sm={6}>
            <Field
              name="deadline"
              component={DatetimeField}
              label={
                <>
                  <FormattedMessage id="app.assignment.deadline" defaultMessage="Deadline" />:
                  <Explanation id="deadlineExplanation">
                    <FormattedMessage
                      id="app.editShadowAssignmentForm.deadlineExplanation"
                      defaultMessage="The deadline has only informative value for the students. It will not affect the assigned points as the points are awarded manually by the supervisor. If you do not wish to set a deadline, leave this field empty."
                    />
                  </Explanation>
                </>
              }
            />
          </Col>

          <Col sm={6}>
            <NumericTextField
              name="maxPoints"
              validateMin={0}
              validateMax={10000}
              maxLength={5}
              label={
                <>
                  <FormattedMessage
                    id="app.editShadowAssignmentForm.maxPoints"
                    defaultMessage="Maximal amount of points:"
                  />
                  <Explanation id="pointsExplanation">
                    <FormattedMessage
                      id="app.editShadowAssignmentForm.pointsExplanation"
                      defaultMessage="The maximal amount of points has only informative value for the students. The supervisor may choose to exceed this limit when awarding points."
                    />
                  </Explanation>
                </>
              }
            />
          </Col>
        </Row>

        <Row>
          <Col sm={6}>
            <Field
              name="isBonus"
              component={CheckboxField}
              onOff
              label={
                <FormattedMessage
                  id="app.editShadowAssignmentForm.isBonus"
                  defaultMessage="Shadow assignment is bonus one and points from it are not included in students overall score"
                />
              }
            />
          </Col>
        </Row>
        <Row>
          <Col sm={6}>
            <Field
              name="isPublic"
              component={CheckboxField}
              onOff
              label={
                <FormattedMessage id="app.editShadowAssignmentForm.isPublic" defaultMessage="Visible to students" />
              }
            />
          </Col>
          {beingPublished && (
            <Col sm={6}>
              <Field
                name="sendNotification"
                component={CheckboxField}
                onOff
                label={
                  <FormattedMessage
                    id="app.editShadowAssignmentForm.sendNotification"
                    defaultMessage="Send e-mail notification to students about new shadow assignment"
                  />
                }
              />
            </Col>
          )}
        </Row>
      </Container>

      {error && <Callout variant="danger">{error}</Callout>}
    </FormBox>
  </div>
);

EditShadowAssignmentForm.propTypes = {
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  dirty: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  invalid: PropTypes.bool,
  localizedTextsLocales: PropTypes.array,
  beingPublished: PropTypes.bool,
  error: PropTypes.object,
};

const validate = ({ localizedTexts }) => {
  const errors = {};
  validateLocalizedTextsFormData(errors, localizedTexts, ({ name }) => {
    const textErrors = {};
    if (!name.trim()) {
      textErrors.name = (
        <FormattedMessage
          id="app.editAssignmentForm.validation.emptyName"
          defaultMessage="Please fill the name of the assignment."
        />
      );
    }

    return textErrors;
  });

  return errors;
};

export default injectIntl(
  reduxForm({
    form: 'editShadowAssignment',
    validate,
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
  })(EditShadowAssignmentForm)
);
