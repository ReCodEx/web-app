import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Tabs, Tab } from 'react-bootstrap';

import Box from '../../widgets/Box';
import EditExerciseLimitsForm from '../../forms/EditExerciseLimitsForm';

const getTestsList = config =>
  config === null || config.length === 0
    ? []
    : config[0].tests.map(({ name }) => name);

const EditLimitsBox = ({ hardwareGroups, runtimeEnvironments, config }) =>
  <Box
    title={
      <FormattedMessage
        id="app.editLimitsBox.title"
        defaultMessage="Edit limits"
      />
    }
  >
    <Tabs id="edit-limits" className="nav-tabs-custom">
      {hardwareGroups
        .filter(({ isAvailable }) => isAvailable)
        .map(({ id, description }) =>
          <Tab key={id} eventKey={id} title={id}>
            <p>
              {description}
            </p>
            <EditExerciseLimitsForm
              environments={runtimeEnvironments}
              runtimeEnvironments={runtimeEnvironments}
              tests={getTestsList(config)}
            />
          </Tab>
        )}
    </Tabs>
  </Box>;

EditLimitsBox.propTypes = {
  hardwareGroups: PropTypes.array.isRequired,
  runtimeEnvironments: PropTypes.array.isRequired,
  config: PropTypes.array.isRequired
};

export default EditLimitsBox;
