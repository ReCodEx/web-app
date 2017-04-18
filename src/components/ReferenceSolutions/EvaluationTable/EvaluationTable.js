import React, { PropTypes } from 'react';
import Icon from 'react-fontawesome';
import classnames from 'classnames';
import {
  FormattedMessage,
  FormattedNumber,
  FormattedDate,
  FormattedTime
} from 'react-intl';
import { Table } from 'react-bootstrap';

import BonusPoints from '../../Assignments/SubmissionsTable/BonusPoints';
import AssignmentStatusIcon
  from '../../Assignments/Assignment/AssignmentStatusIcon';

const EvaluationTable = ({
  evaluations,
  referenceSolutionId,
  renderButtons = () => null
}) => (
  <Table>
    <thead>
      <tr>
        <th />
        <th>
          <FormattedMessage
            id="app.evaluationTable.evaluatedAt"
            defaultMessage="Evaluated at:"
          />
        </th>
        <th />
      </tr>
    </thead>
    <tbody>
      {evaluations
        .filter(
          evaluation => evaluation.referenceSolution.id === referenceSolutionId
        )
        .sort((a, b) => b.evaluation.evaluatedAt - a.evaluation.evaluatedAt)
        .map(evaluation => (
          <tr key={evaluation.id}>
            <td>
              <AssignmentStatusIcon
                id={evaluation.evaluation.id}
                status={evaluation.evaluationStatus}
              />
            </td>
            <td>
              <FormattedDate value={evaluation.evaluation.evaluatedAt * 1000} />
              &nbsp;
              <FormattedTime value={evaluation.evaluation.evaluatedAt * 1000} />
            </td>
            <td className="text-right">
              {renderButtons(evaluation.id)}
            </td>
          </tr>
        ))}
    </tbody>
  </Table>
);

EvaluationTable.propTypes = {
  evaluations: PropTypes.array.isRequired,
  referenceSolutionId: PropTypes.string.isRequired,
  renderButtons: PropTypes.func
};

export default EvaluationTable;
