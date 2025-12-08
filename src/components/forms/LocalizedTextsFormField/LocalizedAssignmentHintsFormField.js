import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';

import { MarkdownTextAreaField } from '../Fields';
import InsetPanel from '../../widgets/InsetPanel';
import Explanation from '../../widgets/Explanation';

const LocalizedAssignmentHintsFormField = ({ prefix, data: enabled, previewPreprocessor }) => (
  <InsetPanel>
    <Field
      name={`${prefix}.studentHint`}
      component={MarkdownTextAreaField}
      previewPreprocessor={previewPreprocessor}
      disabled={!enabled}
      label={
        <>
          <FormattedMessage
            id="app.editAssignmentForm.localized.studentHint"
            defaultMessage="Additional hints for students:"
          />
          <Explanation id="assignment-hint-explanation">
            <FormattedMessage
              id="app.editAssignmentForm.localized.studentHintExplanation"
              defaultMessage="These hints are assignment-specific and they do not synchronize with the exercise texts. However, only localizations that are enabled in the exercise specification are available for hints."
            />
          </Explanation>
        </>
      }
    />
  </InsetPanel>
);

LocalizedAssignmentHintsFormField.propTypes = {
  prefix: PropTypes.string.isRequired,
  data: PropTypes.bool.isRequired,
  ignoreDirty: PropTypes.bool,
  previewPreprocessor: PropTypes.func,
};

export default LocalizedAssignmentHintsFormField;
