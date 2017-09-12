import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Tabs, Tab } from 'react-bootstrap';

import Box from '../../widgets/Box';
import EditLimits from '../../forms/EditLimits';

const getTestsList = config =>
  config === null || config.length === 0
    ? []
    : config[0].tests.map(({ name }) => name);

const EditLimitsBox = ({ hardwareGroups, environments, config }) =>
  <Box
    title={
      <FormattedMessage
        id="app.editLimitsBox.title"
        defaultMessage="Edit limits"
      />
    }
    unlimitedHeight
  >
    <Tabs id="edit-limits" className="nav-tabs-custom">
      {hardwareGroups.filter(({ isAvailable }) => isAvailable).map(({ id }) =>
        <Tab key={id} eventKey={id} title={id}>
          <EditLimits
            environments={environments}
            tests={getTestsList(config)}
          />
        </Tab>
      )}
    </Tabs>
  </Box>;

EditLimitsBox.propTypes = {
  hardwareGroups: PropTypes.array.isRequired,
  environments: PropTypes.array.isRequired,
  config: PropTypes.array.isRequired
};

export default EditLimitsBox;
