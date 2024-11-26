import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';

import Icon from '../../icons';
import { getLocalizedName, getOtherLocalizedNames } from '../../../helpers/localizedData.js';

const LocalizedExerciseName = ({ entity, noNameMessage = '??', intl: { locale } }) => {
  const otherNames = getOtherLocalizedNames(entity, locale);
  const name = getLocalizedName(entity, locale);
  return name ? (
    <span>
      {name}
      {otherNames.length > 0 && (
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
    </span>
  ) : (
    <span>{noNameMessage}</span>
  );
};

LocalizedExerciseName.propTypes = {
  entity: PropTypes.object,
  noNameMessage: PropTypes.any,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
};

export default injectIntl(LocalizedExerciseName);
