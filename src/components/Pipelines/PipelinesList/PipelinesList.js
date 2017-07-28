import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import PipelinesListItem from '../PipelinesListItem';

const PipelinesList = ({ pipelines = [], createActions }) =>
  <Table hover>
    <thead>
      <tr>
        <th />
        <th>
          <FormattedMessage id="app.pipelinesList.name" defaultMessage="Name" />
        </th>
        <th>
          <FormattedMessage
            id="app.pipelinesList.author"
            defaultMessage="Author"
          />
        </th>
      </tr>
    </thead>
    <tbody>
      {pipelines
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(pipeline =>
          <PipelinesListItem
            {...pipeline}
            createActions={createActions}
            key={pipeline.id}
          />
        )}

      {pipelines.length === 0 &&
        <tr>
          <td className="text-center" colSpan={4}>
            <FormattedMessage
              id="app.pipelinesList.empty"
              defaultMessage="There are no pipelines in this list."
            />
          </td>
        </tr>}
    </tbody>
  </Table>;

PipelinesList.propTypes = {
  pipelines: PropTypes.array,
  createActions: PropTypes.func
};

export default PipelinesList;
