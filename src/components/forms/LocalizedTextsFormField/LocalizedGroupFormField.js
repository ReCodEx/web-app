import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';

import SharedLocalizedFields from './SharedLocalizedFields.js';
import { MarkdownTextAreaField } from '../Fields';
import InsetPanel from '../../widgets/InsetPanel';

const LocalizedGroupFormField = ({ prefix, data: enabled, ignoreDirty = false }) => (
  <InsetPanel>
    <SharedLocalizedFields prefix={prefix} enabled={enabled} ignoreDirty={ignoreDirty} />

    <Field
      name={`${prefix}.description`}
      component={MarkdownTextAreaField}
      disabled={!enabled}
      ignoreDirty={ignoreDirty}
      label={<FormattedMessage id="app.editGroupForm.description" defaultMessage="Group description:" />}
    />
  </InsetPanel>
);

LocalizedGroupFormField.propTypes = {
  prefix: PropTypes.string.isRequired,
  data: PropTypes.bool.isRequired,
  ignoreDirty: PropTypes.bool,
};

export default LocalizedGroupFormField;
