import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { LoadingIcon } from '../../icons';
import EnvironmentsListItem from './EnvironmentsListItem';

const EnvironmentsList = ({
  runtimeEnvironments,
  longNames = false,
  intl: { locale }
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
      {environments && environments.length > 0
        ? environments.map(env =>
            <EnvironmentsListItem
              key={env.id}
              runtimeEnvironment={env}
              longNames={longNames}
            />
          )
        : <LoadingIcon />}
    </span>
  );
};

EnvironmentsList.propTypes = {
  runtimeEnvironments: PropTypes.array,
  longNames: PropTypes.bool,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(EnvironmentsList);
