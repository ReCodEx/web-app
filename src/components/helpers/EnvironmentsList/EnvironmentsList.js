import React from 'react';
import PropTypes from 'prop-types';

import LoadingIcon from '../../icons/LoadingIcon';
import EnvironmentsListItem from './EnvironmentsListItem';

const EnvironmentsList = ({ runtimeEnvironments, longNames = false }) => {
  const environments =
    runtimeEnvironments && runtimeEnvironments.filter(e => e);
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
  longNames: PropTypes.bool
};

export default EnvironmentsList;
