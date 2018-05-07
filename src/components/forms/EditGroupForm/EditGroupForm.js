import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field, FieldArray } from 'redux-form';
import { Alert, Grid, Row, Col } from 'react-bootstrap';
import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';
import LocalizedTextsFormField from '../LocalizedTextsFormField';

import { TextField, CheckboxField } from '../Fields';

export const EDIT_GROUP_FORM_EMPTY_INITIAL_VALUES = {
  isPublic: false,
  publicStats: false,
  hasThreshold: false,
  threshold: ''
};

const EditGroupForm = ({
  submitting,
  handleSubmit,
  anyTouched,
  submitFailed = false,
  submitSucceeded = false,
  invalid,
  createNew = false,
  localizedTextsLocales,
  hasThreshold,
  isPublic,
  collapsable = false,
  isOpen = true,
  reset,
  isSuperAdmin
}) =>
  <FormBox
    title={
      createNew
        ? <FormattedMessage
            id="app.editGroupForm.titleNew"
            defaultMessage="Create Subgroup"
          />
        : <FormattedMessage
            id="app.editGroupForm.titleEdit"
            defaultMessage="Edit Group"
          />
    }
    type={submitSucceeded ? 'success' : undefined}
    footer={
      <div className="text-center">
        <SubmitButton
          id="editGroup"
          handleSubmit={data => handleSubmit(data).then(() => reset())}
          submitting={submitting}
          dirty={anyTouched}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          invalid={invalid}
          messages={{
            submit: createNew
              ? <FormattedMessage
                  id="app.editGroupForm.createGroup"
                  defaultMessage="Create Group"
                />
              : <FormattedMessage
                  id="app.editGroupForm.saveGroup"
                  defaultMessage="Save Group"
                />,
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
    collapsable={collapsable}
    isOpen={isOpen}
    unlimitedheight
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
      localizedTextsLocales={localizedTextsLocales}
      component={LocalizedTextsFormField}
      isGroup={true}
    />

    {isSuperAdmin &&
      <Field
        name="externalId"
        tabIndex={2}
        component={TextField}
        required
        label={
          <FormattedMessage
            id="app.createGroup.externalId"
            defaultMessage="External ID of the group (e.g., ID of schedule event in the school IS):"
          />
        }
      />}
    <br />
    <Grid fluid>
      <Row>
        {(isSuperAdmin || isPublic) && // any user can turn public flag off, but only superuser may turn it on :)
          <Col lg={6}>
            <Field
              name="isPublic"
              tabIndex={3}
              component={CheckboxField}
              onOff
              label={
                <FormattedMessage
                  id="app.createGroup.isPublic"
                  defaultMessage="Public (everyone can see and join this group)"
                />
              }
              required
            />
          </Col>}
        <Col lg={isSuperAdmin || isPublic ? 6 : 12}>
          <Field
            name="publicStats"
            tabIndex={4}
            component={CheckboxField}
            onOff
            label={
              <FormattedMessage
                id="app.createGroup.publicStats"
                defaultMessage="Students can see statistics of each other"
              />
            }
            required
          />
        </Col>
      </Row>

      <Row>
        <Col lg={6}>
          <Field
            name="hasThreshold"
            tabIndex={5}
            component={CheckboxField}
            onOff
            label={
              <FormattedMessage
                id="app.createGroup.hasThreshold"
                defaultMessage="Students require cetrain number of points to complete the course"
              />
            }
            required
          />
        </Col>
        <Col lg={6}>
          {hasThreshold &&
            <Field
              name="threshold"
              tabIndex={6}
              component={TextField}
              label={
                <FormattedMessage
                  id="app.createGroup.threshold"
                  defaultMessage="Minimum percent of the total points count needed to complete the course:"
                />
              }
            />}
        </Col>
      </Row>
    </Grid>
  </FormBox>;

EditGroupForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  hasThreshold: PropTypes.bool,
  isPublic: PropTypes.bool,
  localizedTextsLocales: PropTypes.array,
  createNew: PropTypes.bool,
  collapsable: PropTypes.bool,
  isOpen: PropTypes.bool,
  reset: PropTypes.func,
  isSuperAdmin: PropTypes.bool
};

const validate = ({ localizedTexts = [], hasThreshold, threshold }) => {
  const errors = {};

  if (hasThreshold) {
    threshold = String(threshold);
    const numericThreshold = Number(threshold);
    if (
      isNaN(numericThreshold) ||
      threshold !== Math.round(numericThreshold).toString()
    ) {
      errors['threshold'] = (
        <FormattedMessage
          id="app.createGroup.validation.thresholdMustBeInteger"
          defaultMessage="Threshold must be an integer."
        />
      );
    } else if (numericThreshold < 0 || numericThreshold > 100) {
      errors['threshold'] = (
        <FormattedMessage
          id="app.createGroup.validation.thresholdBetweenZeroHundred"
          defaultMessage="Threshold must be an integer in between 0 and 100."
        />
      );
    }
  }

  if (localizedTexts.length < 1) {
    errors['_error'] = (
      <FormattedMessage
        id="app.createGroupForm.validation.noLocalizedText"
        defaultMessage="Please add at least one localized text describing the group."
      />
    );
  }

  const localizedTextsErrors = {};
  for (let i = 0; i < localizedTexts.length; ++i) {
    const localeErrors = {};
    if (!localizedTexts[i]) {
      localeErrors['locale'] = (
        <FormattedMessage
          id="app.editGroupForm.validation.localizedText"
          defaultMessage="Please fill localized information."
        />
      );
    } else {
      if (!localizedTexts[i].name) {
        localeErrors['name'] = (
          <FormattedMessage
            id="app.editGroupForm.validation.emptyName"
            defaultMessage="Please fill the name of the group."
          />
        );
      }

      if (!localizedTexts[i].locale) {
        localeErrors['locale'] = (
          <FormattedMessage
            id="app.editGroupForm.validation.localizedText.locale"
            defaultMessage="Please select the language."
          />
        );
      }

      if (!localizedTexts[i].text) {
        localeErrors['text'] = (
          <FormattedMessage
            id="app.editGroupForm.validation.localizedText.text"
            defaultMessage="Please fill the description in this language."
          />
        );
      }
    }

    localizedTextsErrors[i] = localeErrors;
  }

  const localeArr = localizedTexts
    .filter(text => text !== undefined)
    .map(text => text.locale);
  for (let i = 0; i < localeArr.length; ++i) {
    if (localeArr.indexOf(localeArr[i]) !== i) {
      if (!localizedTextsErrors[i].locale) {
        localizedTextsErrors[i].locale = (
          <FormattedMessage
            id="app.editGroupForm.validation.sameLocalizedTexts"
            defaultMessage="There are more language variants with the same locale. Please make sure locales are unique."
          />
        );
      }
    }
  }
  errors['localizedTexts'] = localizedTextsErrors;

  return errors;
};

export default reduxForm({
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
  validate
})(EditGroupForm);
