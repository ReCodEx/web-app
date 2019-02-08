import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { LoadingIcon, WarningIcon } from '../../icons';
import EnvironmentsListItem from './EnvironmentsListItem';

const EnvironmentsList = ({
  runtimeEnvironments = null,
  longNames = false,
  intl: { locale },
}) => {
  const environments =
    runtimeEnvironments &&
    runtimeEnvironments
      .filter(e => e)
      .sort(
        longNames
          ? (a, b) => a.longName.localeCompare(b.longName, locale)
          : (a, b) => a.name.localeCompare(b.name, locale)
      );
  return (
    <span>
      {environments !== null ? (
        environments.length > 0 ? (
          environments.map(env => (
            <EnvironmentsListItem
              key={env.id}
              runtimeEnvironment={env}
              longNames={longNames}
            />
          ))
        ) : (
          <i className="small text-muted">
            <WarningIcon gapRight />
            <FormattedMessage
              id="app.environmentsList.noEnvironments"
              defaultMessage="no runtime environments"
            />
          </i>
        )
      ) : (
        <LoadingIcon />
      )}
    </span>
  );
};

EnvironmentsList.propTypes = {
  runtimeEnvironments: PropTypes.array,
  longNames: PropTypes.bool,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
};

export default injectIntl(EnvironmentsList);
