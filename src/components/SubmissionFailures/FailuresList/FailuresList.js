import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import FailuresListItem from '../FailuresListItem';

const FailuresList = ({ failures, createActions }) =>
  <Table hover>
    <thead>
      <tr>
        <th>
          <FormattedMessage
            id="app.failureList.headType"
            defaultMessage="Type"
          />
        </th>
        <th>
          <FormattedMessage
            id="app.failureList.headDescription"
            defaultMessage="Description"
          />
        </th>
        <th>
          <FormattedMessage
            id="app.failureList.headCreatedAt"
            defaultMessage="Created at"
          />
        </th>
        <th>
          <FormattedMessage
            id="app.failureList.headResolvedAt"
            defaultMessage="Resolved at"
          />
        </th>
        <th>
          <FormattedMessage
            id="app.failureList.headResolutionNote"
            defaultMessage="Resolution note"
          />
        </th>
        <th />
      </tr>
    </thead>
    <tbody>
      {failures.map((failure, i) =>
        <FailuresListItem
          id={failure.id}
          createActions={createActions}
          failure={failure}
          key={i}
        />
      )}

      {failures.length === 0 &&
        <tr>
          <td className="text-center">
            <FormattedMessage
              id="app.failureList.noFailures"
              defaultMessage="There are no failures in this list."
            />
          </td>
        </tr>}
    </tbody>
  </Table>;

FailuresList.propTypes = {
  failures: PropTypes.array,
  createActions: PropTypes.func,
  failure: PropTypes.object
};

export default FailuresList;
