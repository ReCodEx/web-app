import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field, FieldArray } from 'redux-form';
import { Alert, Grid, Row, Col } from 'react-bootstrap';
import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';
import LocalizedTextsFormField from '../LocalizedTextsFormField';

import { TextField, CheckboxField, NumericTextField } from '../Fields';
import {
  getLocalizedTextsInitialValues,
  validateLocalizedTextsFormData,
} from '../../../helpers/localizedData';

export const EDIT_GROUP_FORM_LOCALIZED_TEXTS_DEFAULT = {
  name: '',
  description: '',
};

export const EDIT_GROUP_FORM_EMPTY_INITIAL_VALUES = {
  isPublic: false,
  publicStats: false,
  hasThreshold: false,
  threshold: '',
  localizedTexts: getLocalizedTextsInitialValues(
    [],
    EDIT_GROUP_FORM_LOCALIZED_TEXTS_DEFAULT
  ),
};

const EditGroupForm = ({
  error,
  submitting,
  handleSubmit,
  onSubmit,
  dirty = false,
  submitFailed = false,
  submitSucceeded = false,
  invalid,
  createNew = false,
  hasThreshold,
  isPublic,
  collapsable = false,
  isOpen = true,
  reset,
  isSuperAdmin,
}) => (
  <FormBox
    title={
      createNew ? (
        <FormattedMessage
          id="app.editGroupForm.titleNew"
          defaultMessage="Create Subgroup"
        />
      ) : (
        <FormattedMessage
          id="app.editGroupForm.titleEdit"
          defaultMessage="Edit Group"
        />
      )
    }
    type={submitSucceeded ? 'success' : undefined}
    footer={
      <div className="text-center">
        <SubmitButton
          id="editGroup"
          handleSubmit={handleSubmit(data => onSubmit(data).then(reset))}
          submitting={submitting}
          dirty={dirty}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          invalid={invalid}
          messages={{
            submit: createNew ? (
              <FormattedMessage
                id="app.editGroupForm.createGroup"
                defaultMessage="Create Group"
              />
            ) : (
              <FormattedMessage
                id="app.editGroupForm.saveGroup"
                defaultMessage="Save Group"
              />
            ),
            submitting: (
              <FormattedMessage
                id="generic.saving"
                defaultMessage="Saving..."
              />
            ),
            success: (
              <FormattedMessage id="generic.saved" defaultMessage="Saved" />
            ),
          }}
        />
      </div>
    }
    collapsable={collapsable}
    isOpen={isOpen}
    unlimitedheight>
    {submitFailed && (
      <Alert bsStyle="danger">
        <FormattedMessage
          id="generic.savingFailed"
          defaultMessage="Saving failed. Please try again later."
        />
      </Alert>
    )}

    <FieldArray
      name="localizedTexts"
      component={LocalizedTextsFormField}
      fieldType="group"
    />

    {isSuperAdmin && (
      <Field
        name="externalId"
        tabIndex={2}
        component={TextField}
        maxLength={255}
        required
        label={
          <FormattedMessage
            id="app.createGroup.externalId"
            defaultMessage="External ID of the group (e.g., ID of schedule event in the school IS):"
          />
        }
      />
    )}
    <br />
    <Grid fluid>
      <Row>
        {(isSuperAdmin || isPublic) && ( // any user can turn public flag off, but only superuser may turn it on :)
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
          </Col>
        )}
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
          {hasThreshold && (
            <NumericTextField
              name="threshold"
              tabIndex={6}
              validateMin={0}
              validateMax={100}
              maxLength={3}
              label={
                <FormattedMessage
                  id="app.createGroup.threshold"
                  defaultMessage="Minimum percent of the total points count needed to complete the course:"
                />
              }
            />
          )}
        </Col>
      </Row>
    </Grid>

    {error && dirty && <Alert bsStyle="danger">{error}</Alert>}
  </FormBox>
);

EditGroupForm.propTypes = {
  error: PropTypes.any,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  hasThreshold: PropTypes.bool,
  isPublic: PropTypes.bool,
  createNew: PropTypes.bool,
  collapsable: PropTypes.bool,
  isOpen: PropTypes.bool,
  reset: PropTypes.func,
  isSuperAdmin: PropTypes.bool,
};

const validate = ({ localizedTexts }) => {
  const errors = {};
  validateLocalizedTextsFormData(errors, localizedTexts, ({ name }) => {
    const textErrors = {};
    if (!name.trim()) {
      textErrors.name = (
        <FormattedMessage
          id="app.editGroupForm.validation.emptyName"
          defaultMessage="Please fill the name of the group."
        />
      );
    }
    return textErrors;
  });

  return errors;
};

export default reduxForm({
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
  validate,
})(EditGroupForm);
