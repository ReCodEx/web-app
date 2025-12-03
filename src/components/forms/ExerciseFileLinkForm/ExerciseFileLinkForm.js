import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Form, Row, Col } from 'react-bootstrap';
import { lruMemoize } from 'reselect';

import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Callout from '../../widgets/Callout';
import Explanation from '../../widgets/Explanation';
import SubmitButton from '../SubmitButton';
import { SelectField, TextField } from '../Fields';
import { AddIcon, CloseIcon, RefreshIcon, SaveIcon } from '../../icons';
import { roleLabels } from '../../helpers/usersRoles.js';

const REQUIRED_ROLE_OPTIONS = [
  {
    name: (
      <FormattedMessage
        id="app.exerciseFileLinkForm.requiredRole.noRole"
        defaultMessage="Everyone (no login required)"
      />
    ),
    key: '',
  },
  ...Object.keys(roleLabels).map(role => ({
    name: roleLabels[role],
    key: role,
  })),
];

const SUBMIT_BUTTON_CREATE_MESSAGES = {
  submit: <FormattedMessage id="generic.create" defaultMessage="Create" />,
  submitting: <FormattedMessage id="generic.creating" defaultMessage="Creating..." />,
  success: <FormattedMessage id="generic.created" defaultMessage="Created" />,
};

const SUBMIT_BUTTON_UPDATE_MESSAGES = {
  submit: <FormattedMessage id="generic.update" defaultMessage="Update" />,
  submitting: <FormattedMessage id="generic.updating" defaultMessage="Updating..." />,
  success: <FormattedMessage id="generic.updated" defaultMessage="Updated" />,
};

const getLinksKeys = lruMemoize(
  (links, editLinkId) => new Set(links.filter(link => link.id !== editLinkId).map(link => link.key))
);
const prepareFileOptions = lruMemoize(files =>
  files
    ? Object.values(files)
        .map(({ id, name }) => ({ key: id, name }))
        .sort((a, b) => a.name.localeCompare(b.name))
    : []
);

export const initialValues = {
  key: '',
  requiredRole: '',
  saveName: '',
  exerciseFileId: '',
};

const ExerciseFileLinkForm = ({
  createNew = false,
  files,
  error,
  warning,
  submitting,
  handleSubmit,
  submitFailed = false,
  submitSucceeded = false,
  invalid,
  dirty,
  reset,
  close,
}) => {
  return (
    <Form method="POST">
      <Row>
        <Col lg={12} xl={6}>
          <Field
            name="key"
            component={TextField}
            maxLength={16}
            ignoreDirty={createNew}
            label={
              <>
                <FormattedMessage id="app.exerciseFileLinkForm.key" defaultMessage="Key:" />
                <Explanation id="key-explanation">
                  <FormattedMessage
                    id="app.filesLinksTable.header.keyExplanation"
                    defaultMessage="A user-specified identifier used to reference the file link in the exercise texts (specification, description). Substring '%%key%%' is replaced by the link URL when the exercise text is rendered."
                  />
                </Explanation>
              </>
            }
          />
        </Col>

        <Col lg={12} xl={6}>
          <Field
            name="exerciseFileId"
            component={SelectField}
            options={prepareFileOptions(files)}
            addEmptyOption
            label={<FormattedMessage id="app.exerciseFileLinkForm.targetFile" defaultMessage="Target file:" />}
            ignoreDirty={createNew}
          />
        </Col>

        <Col lg={12} xl={6}>
          <Field
            name="requiredRole"
            component={SelectField}
            options={REQUIRED_ROLE_OPTIONS}
            label={
              <>
                <FormattedMessage
                  id="app.exerciseFileLinkForm.requiredRole"
                  defaultMessage="Accessible to (min. role):"
                />
                <Explanation id="requiredRole-explanation">
                  <FormattedMessage
                    id="app.exerciseFileLinkForm.requiredRoleExplanation"
                    defaultMessage="The file will be accessible only to users with the specified role or a stronger one."
                  />
                </Explanation>
              </>
            }
            ignoreDirty={createNew}
          />
        </Col>

        <Col lg={12} xl={6}>
          <Field
            name="saveName"
            component={TextField}
            maxLength={255}
            ignoreDirty={createNew}
            label={
              <>
                <FormattedMessage id="app.exerciseFileLinkForm.saveAs" defaultMessage="Save as:" />
                <Explanation id="saveAs-explanation">
                  <FormattedMessage
                    id="app.exerciseFileLinkForm.saveAsExplanation"
                    defaultMessage="The name under which the file will be saved when downloaded by the user. If empty, the original file name will be used."
                  />
                </Explanation>
              </>
            }
          />
        </Col>
      </Row>

      {error && <Callout variant="danger">{error}</Callout>}

      {submitFailed && (
        <Callout variant="danger">
          <FormattedMessage
            id="app.exerciseFileLinkForm.failed"
            defaultMessage="The exercise file link could not have been saved. Please try again later."
          />
        </Callout>
      )}

      <hr />

      <div className="text-center">
        <TheButtonGroup>
          {!createNew && dirty && (
            <Button type="reset" onClick={reset} variant="danger">
              <RefreshIcon gapRight={2} />
              <FormattedMessage id="generic.reset" defaultMessage="Reset" />
            </Button>
          )}

          <SubmitButton
            id="saveLink"
            handleSubmit={handleSubmit}
            submitting={submitting}
            hasSucceeded={submitSucceeded}
            hasFailed={submitFailed}
            invalid={invalid}
            disabled={createNew && Boolean(warning)}
            defaultIcon={createNew ? <AddIcon gapRight={2} /> : <SaveIcon gapRight={2} />}
            messages={createNew ? SUBMIT_BUTTON_CREATE_MESSAGES : SUBMIT_BUTTON_UPDATE_MESSAGES}
          />

          {close && (
            <Button variant="secondary" onClick={close}>
              <CloseIcon gapRight={2} />
              <FormattedMessage id="generic.close" defaultMessage="Close" />
            </Button>
          )}
        </TheButtonGroup>
      </div>
    </Form>
  );
};

