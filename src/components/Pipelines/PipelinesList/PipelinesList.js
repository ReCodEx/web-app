import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { injectIntl, FormattedMessage } from 'react-intl';

import PipelinesListItem from '../PipelinesListItem';

const PipelinesList = ({ pipelines = [], createActions, intl }) =>
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
        <th>
          <FormattedMessage
            id="app.pipelinesList.exercise"
            defaultMessage="Exercise"
          />
        </th>
        <th>
          <FormattedMessage
            id="app.pipelinesList.createdAt"
            defaultMessage="Created"
          />
        </th>
      </tr>
    </thead>
    <tbody>
      {pipelines
        .filter(a => a !== null)
        .sort((a, b) => a.name.localeCompare(b.name, intl.locale))
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
  createActions: PropTypes.func,
  intl: PropTypes.shape({ formatMessage: PropTypes.func.isRequired }).isRequired
};

export default injectIntl(PipelinesList);
