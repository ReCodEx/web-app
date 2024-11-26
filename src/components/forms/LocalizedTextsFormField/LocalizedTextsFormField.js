import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import { TabbedArrayField } from '../Fields';
import LocalizedAssignmentFormField from './LocalizedAssignmentFormField.js';
import LocalizedShadowAssignmentFormField from './LocalizedShadowAssignmentFormField.js';
import LocalizedExerciseFormField from './LocalizedExerciseFormField.js';
import LocalizedGroupFormField from './LocalizedGroupFormField.js';
import LocalizedSystemMessageFormField from './LocalizedSystemMessageFormField.js';
import { WarningIcon } from '../../icons';
import { knownLocalesNames } from '../../../helpers/localizedData.js';

const fieldTypes = {
  assignment: LocalizedAssignmentFormField,
  shadowAssignment: LocalizedShadowAssignmentFormField,
  exercise: LocalizedExerciseFormField,
  group: LocalizedGroupFormField,
  systemMessage: LocalizedSystemMessageFormField,
};

const renderTitle = ({ locale, _enabled }) => (
  <span key={`${locale}-${_enabled}`}>
    <OverlayTrigger
      placement="bottom"
      overlay={<Tooltip id={`editLocalizedTextForm-${locale}`}>{knownLocalesNames[locale] || '??'}</Tooltip>}>
      <span>{locale}</span>
    </OverlayTrigger>

    {!_enabled && (
      <WarningIcon
        gapLeft={2}
        className="text-secondary"
        tooltipId={`editLocalizedTextForm-${locale}-disabled`}
        tooltipPlacement="bottom"
        tooltip={
          <FormattedMessage
            id="app.editLocalizedTextForm.localizationTabDisabled"
            defaultMessage="This locale is currently disabled."
          />
        }
      />
    )}
  </span>
);

const tabComparator = ({ locale: a }, { locale: b }) => a.localeCompare(b);

const tabDataSelector = ({ _enabled }) => _enabled;

const LocalizedTextsFormField = ({ fieldType, ...props }) => {
  return (
    <TabbedArrayField
      {...props}
      id="localized-texts"
      ContentComponent={fieldTypes[fieldType]}
      renderTitle={renderTitle}
      tabComparator={tabComparator}
      tabDataSelector={tabDataSelector}
      emptyMessage={
        <FormattedMessage
          id="app.editLocalizedTextForm.localized.noLanguage"
          defaultMessage="There is currently no text in any language."
        />
      }
      removeQuestion={
        <FormattedMessage
          id="app.editLocalizedTextForm.localized.reallyRemoveQuestion"
          defaultMessage="Do you really want to delete this localization?"
        />
      }
    />
  );
};

renderTitle.propTypes = {
  locale: PropTypes.string.isRequired,
  _enabled: PropTypes.bool.isRequired,
};

LocalizedTextsFormField.propTypes = {
  localizedTextsLocales: PropTypes.array,
  fieldType: PropTypes.string.isRequired,
};

export default LocalizedTextsFormField;
