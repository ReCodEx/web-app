import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field, FieldArray } from 'redux-form';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Alert, Container, Row, Col } from 'react-bootstrap';

import FormBox from '../../widgets/FormBox';
import { CheckboxField, NumericTextField } from '../Fields';
import LocalizedTextsFormField from '../LocalizedTextsFormField';
import SubmitButton from '../SubmitButton';
import { LocalizedExerciseName } from '../../helpers/LocalizedNames';
import { validateLocalizedTextsFormData } from '../../../helpers/localizedData';
import { safeGet } from '../../../helpers/common';

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
          <FormattedMessage id="app.editShadowAssignment.title" defaultMessage="Edit Shadow Assignment" />
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
            messages={{
              submit: <FormattedMessage id="generic.save" defaultMessage="Save" />,
              submitting: <FormattedMessage id="generic.saving" defaultMessage="Saving..." />,
              success: <FormattedMessage id="generic.saved" defaultMessage="Saved" />,
            }}
          />
        </div>
      }>
      {submitFailed && (
        <Alert variant="danger">
          <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
        </Alert>
      )}

      <FieldArray name="localizedTexts" component={LocalizedTextsFormField} fieldType="shadowAssignment" />

      <NumericTextField
        name="maxPoints"
        validateMin={0}
        validateMax={10000}
        maxLength={5}
        label={
          <FormattedMessage id="app.editShadowAssignmentForm.maxPoints" defaultMessage="Maximal amount of points:" />
        }
      />

      <Container fluid>
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

      {error && <Alert variant="danger">{error}</Alert>}
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
