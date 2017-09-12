import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Tabs, Tab } from 'react-bootstrap';

import Box from '../../widgets/Box';
import EditLimits from '../../forms/EditLimits';

const EditLimitsBox = ({ hardwareGroups, editLimits, limits, ...props }) =>
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
            editLimits={editLimits(id)}
            limits={limits(id)}
            {...props}
          />
        </Tab>
      )}
    </Tabs>
  </Box>;

EditLimitsBox.propTypes = {
  hardwareGroups: PropTypes.array.isRequired,
  editLimits: PropTypes.func.isRequired,
  limits: PropTypes.func.isRequired
};

export default EditLimitsBox;
