import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import classnames from 'classnames';
import {
  FormattedMessage,
  FormattedNumber,
  FormattedDate,
  FormattedTime
} from 'react-intl';
import { Table } from 'react-bootstrap';

import Box from '../../widgets/Box';
import { MaybeSucceededIcon } from '../../icons';
import BonusPoints from '../../Assignments/SubmissionsTable/BonusPoints';

const EvaluationDetail = ({
  assignment: { firstDeadline, allowSecondDeadline, secondDeadline },
  evaluation,
  isCorrect,
  submittedAt,
  maxPoints,
  bonusPoints
}) =>
  <Box
    title={
      <FormattedMessage
        id="app.evaluationDetail.title.details"
        defaultMessage="Evaluation details"
      />
    }
    noPadding={true}
    collapsable={true}
    isOpen={true}
  >
    <Table>
      <tbody>
        <tr>
          <th>
            <FormattedMessage
              id="app.evaluationDetail.evaluatedAt"
              defaultMessage="Evaluated at:"
            />
          </th>
          <td className="text-center">
            <FormattedDate value={evaluation.evaluatedAt * 1000} />
            &nbsp;
            <FormattedTime value={evaluation.evaluatedAt * 1000} />
          </td>
        </tr>

        <tr>
          <th>
            <FormattedMessage
              id="app.evaluationDetail.beforeFirstDeadline"
              defaultMessage="Was submitted before the deadline:"
            />
          </th>
          <td className="text-center">
            {submittedAt < firstDeadline
              ? <FontAwesomeIcon icon="check" className="text-success" />
              : <FontAwesomeIcon icon="times" className="text-danger" />}
          </td>
        </tr>

        {submittedAt >= firstDeadline &&
          allowSecondDeadline === true &&
          <tr>
            <th>
              <FormattedMessage
                id="app.evaluationDetail.beforeSecondDeadline"
                defaultMessage="Was submitted before the second deadline:"
              />
            </th>
            <td className="text-center">
              <MaybeSucceededIcon success={submittedAt < secondDeadline} />
            </td>
          </tr>}

        <tr>
          <th>
            <FormattedMessage
              id="app.evaluationDetail.buildSucceeded"
              defaultMessage="Build succeeded:"
            />
          </th>
          <td className="text-center">
            <MaybeSucceededIcon success={!evaluation.initFailed} />
          </td>
        </tr>

        <tr>
          <th>
            <FormattedMessage
              id="app.evaluationDetail.isCorrect"
              defaultMessage="Is correct:"
            />
          </th>
          <td
            className={classnames({
              'text-center': true,
              'text-danger': !isCorrect,
              'text-success': isCorrect
            })}
          >
            <b>
              <FormattedNumber style="percent" value={evaluation.score} />
            </b>
          </td>
        </tr>
        <tr>
          <th>
            <FormattedMessage
              id="app.evaluationDetail.score"
              defaultMessage="Score:"
            />
          </th>
          <td
            className={classnames({
              'text-center': true,
              'text-danger': !isCorrect && bonusPoints === 0,
              'text-success': isCorrect && bonusPoints === 0,
              'text-bold': evaluation.bonusPoints === 0
            })}
          >
            {evaluation.points}/{maxPoints}
          </td>
        </tr>
        {bonusPoints !== 0 &&
          <tr>
            <th>
              <FormattedMessage
                id="app.evaluationDetail.bonusPoints"
                defaultMessage="Bonus points:"
              />
            </th>
            <td className="text-center">
              <BonusPoints bonus={bonusPoints} />
            </td>
          </tr>}
        {bonusPoints !== 0 &&
          <tr>
            <th>
              <FormattedMessage
                id="app.evaluationDetail.totalScore"
                defaultMessage="Total score:"
              />
            </th>
            <td
              className={classnames({
                'text-center': true,
                'text-danger':
                  !isCorrect || evaluation.points + bonusPoints <= 0,
                'text-success': isCorrect && evaluation.points + bonusPoints > 0
              })}
            >
              <b>
                {evaluation.points + bonusPoints}/{maxPoints}
              </b>
            </td>
          </tr>}
      </tbody>
    </Table>
  </Box>;

EvaluationDetail.propTypes = {
  assignment: PropTypes.shape({
    firstDeadline: PropTypes.number.isRequired,
    allowSecondDeadline: PropTypes.bool.isRequired,
    secondDeadline: PropTypes.number
  }).isRequired,
  isCorrect: PropTypes.bool.isRequired,
  submittedAt: PropTypes.number.isRequired,
  evaluation: PropTypes.object,
  maxPoints: PropTypes.number.isRequired,
  bonusPoints: PropTypes.number.isRequired
};

export default EvaluationDetail;
