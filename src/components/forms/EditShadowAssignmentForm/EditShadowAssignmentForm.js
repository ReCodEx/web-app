import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field, FieldArray } from 'redux-form';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Alert, HelpBlock, Grid, Row, Col } from 'react-bootstrap';

import FormBox from '../../widgets/FormBox';
import { TextField, CheckboxField } from '../Fields';
import LocalizedTextsFormField from '../LocalizedTextsFormField';
import SubmitButton from '../SubmitButton';
import { LocalizedExerciseName } from '../../helpers/LocalizedNames';
import { isNonNegativeInteger } from '../../helpers/validation';
import { validateLocalizedTextsFormData } from '../../../helpers/localizedData';

const EditShadowAssignmentForm = ({
  initialValues: shadowAssignment,
  dirty,
  submitting,
  handleSubmit,
  submitFailed,
  submitSucceeded,
  asyncValidating,
  invalid,
  error,
  beingPublished
}) =>
  <div>
    <FormBox
      title={
        <FormattedMessage
          id="app.editShadowAssignment.titleName"
          defaultMessage="Edit Shadow Assignment — {name}"
          values={{
            name: <LocalizedExerciseName entity={shadowAssignment} />
          }}
        />
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
            handleSubmit={handleSubmit}
            asyncValidating={asyncValidating}
            messages={{
              submit: (
                <FormattedMessage id="generic.save" defaultMessage="Save" />
              ),
              submitting: (
                <FormattedMessage
                  id="generic.saving"
                  defaultMessage="Saving ..."
                />
              ),
              success: (
                <FormattedMessage id="generic.saved" defaultMessage="Saved" />
              )
            }}
          />
        </div>
      }
    >
      {submitFailed &&
        <Alert bsStyle="danger">
          <FormattedMessage
            id="generic.savingFailed"
            defaultMessage="Saving failed. Please try again later."
          />
        </Alert>}

      <FieldArray
        name="localizedTexts"
        component={LocalizedTextsFormField}
        fieldType="shadowAssignment"
      />

      <Field
        name="maxPoints"
        component={TextField}
        parse={value => Number(value)}
        label={
          <FormattedMessage
            id="app.editShadowAssignmentForm.maxPoints"
            defaultMessage="Maximal amount of points:"
          />
        }
      />

      <Grid fluid>
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
                <FormattedMessage
                  id="app.editShadowAssignmentForm.isPublic"
                  defaultMessage="Visible to students"
                />
              }
            />
          </Col>
          {beingPublished &&
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
            </Col>}
        </Row>
      </Grid>

      {error &&
        <Alert bsStyle="danger">
          {error}
        </Alert>}
    </FormBox>
  </div>;

EditShadowAssignmentForm.propTypes = {
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  invalid: PropTypes.bool,
  localizedTextsLocales: PropTypes.array,
  beingPublished: PropTypes.bool,
  error: PropTypes.object
};

const validate = (
  { localizedTexts, maxPoints },
  { intl: { formatMessage } }
) => {
  const errors = {};
  validateLocalizedTextsFormData(
    errors,
    localizedTexts,
    ({ name, text, link }) => {
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
    }
  );

  if (!isNonNegativeInteger(maxPoints)) {
    errors.maxPoints = (
      <FormattedMessage
        id="app.editShadowAssignmentForm.validation.maxPoints"
        defaultMessage="Please fill the maximal number of points."
      />
    );
  }

  return errors;
};

export default injectIntl(
  reduxForm({
    form: 'editShadowAssignment',
    validate,
    enableReinitialize: true,
    keepDirtyOnReinitialize: false
  })(EditShadowAssignmentForm)
);
