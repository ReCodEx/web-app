import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';
import ReferenceSolutionsTableRow from './ReferenceSolutionsTableRow';

import styles from './ReferenceSolutionsTable.less';

const ReferenceSolutionsTable = ({
  referenceSolutions = [],
  runtimeEnvironments,
  renderButtons = () => null,
  ...props
}) =>
  <Table {...props} className={styles.refSolutions}>
    <thead>
      <tr>
        <th />
        <th>
          <FormattedMessage
            id="generic.uploadedAt"
            defaultMessage="Uploaded at"
          />
        </th>
        <th>
          <FormattedMessage
            id="generic.runtimeShortest"
            defaultMessage="Runtime"
          />
        </th>
        <th>
          <FormattedMessage id="generic.author" defaultMessage="Author" />
        </th>
        <th />
      </tr>
    </thead>
    {referenceSolutions
      .sort((a, b) => a.solution.createdAt - b.solution.createdAt)
      .map(solution =>
        <ReferenceSolutionsTableRow
          key={solution.id}
          {...solution}
          runtimeEnvironments={runtimeEnvironments}
          renderButtons={renderButtons}
        />
      )}
  </Table>;

ReferenceSolutionsTable.propTypes = {
  referenceSolutions: PropTypes.array.isRequired,
  runtimeEnvironments: PropTypes.array.isRequired,
  renderButtons: PropTypes.func
};

export default ReferenceSolutionsTable;
