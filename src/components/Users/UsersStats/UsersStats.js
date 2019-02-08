import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber, injectIntl } from 'react-intl';
import InfoBox from '../../widgets/InfoBox';
import { getLocalizedName } from '../../../helpers/localizedData';

const UsersStats = ({
  id,
  localizedTexts,
  stats: { points, hasLimit, passesLimit },
  intl: { locale },
}) => {
  const localizedName = getLocalizedName({ localizedTexts }, locale);
  return (
    <InfoBox
      color={!hasLimit ? 'blue' : passesLimit ? 'green' : 'red'}
      icon={!hasLimit ? 'info' : passesLimit ? 'check' : 'exclamation-triangle'}
      title={localizedName}
      value={
        <FormattedNumber
          value={points.total > 0 ? points.gained / points.total : 0}
          style="percent"
        />
      }
      progress={
        points.total > 0 ? Math.min(1, points.gained / points.total) : 0
      }
      description={
        <FormattedMessage
          id="app.usersStats.description"
          defaultMessage="Points gained from {name}."
          values={{ name: localizedName }}
        />
      }
    />
  );
};

UsersStats.propTypes = {
  id: PropTypes.string.isRequired,
  localizedTexts: PropTypes.array.isRequired,
  stats: PropTypes.shape({
    points: PropTypes.shape({
      total: PropTypes.number.isRequired,
      gained: PropTypes.number.isRequired,
    }),
  }).isRequired,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
};

export default injectIntl(UsersStats);
