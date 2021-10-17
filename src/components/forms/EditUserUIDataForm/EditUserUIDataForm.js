import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { defaultMemoize } from 'reselect';

import Callout from '../../widgets/Callout';
import FormBox from '../../widgets/FormBox';
import { SaveIcon } from '../../icons';
import SubmitButton from '../SubmitButton';
import { CheckboxField, SelectField, NumericTextField } from '../Fields';

const defaultPagesCaptions = defineMessages({
  dashboard: {
    id: 'app.editUserUIData.defaultPage.dashboard',
    defaultMessage: 'Dashboard',
  },
  home: {
    id: 'app.editUserUIData.defaultPage.home',
    defaultMessage: 'Home page (about)',
  },
  instance: {
    id: 'app.editUserUIData.defaultPage.instance',
    defaultMessage: 'Instance overview',
  },
});

const getDefaultPages = defaultMemoize(formatMessage =>
  Object.keys(defaultPagesCaptions).map(key => ({
    key,
    name: formatMessage(defaultPagesCaptions[key]),
  }))
);

export const EDITOR_FONT_SIZE_MIN = 5;
export const EDITOR_FONT_SIZE_MAX = 50;
export const EDITOR_FONT_SIZE_DEFAULT = 16;

const EditUserUIDataForm = ({
  submitting,
  handleSubmit,
  submitFailed = false,
  submitSucceeded = false,
  dirty,
  invalid,
  intl: { formatMessage },
}) => (
  <FormBox
    title={<FormattedMessage id="app.editUserUIData.title" defaultMessage="Visual Settings" />}
    type={submitSucceeded ? 'success' : undefined}
    footer={
      <div className="text-center">
        <SubmitButton
          id="editUserUIData"
          handleSubmit={handleSubmit}
          submitting={submitting}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          invalid={invalid}
          dirty={dirty}
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
        <FormattedMessage id="app.editUserUIData.failed" defaultMessage="Cannot save visual settings of the user." />
      </Callout>
    )}

    <Field
      name="defaultPage"
      component={SelectField}
      options={getDefaultPages(formatMessage)}
      addEmptyOption={true}
      label={<FormattedMessage id="app.editUserUIData.defaultPage" defaultMessage="Default page (after login):" />}
    />

    <Field
      name="openedSidebar"
      component={CheckboxField}
      onOff
      label={<FormattedMessage id="app.editUserUIData.openedSidebar" defaultMessage="Sidebar is unfolded by default" />}
    />

    <Field
      name="useGravatar"
      component={CheckboxField}
      onOff
      label={
        <FormattedMessage
          id="app.editUserUIData.useGravatar"
          defaultMessage="Use Gravatar service for fetching user avatars"
        />
      }
    />

    <NumericTextField
      name="editorFontSize"
      maxLength={2}
      validateMin={EDITOR_FONT_SIZE_MIN}
      validateMax={EDITOR_FONT_SIZE_MAX}
      label={<FormattedMessage id="app.editUserUIData.editorFontSize" defaultMessage="Code editor font size:" />}
    />

    <Field
      name="vimMode"
      component={CheckboxField}
      onOff
      label={<FormattedMessage id="app.editUserUIData.vimMode" defaultMessage="Use Vim mode in source code editors" />}
    />

    <Field
      name="darkTheme"
      component={CheckboxField}
      onOff
      label={
        <FormattedMessage
          id="app.editUserUIData.darkTheme"
          defaultMessage="Use a dark theme for the source code viewers and editors"
        />
      }
    />
  </FormBox>
);

EditUserUIDataForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  dirty: PropTypes.bool,
  invalid: PropTypes.bool,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(
  reduxForm({
    form: 'edit-user-uiData',
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
  })(EditUserUIDataForm)
);
