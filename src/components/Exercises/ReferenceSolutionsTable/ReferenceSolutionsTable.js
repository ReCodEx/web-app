import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import ReferenceSolutionsTableRow from './ReferenceSolutionsTableRow';
import withLinks from '../../../helpers/withLinks';

import styles from './ReferenceSolutionsTable.less';

const ReferenceSolutionsTable = ({
  referenceSolutions = [],
  runtimeEnvironments,
  links: { REFERENCE_SOLUTION_URI_FACTORY },
  ...props
}) => {
  const navigate = useNavigate();
  return (
    <Table {...props} className={styles.refSolutions}>
      <thead>
        <tr>
          <th />
          <th>
            <FormattedMessage id="generic.uploadedAt" defaultMessage="Uploaded at" />
          </th>
          <th className="text-nowrap text-center shrink-col">
            <FormattedMessage id="generic.runtimeShortest" defaultMessage="Runtime" />
          </th>
          <th className="text-nowrap text-center shrink-col">
            <FormattedMessage id="generic.correctness" defaultMessage="Correctness" />
          </th>
          <th>
            <FormattedMessage id="generic.author" defaultMessage="Author" />
          </th>
        </tr>
      </thead>
      {referenceSolutions
        .filter(solution => solution.visibility > 1)
        .sort((a, b) => a.createdAt - b.createdAt)
        .map(solution => (
          <ReferenceSolutionsTableRow
            key={solution.id}
            {...solution}
            runtimeEnvironments={runtimeEnvironments}
            onClick={
              solution.permissionHints.viewDetail
                ? () => navigate(REFERENCE_SOLUTION_URI_FACTORY(solution.exerciseId, solution.id))
                : null
            }
          />
        ))}
    </Table>
  );
};

ReferenceSolutionsTable.propTypes = {
  referenceSolutions: PropTypes.array.isRequired,
  runtimeEnvironments: PropTypes.array.isRequired,
  links: PropTypes.object,
};

export default withLinks(ReferenceSolutionsTable);
