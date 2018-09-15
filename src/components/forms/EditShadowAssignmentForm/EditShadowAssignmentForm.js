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

const EditShadowAssignmentForm = ({
  initialValues: assignment,
  dirty,
  submitting,
  handleSubmit,
  submitFailed,
  submitSucceeded,
  asyncValidating,
  invalid,
  error,
  localizedTextsLocales,
  beingPublished
}) =>
  <div>
    <FormBox
      title={
        <FormattedMessage
          id="app.editShadowAssignment.title"
          defaultMessage="Edit Shadow Assignment"
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

      {error &&
        <Alert bsStyle="danger">
          {error}
        </Alert>}

      <FieldArray
        name="localizedTexts"
        localizedTextsLocales={localizedTextsLocales}
        component={LocalizedTextsFormField}
        fieldType="assignment"
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
                    defaultMessage="Send e-mail notification to students"
                  />
                }
              />
            </Col>}
        </Row>
      </Grid>
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

  if (localizedTexts.length < 1) {
    errors['_error'] = (
      <FormattedMessage
        id="app.editShadowAssignmentForm.validation.noLocalizedText"
        defaultMessage="Please add at least one localized text describing the assignment."
      />
    );
  }

  const localizedTextsErrors = {};
  for (let i = 0; i < localizedTexts.length; ++i) {
    const localeErrors = {};
    if (!localizedTexts[i]) {
      localeErrors['locale'] = (
        <FormattedMessage
          id="app.editShadowAssignmentForm.validation.localizedText"
          defaultMessage="Please fill localized information."
        />
      );
    } else {
      if (!localizedTexts[i].name) {
        localeErrors['name'] = (
          <FormattedMessage
            id="app.editShadowAssignmentForm.validation.emptyName"
            defaultMessage="Please fill the name of the assignment."
          />
        );
      }

      if (!localizedTexts[i].locale) {
        localeErrors['locale'] = (
          <FormattedMessage
            id="app.editShadowAssignmentForm.validation.localizedText.locale"
            defaultMessage="Please select the language."
          />
        );
      }

      if (!localizedTexts[i].text && !localizedTexts[i].link) {
        localeErrors['text'] = (
          <FormattedMessage
            id="app.editShadowAssignmentForm.validation.localizedText.text"
            defaultMessage="Please fill the description in this language or provide an external link below."
          />
        );
      }
    }

    if (Object.keys(localeErrors).length > 0) {
      localizedTextsErrors[i] = localeErrors;
    }
  }

  const localeArr = localizedTexts
    .filter(text => text !== undefined)
    .map(text => text.locale);
  for (let i = 0; i < localeArr.length; ++i) {
    if (localeArr.indexOf(localeArr[i]) !== i) {
      if (localizedTextsErrors[i] && !localizedTextsErrors[i].locale) {
        if (!localizedTextsErrors[i]) {
          localizedTextsErrors[i] = {};
        }
        localizedTextsErrors[i].locale = (
          <FormattedMessage
            id="app.editShadowAssignmentForm.validation.sameLocalizedTexts"
            defaultMessage="There are more language variants with the same locale. Please make sure locales are unique."
          />
        );
      }
    }
  }

  if (Object.keys(localizedTextsErrors).length > 0) {
    errors['localizedTexts'] = localizedTextsErrors;
  }

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
