import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import Icon from '../../icons';
import { getLocalizedName, getOtherLocalizedNames } from '../../../helpers/localizedData.js';

const LocalizedGroupName = ({ entity, translations = false }) => {
  const { locale } = useIntl();
  const otherNames = getOtherLocalizedNames(entity, locale);
  return (
    <>
      {getLocalizedName(entity, locale)}
      {translations && otherNames.length > 0 && (
        <span className="small">
          <Icon
            icon={['far', 'flag']}
            className="text-body-secondary"
            gapLeft={2}
            tooltipId={otherNames.map(n => n.name).join(', ')}
            tooltip={otherNames.map((name, i) => (
              <div key={i}>
                <strong>{name.name}</strong>&nbsp;[{name.locale}]
              </div>
            ))}
          />
        </span>
      )}
    </>
  );
};

LocalizedGroupName.propTypes = {
  entity: PropTypes.object,
  translations: PropTypes.bool,
};

export default LocalizedGroupName;
