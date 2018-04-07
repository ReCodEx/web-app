import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip, Label } from 'react-bootstrap';
import LoadingIcon from '../../icons/LoadingIcon';
import styles from './EnvironmentsList.less';

const EnvironmentsList = ({ runtimeEnvironments }) => {
  const environments =
    runtimeEnvironments && runtimeEnvironments.filter(e => e);
  return (
    <span>
      {environments && environments.length > 0
        ? environments.map(env =>
            <OverlayTrigger
              key={env.id}
              placement="bottom"
              overlay={
                <Tooltip id={Date.now()}>
                  {env.description}
                </Tooltip>
              }
            >
              <Label className={styles.environment}>
                {env.name}
              </Label>
            </OverlayTrigger>
          )
        : <LoadingIcon />}
    </span>
  );
};

EnvironmentsList.propTypes = {
  runtimeEnvironments: PropTypes.array
};

export default EnvironmentsList;
