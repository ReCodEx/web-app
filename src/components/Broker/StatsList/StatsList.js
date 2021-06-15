import React from 'react';
import PropTypes from 'prop-types';
import Box from '../../widgets/Box';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';

const StatsList = ({ stats }) => (
  <Box title={<FormattedMessage id="app.broker.stats" defaultMessage="Current Statistics" />} noPadding>
    <Table responsive size="sm" hover>
      <tbody>
        {Object.keys(stats).map(name => (
          <tr key={name}>
            <td className="em-padding-left">
              <b>{name}</b>
            </td>
            <td className="em-padding-left">
              <code>{String(stats[name])}</code>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  </Box>
);

StatsList.propTypes = {
  stats: PropTypes.object.isRequired,
};

export default StatsList;
