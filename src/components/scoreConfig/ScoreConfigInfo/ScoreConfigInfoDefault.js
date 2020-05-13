import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

const ScoreConfigInfoDefault = ({ scoreConfig }) => (
  <Table>
    <tbody>
      <tr>
        <th className="text-nowrap shrink-col">
          <FormattedMessage id="app.scoreConfigInfo.calculator" defaultMessage="Algorithm" />:
        </th>
        <td>
          <code>{scoreConfig.calculator}</code>
        </td>
      </tr>
      <tr>
        <th className="text-nowrap shrink-col">
          <FormattedMessage id="app.scoreConfigInfo.rawConfig" defaultMessage="Raw configuration" />:
        </th>
        <td>
          <pre>
            <code>{JSON.stringify(scoreConfig.config, null, 2)}</code>
          </pre>
        </td>
      </tr>
    </tbody>
  </Table>
);

ScoreConfigInfoDefault.propTypes = {
  scoreConfig: PropTypes.object,
};

export default ScoreConfigInfoDefault;
