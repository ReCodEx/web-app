import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field, FieldArray } from 'redux-form';
import { Container, Row, Col } from 'react-bootstrap';

import Callout from '../../widgets/Callout';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import FormBox from '../../widgets/FormBox';
import Explanation from '../../widgets/Explanation';
import SubmitButton from '../SubmitButton';
import LocalizedTextsFormField from '../LocalizedTextsFormField';
import { RefreshIcon } from '../../icons';

import { CheckboxField, NumericTextField } from '../Fields';
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
  threshold: 100,
  pointsLimit: null,
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
  collapsable = false,
  isOpen = true,
  reset,
  isSuperAdmin,
  isOrganizational = false,
  isExam = false,
  threshold = '',
  pointsLimit = '',
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
                <RefreshIcon gapRight={2} />
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

    <FieldArray name="localizedTexts" component={LocalizedTextsFormField} fieldType="group" ignoreDirty={createNew} />

    <Container fluid>
      {isSuperAdmin && (
        <Row className="align-items-end">
          <Col lg={12}>
            <Field
              name="isPublic"
              tabIndex={20}
              component={CheckboxField}
              onOff
              ignoreDirty={createNew}
              label={
                <>
                  <FormattedMessage id="app.createGroup.isPublic" defaultMessage="Public" />
                  <Explanation id="isPublic">
                    <FormattedMessage
                      id="app.createGroup.isPublic.explanation"
                      defaultMessage="Everyone can see and join this group (only superadmin can make group public)."
                    />
                  </Explanation>
                </>
              }
            />
          </Col>
        </Row>
      )}

      <Row>
        {createNew && (
          <>
            <Col lg={6}>
              <Field
                name="isOrganizational"
                tabIndex={30}
                component={CheckboxField}
                onOff
                ignoreDirty
                label={
                  <>
                    <FormattedMessage id="app.createGroup.isOrganizational" defaultMessage="Organizational" />
                    <Explanation id="isOrganizational">
                      <FormattedMessage
                        id="app.createGroup.isOrganizational.explanation"
                        defaultMessage="A group for organizing sub-groups and exercises. It may not contain any students nor assignments."
                      />
                    </Explanation>
                  </>
                }
                disabled={isExam}
              />
            </Col>
            <Col lg={6}>
              <Field
                name="isExam"
                tabIndex={40}
                component={CheckboxField}
                onOff
                ignoreDirty
                label={
                  <>
                    <FormattedMessage id="app.createGroup.isExam" defaultMessage="Exam" />
                    <Explanation id="isExam">
                      <FormattedMessage
                        id="app.createGroup.isExam.explanation"
                        defaultMessage="A marker that designates this group for student examination (a test). This may affect how the group appears in listings or when it is archived."
                      />
                    </Explanation>
                  </>
                }
                disabled={isOrganizational}
              />
            </Col>
          </>
        )}

        {!isOrganizational && (
          <Col lg={6}>
            <Field
              name="publicStats"
              tabIndex={50}
              component={CheckboxField}
              onOff
              ignoreDirty={createNew}
              label={
                <>
                  <FormattedMessage id="app.createGroup.publicStats" defaultMessage="Sharing results" />
                  <Explanation id="publicStats">
                    <FormattedMessage
                      id="app.createGroup.publicStats.explanation"
                      defaultMessage="Students can see how many points other students got in their assignments."
                    />
                  </Explanation>
                </>
              }
            />
          </Col>
        )}

        {!isOrganizational && (
          <Col lg={6}>
            <Field
              name="detaining"
              tabIndex={60}
              component={CheckboxField}
              onOff
              ignoreDirty={createNew}
              label={
                <>
                  <FormattedMessage id="app.createGroup.detaining" defaultMessage="Detaining" />
                  <Explanation id="detaining">
                    <FormattedMessage
                      id="app.createGroup.detaining.explanation"
                      defaultMessage="Students cannot leave the group on their own. Only a group supervisor/admin can remove them."
                    />
                  </Explanation>
                </>
              }
            />
          </Col>
        )}
      </Row>

      {!isOrganizational && (
        <Row>
          <Col xs={12}>
            <Field
              name="hasThreshold"
              tabIndex={70}
              component={CheckboxField}
              onOff
              ignoreDirty={createNew}
              label={
                <>
                  <FormattedMessage
                    id="app.createGroup.hasThreshold"
                    defaultMessage="Students require certain number of points to complete the course"
                  />
                  <Explanation id="hasThreshold">
                    <FormattedMessage
                      id="app.createGroup.hasThreshold.explanation"
                      defaultMessage="The required amount of points can be specified relatively (percentage of total sum of points) or as an absolute point limit. Only one of these values should be specified."
                    />
                  </Explanation>
                </>
              }
            />
          </Col>
        </Row>
      )}

      {hasThreshold && !isOrganizational && (
        <Row>
          <Col lg={6}>
            <NumericTextField
              name="threshold"
              tabIndex={80}
              validateMin={1}
              validateMax={100}
              nullable
              maxLength={3}
              ignoreDirty={createNew}
              label={
                <FormattedMessage
                  id="app.createGroup.threshold"
                  defaultMessage="Relative amount of total points [%]:"
                />
              }
              disabled={threshold === null && pointsLimit !== null}
            />
          </Col>
          <Col lg={6}>
            <NumericTextField
              name="pointsLimit"
              tabIndex={85}
              validateMin={1}
              validateMax={999999}
              nullable
              maxLength={6}
              ignoreDirty={createNew}
              label={<FormattedMessage id="app.createGroup.pointsLimit" defaultMessage="Absolute amount of points:" />}
              disabled={threshold !== null}
            />
          </Col>
        </Row>
      )}

      {createNew && (
        <Row>
          <Col xs={12}>
            <Field
              name="makeMeAdmin"
              tabIndex={90}
              component={CheckboxField}
              onOff
              ignoreDirty
              label={<FormattedMessage id="app.createGroup.makeMeAdmin" defaultMessage="Make me a group admin" />}
            />
          </Col>
        </Row>
      )}
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
  createNew: PropTypes.bool,
  collapsable: PropTypes.bool,
  isOpen: PropTypes.bool,
  reset: PropTypes.func,
  isSuperAdmin: PropTypes.bool,
  isOrganizational: PropTypes.bool,
  isExam: PropTypes.bool,
  threshold: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  pointsLimit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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
