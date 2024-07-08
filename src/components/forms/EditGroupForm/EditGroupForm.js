import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field, FieldArray } from 'redux-form';
import { Container, Row, Col } from 'react-bootstrap';

import Callout from '../../widgets/Callout';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';
import LocalizedTextsFormField from '../LocalizedTextsFormField';
import { RefreshIcon } from '../../icons';

import { TextField, CheckboxField, NumericTextField } from '../Fields';
import { getLocalizedTextsInitialValues, validateLocalizedTextsFormData } from '../../../helpers/localizedData.js';

export const EDIT_GROUP_FORM_LOCALIZED_TEXTS_DEFAULT = {
  name: '',
  description: '',
};

export const EDIT_GROUP_FORM_EMPTY_INITIAL_VALUES = {
  isPublic: false,
  publicStats: false,
  hasThreshold: false,
  isOrganizational: false,
  isExam: false,
  detaining: false,
  makeMeAdmin: true,
  threshold: 0,
  localizedTexts: getLocalizedTextsInitialValues([], EDIT_GROUP_FORM_LOCALIZED_TEXTS_DEFAULT),
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
  isOrganizational = false,
  isExam = false,
}) => (
  <FormBox
    title={
      createNew ? (
        <FormattedMessage id="app.editGroupForm.titleNew" defaultMessage="Create Subgroup" />
      ) : (
        <FormattedMessage id="app.editGroupForm.titleEdit" defaultMessage="Edit Group" />
      )
    }
    type={submitSucceeded ? 'success' : undefined}
    footer={
      !createNew || dirty ? (
        <div className="text-center">
          <TheButtonGroup>
            {dirty && (
              <Button type="reset" onClick={reset} variant="danger">
                <RefreshIcon gapRight />
                <FormattedMessage id="generic.reset" defaultMessage="Reset" />
              </Button>
            )}
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
                  <FormattedMessage id="app.editGroupForm.createGroup" defaultMessage="Create Group" />
                ) : (
                  <FormattedMessage id="app.editGroupForm.saveGroup" defaultMessage="Save Group" />
                ),
                submitting: <FormattedMessage id="generic.saving" defaultMessage="Saving..." />,
                success: <FormattedMessage id="generic.saved" defaultMessage="Saved" />,
              }}
            />
          </TheButtonGroup>
        </div>
      ) : null
    }
    collapsable={collapsable}
    isOpen={isOpen}
    unlimitedheight>
    {submitFailed && (
      <Callout variant="danger">
        <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
      </Callout>
    )}

    <FieldArray name="localizedTexts" component={LocalizedTextsFormField} fieldType="group" />

    {isSuperAdmin && (
      <Field
        name="externalId"
        tabIndex={10}
        component={TextField}
        maxLength={255}
        required
        label={
          <FormattedMessage
            id="app.createGroup.externalId"
            defaultMessage="External ID of the group (helps create bindings to external data sources):"
          />
        }
      />
    )}
    <br />
    <Container fluid>
      <Row>
        {(isSuperAdmin || isPublic) && ( // any user can turn public flag off, but only superuser may turn it on :)
          <Col lg={6}>
            <Field
              name="isPublic"
              tabIndex={20}
              component={CheckboxField}
              onOff
              label={
                <FormattedMessage
                  id="app.createGroup.isPublic"
                  defaultMessage="Public (everyone can see and join this group)"
                />
              }
            />
          </Col>
        )}

        <Col lg={6}>
          <Field
            name="publicStats"
            tabIndex={30}
            component={CheckboxField}
            onOff
            label={
              <FormattedMessage
                id="app.createGroup.publicStats"
                defaultMessage="Students can see statistics of each other"
              />
            }
          />
        </Col>

        {createNew && (
          <>
            <Col lg={6}>
              <Field
                name="isOrganizational"
                tabIndex={40}
                component={CheckboxField}
                onOff
                label={
                  <FormattedMessage
                    id="app.createGroup.isOrganizational"
                    defaultMessage="Organizational (for structural purposes only)"
                  />
                }
                disabled={isExam}
              />
            </Col>
            <Col lg={6}>
              <Field
                name="isExam"
                tabIndex={45}
                component={CheckboxField}
                onOff
                label={<FormattedMessage id="app.createGroup.isExam" defaultMessage="Exam" />}
                disabled={isOrganizational}
              />
            </Col>
          </>
        )}

        {!isOrganizational && (
          <Col lg={6}>
            <Field
              name="detaining"
              tabIndex={50}
              component={CheckboxField}
              onOff
              label={
                <FormattedMessage
                  id="app.createGroup.detaining"
                  defaultMessage="Detaining students (only supervisor can remove them)"
                />
              }
            />
          </Col>
        )}

        {createNew && (
          <Col lg={6}>
            <Field
              name="makeMeAdmin"
              tabIndex={60}
              component={CheckboxField}
              onOff
              label={<FormattedMessage id="app.createGroup.makeMeAdmin" defaultMessage="Make me a group admin" />}
            />
          </Col>
        )}
      </Row>

      <Row>
        <Col lg={6}>
          <Field
            name="hasThreshold"
            tabIndex={70}
            component={CheckboxField}
            onOff
            label={
              <FormattedMessage
                id="app.createGroup.hasThreshold"
                defaultMessage="Students require cetrain number of points to complete the course"
              />
            }
          />
        </Col>
        <Col lg={6}>
          {hasThreshold && (
            <NumericTextField
              name="threshold"
              tabIndex={80}
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
    </Container>

    {error && dirty && <Callout variant="danger">{error}</Callout>}
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
  isOrganizational: PropTypes.bool,
  isExam: PropTypes.bool,
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
