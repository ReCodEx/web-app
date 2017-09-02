import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Tabs, Tab, Table } from 'react-bootstrap';

import Box from '../widgets/Box';

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
            <Table>
              <thead>
                <tr>
                  <th>
                    <FormattedMessage
                      id="app.editLimitsBox.runtimeEnvironmentsTableHeader"
                      defaultMessage="Programming language or runtime envioronment"
                    />
                  </th>
                  {getTestsList(config).map(test =>
                    <th key={test}>
                      {test}
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {runtimeEnvironments.map(environment =>
                  <tr key={environment}>
                    <th>
                      {environment.name}
                    </th>
                    {getTestsList(config).map(test =>
                      <td key={test}>
                        {test}
                      </td>
                    )}
                  </tr>
                )}
              </tbody>
            </Table>
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
