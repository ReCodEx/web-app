import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import { TabbedArrayField } from '../Fields';
import LocalizedAssignmentFormField from './LocalizedAssignmentFormField';
import LocalizedShadowAssignmentFormField from './LocalizedShadowAssignmentFormField';
import LocalizedExerciseFormField from './LocalizedExerciseFormField';
import LocalizedGroupFormField from './LocalizedGroupFormField';
import { WarningIcon } from '../../icons';
import { knownLocalesNames } from '../../../helpers/localizedData';

const fieldTypes = {
  assignment: LocalizedAssignmentFormField,
  shadowAssignment: LocalizedShadowAssignmentFormField,
  exercise: LocalizedExerciseFormField,
  group: LocalizedGroupFormField,
};

const renderTitle = ({ locale, _enabled }) => (
  <span>
    <OverlayTrigger
      placement="bottom"
      overlay={
        <Tooltip id={`editLocalizedTextForm-${locale}`}>
          {knownLocalesNames[locale] || '??'}
        </Tooltip>
      }>
      <span>{locale}</span>
    </OverlayTrigger>

    {!_enabled && (
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id={`editLocalizedTextForm-${locale}-disabled`}>
            <FormattedMessage
              id="app.editLocalizedTextForm.localizationTabDisabled"
              defaultMessage="This locale is currently disabled."
            />
          </Tooltip>
        }>
        <WarningIcon gapLeft />
      </OverlayTrigger>
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
