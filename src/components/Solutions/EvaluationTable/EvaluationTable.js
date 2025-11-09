import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Table } from 'react-bootstrap';
import classnames from 'classnames';

import AssignmentStatusIcon from '../../Assignments/Assignment/AssignmentStatusIcon';
import DateTime from '../../widgets/DateTime';
import { BugIcon } from '../../icons';
import './EvaluationTable.css';

const EvaluationTable = ({ evaluations, renderButtons, selectedRowId = '' }) => (
  <Table className="mb-0">
    <thead>
      <tr>
        <th />
        <th>
          <FormattedMessage id="app.evaluationTable.evaluatedAt" defaultMessage="Evaluated at:" />
        </th>
        <th>
          <FormattedMessage id="app.evaluationTable.score" defaultMessage="Score:" />
        </th>
        <th />
      </tr>
    </thead>
    <tbody>
      {evaluations
        .sort((a, b) => {
          if (!a.submittedAt || !b.submittedAt) {
            return a.id.localeCompare(b.id); // just to make it deterministic
          }
          return (
            ((b.evaluation && b.evaluation.evaluatedAt) || b.submittedAt) -
            ((a.evaluation && a.evaluation.evaluatedAt) || a.submittedAt)
          );
        })
        .map((e, idx) => (
          <tr key={e.id} className={selectedRowId === e.id ? 'activeRow' : ''}>
            <td className="text-nowrap">
              <span className="d-none d-xl-inline">
                <AssignmentStatusIcon id={e.id} submission={e} accepted={false} />
              </span>
              {e.isDebug && (
                <BugIcon
                  gapLeft={2}
                  className="text-danger"
                  tooltipId={`debug-mode-${e.id}`}
                  tooltiPlacement="bottom"
                  tooltip={
                    <FormattedMessage
                      id="app.evaluationTable.evaluationIsDebug"
                      defaultMessage="Evaluated in debug mode (complete logs and dumps)"
                    />
                  }
                />
              )}
            </td>
            {e.evaluation && (
              <td>
                <DateTime unixTs={e.evaluation.evaluatedAt} showRelative showSeconds />
              </td>
            )}
            {e.evaluation && (
              <td
                className={classnames({
                  'text-danger': e.evaluation.score < 1.0,
                  'text-success': e.evaluation.score >= 1.0,
                })}>
                <b>
                  <FormattedNumber style="percent" value={e.evaluation.score} />
                </b>
              </td>
            )}

            {!e.evaluation && e.failure && (
              <td colSpan="2">
                <i>{e.failure.description}</i>
              </td>
            )}

            {!e.evaluation && !e.failure && (
              <td colSpan="2">
                <i>
                  <FormattedMessage id="app.evaluationTable.notAvailable" defaultMessage="Evaluation not available" />
                </i>
              </td>
            )}
            {renderButtons && renderButtons(e.id, idx)}
          </tr>
        ))}

      {evaluations.length === 0 && (
        <tr>
          <td className="text-center" colSpan={3}>
            <FormattedMessage id="app.evaluationTable.empty" defaultMessage="There are no evaluations in this list." />
          </td>
        </tr>
      )}
    </tbody>
  </Table>
);

EvaluationTable.propTypes = {
  evaluations: PropTypes.array.isRequired,
  renderButtons: PropTypes.func,
  selectedRowId: PropTypes.string,
};

export default EvaluationTable;