ExerciseFileLinkForm.propTypes = {
  createNew: PropTypes.bool,
  links: PropTypes.array.isRequired,
  files: PropTypes.object.isRequired,
  error: PropTypes.any,
  warning: PropTypes.any,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  dirty: PropTypes.bool,
  reset: PropTypes.func.isRequired,
  close: PropTypes.func,
};

const validate = ({ key, exerciseFileId, saveName }, { createNew, links, initialValues }) => {
  const errors = {};
  if (!createNew && !key) {
    errors.key = (
      <FormattedMessage id="app.exerciseFileLinkForm.validation.key.required" defaultMessage="Please fill the key." />
    );
  }
  if (key && !/^[-A-Za-z0-9_]+$/.test(key)) {
    errors.key = (
      <FormattedMessage
        id="app.exerciseFileLinkForm.validation.key.invalid"
        defaultMessage="The key can contain only letters, digits, hyphens and underscores."
      />
    );
  }

  const existingKeys = getLinksKeys(links, createNew ? null : initialValues.id);
  if (key && existingKeys.has(key)) {
    errors.key = (
      <FormattedMessage
        id="app.exerciseFileLinkForm.validation.key.duplicate"
        defaultMessage="The specified key is already used by another file link."
      />
    );
  }

  if (!createNew && !exerciseFileId) {
    errors.exerciseFileId = (
      <FormattedMessage
        id="app.exerciseFileLinkForm.validation.exerciseFileId.required"
        defaultMessage="Please select the target file."
      />
    );
  }

  if (/[:\\/?*]/.test(saveName) || saveName === '.' || saveName === '..') {
    errors.saveName = (
      <FormattedMessage
        id="app.exerciseFileLinkForm.validation.saveName.invalid"
        defaultMessage="The file name cannot contain dangerous characters that are used in paths."
      />
    );
  }
  return errors;
};

const warn = ({ key, exerciseFileId, saveName }, { createNew }) => {
  const warnings = {};
  if (createNew) {
    if (!key) {
      warnings.key = (
        <FormattedMessage id="app.exerciseFileLinkForm.validation.key.required" defaultMessage="Please fill the key." />
      );
      warnings._warning = true;
    }
    if (!exerciseFileId) {
      warnings.exerciseFileId = (
        <FormattedMessage
          id="app.exerciseFileLinkForm.validation.exerciseFileId.required"
          defaultMessage="Please select the target file."
        />
      );
      warnings._warning = true;
    }
  }

  if (saveName && !/^[-a-zA-Z0-9._ !()]+$/.test(saveName)) {
    warnings.saveName = (
      <FormattedMessage
        id="app.exerciseFileLinkForm.validation.saveName.suspicious"
        defaultMessage="Used characters are not typical for common file names. Please verify that this is intended."
      />
    );
  }
  return warnings;
};

export default reduxForm({
  form: 'exercise-file-link',
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
  validate,
  warn,
})(ExerciseFileLinkForm);
