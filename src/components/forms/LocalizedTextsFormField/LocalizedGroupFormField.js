import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';

import SharedLocalizedFields from './SharedLocalizedFields';
import { MarkdownTextAreaField } from '../Fields';
import InsetPanel from '../../widgets/InsetPanel';

const LocalizedGroupFormField = ({ prefix, data: enabled }) => (
  <InsetPanel>
    <SharedLocalizedFields prefix={prefix} enabled={enabled} />

    <Field
      name={`${prefix}.description`}
      component={MarkdownTextAreaField}
      disabled={!enabled}
      label={<FormattedMessage id="app.editGroupForm.description" defaultMessage="Group description:" />}
    />
  </InsetPanel>
);

LocalizedGroupFormField.propTypes = {
  prefix: PropTypes.string.isRequired,
  data: PropTypes.bool.isRequired,
};

export default LocalizedGroupFormField;
