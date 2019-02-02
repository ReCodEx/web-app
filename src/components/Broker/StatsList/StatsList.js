import React from 'react';
import PropTypes from 'prop-types';
import Box from '../../widgets/Box';
import { FormattedMessage } from 'react-intl';

const StatsList = ({ stats }) =>
  <Box
    title={
      <FormattedMessage
        id="app.broker.stats"
        defaultMessage="Current Statistics"
      />
    }
  >
    <table>
      <tbody>
        {Object.keys(stats).map(name =>
          <tr key={name}>
            <td>
              <i>
                {name}
              </i>
            </td>
            <td className="em-padding-left">
              <code>
                {String(stats[name])}
              </code>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </Box>;

StatsList.propTypes = {
  stats: PropTypes.object.isRequired
};

export default StatsList;
