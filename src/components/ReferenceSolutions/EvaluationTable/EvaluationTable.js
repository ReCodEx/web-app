import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  FormattedDate,
  FormattedTime,
  FormattedNumber
} from 'react-intl';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router';
import classnames from 'classnames';

import withLinks from '../../../hoc/withLinks';
import AssignmentStatusIcon from '../../Assignments/Assignment/AssignmentStatusIcon';

const EvaluationTable = ({
  evaluations,
  referenceSolutionId,
  exerciseId,
  links: { REFERENCE_SOLUTION_EVALUATION_URI_FACTORY }
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
        <th>
          <FormattedMessage
            id="app.evaluationTable.score"
            defaultMessage="Score:"
          />
        </th>
        <th />
      </tr>
    </thead>
    <tbody>
      {evaluations
        .sort((a, b) => {
          if (a.evaluation == null || b.evaluation == null) {
            return a.evaluationStatus.localeCompare(b.evaluationStatus);
          }
          return b.evaluation.evaluatedAt - a.evaluation.evaluatedAt;
        })
        .map(e => (
          <tr key={e.id}>
            <td>
              <AssignmentStatusIcon
                id={e.id}
                status={e.evaluationStatus}
                accepted={false}
              />
            </td>
            {e.evaluation && (
              <td>
                <FormattedDate value={e.evaluation.evaluatedAt * 1000} />
                &nbsp;
                <FormattedTime value={e.evaluation.evaluatedAt * 1000} />
              </td>
            )}
            {e.evaluation && (
              <td
                className={classnames({
                  'text-danger': !e.evaluation.isCorrect,
                  'text-success': e.evaluation.isCorrect
                })}
              >
                <b>
                  <FormattedNumber style="percent" value={e.evaluation.score} />
                </b>
              </td>
            )}
            {!e.evaluation && (
              <td colSpan="2">
                <i>
                  <FormattedMessage
                    id="app.evaluationTable.notAvailable"
                    defaultMessage="Evaluation not available"
                  />
                </i>
              </td>
            )}
            <td className="text-right">
              <Link
                to={REFERENCE_SOLUTION_EVALUATION_URI_FACTORY(
                  exerciseId,
                  referenceSolutionId,
                  e.id
                )}
                className="btn btn-flat btn-default btn-xs"
              >
                <FormattedMessage
                  id="app.evaluationTable.showDetails"
                  defaultMessage="Show details"
                />
              </Link>
            </td>
          </tr>
        ))}

      {evaluations.length === 0 && (
        <tr>
          <td className="text-center" colSpan={3}>
            <FormattedMessage
              id="app.evaluationTable.empty"
              defaultMessage="There are no evaluations in this list."
            />
          </td>
        </tr>
      )}
    </tbody>
  </Table>
);

EvaluationTable.propTypes = {
  evaluations: PropTypes.array.isRequired,
  referenceSolutionId: PropTypes.string.isRequired,
  exerciseId: PropTypes.string.isRequired,
  links: PropTypes.object
};

export default withLinks(EvaluationTable);
