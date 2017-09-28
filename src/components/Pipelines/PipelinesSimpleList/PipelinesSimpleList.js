import React from 'react';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import ExercisePipelinesListItem from '../PipelinesSimpleListItem';

const PipelinesSimpleList = ({ pipelines, createActions, ...rest }) =>
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
        .sort((a, b) => {
          var tmp = a.name.localeCompare(b.name);
          if (tmp === 0) {
            return b.createdAt - a.createdAt;
          } else {
            return tmp;
          }
        })
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
  createActions: PropTypes.func
};

export default PipelinesSimpleList;
