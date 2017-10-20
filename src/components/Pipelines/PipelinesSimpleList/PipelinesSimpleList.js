import React from 'react';
import { Table } from 'react-bootstrap';
import { injectIntl, FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import ExercisePipelinesListItem from '../PipelinesSimpleListItem';

const PipelinesSimpleList = ({ pipelines, createActions, intl, ...rest }) =>
  <Table>
    <thead>
      <tr>
        <th>
          <FormattedMessage
            id="app.pipelinesSimpleList.name"
            defaultMessage="Name"
          />
        </th>
        <th>
          <FormattedMessage
            id="app.pipelinesSimpleList.author"
            defaultMessage="Author"
          />
        </th>
        {createActions &&
          <th>
            <FormattedMessage
              id="app.pipelinesSimpleList.actions"
              defaultMessage="Actions"
            />
          </th>}
      </tr>
    </thead>
    <tbody>
      {pipelines
        .sort(
          (a, b) =>
            a.name.localeCompare(b.name, intl.locale) ||
            b.createdAt - a.createdAt
        )
        .map((pipeline, i) =>
          <ExercisePipelinesListItem
            {...pipeline}
            createActions={createActions}
            key={i}
          />
        )}

      {pipelines.length === 0 &&
        <tr>
          <td className="text-center" colSpan={3}>
            <FormattedMessage
              id="app.pipelinesSimpleList.empty"
              defaultMessage="There are no pipelines in this list."
            />
          </td>
        </tr>}
    </tbody>
  </Table>;

PipelinesSimpleList.propTypes = {
  pipelines: PropTypes.array.isRequired,
  createActions: PropTypes.func,
  intl: PropTypes.shape({ formatMessage: PropTypes.func.isRequired }).isRequired
};

export default injectIntl(PipelinesSimpleList);
