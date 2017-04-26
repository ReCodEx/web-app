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

import Box from '../../widgets/Box';
import { MaybeSucceededIcon } from '../../icons';
import BonusPoints from '../../Assignments/SubmissionsTable/BonusPoints';

const EvaluationDetail = (
  {
    assignment: {
      firstDeadline,
      allowSecondDeadline,
      secondDeadline
    },
    evaluation,
    note = '',
    submittedAt,
    maxPoints
  }
) => (
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
              ? <Icon name="check" className="text-success" />
              : <Icon name="times" className="text-danger" />}
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
              id="app.evaluationDetail.hasFinished"
              defaultMessage="Evaluation process has finished:"
            />
          </th>
          <td className="text-center">
            <MaybeSucceededIcon success={!evaluation.evaluationFailed} />
          </td>
        </tr>

        <tr>
          <th>
            <FormattedMessage
              id="app.evaluationDetail.isValid"
              defaultMessage="Evaluation is valid:"
            />
          </th>
          <td className="text-center">
            <MaybeSucceededIcon success={evaluation.isValid} />
          </td>
        </tr>

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
              'text-danger': !evaluation.isCorrect,
              'text-success': evaluation.isCorrect
            })}
          >
            <b><FormattedNumber style="percent" value={evaluation.score} /></b>
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
              'text-danger': !evaluation.isCorrect &&
                evaluation.bonusPoints === 0,
              'text-success': evaluation.isCorrect &&
                evaluation.bonusPoints === 0,
              'text-bold': evaluation.bonusPoints === 0
            })}
          >
            {evaluation.points}/{maxPoints}
          </td>
        </tr>
        {evaluation.bonusPoints !== 0 &&
          <tr>
            <th>
              <FormattedMessage
                id="app.evaluationDetail.bonusPoints"
                defaultMessage="Bonus points:"
              />
            </th>
            <td className="text-center">
              <BonusPoints bonus={evaluation.bonusPoints} />
            </td>
          </tr>}
        {evaluation.bonusPoints !== 0 &&
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
                'text-danger': !evaluation.isCorrect ||
                  evaluation.points + evaluation.bonusPoints <= 0,
                'text-success': evaluation.isCorrect &&
                  evaluation.points + evaluation.bonusPoints > 0
              })}
            >
              <b>
                {evaluation.points + evaluation.bonusPoints}/{maxPoints}
              </b>
            </td>
          </tr>}
      </tbody>
    </Table>
  </Box>
);

EvaluationDetail.propTypes = {
  assignment: PropTypes.shape({
    firstDeadline: PropTypes.number.isRequired,
    allowSecondDeadline: PropTypes.bool.isRequired,
    secondDeadline: PropTypes.number
  }).isRequired,
  note: PropTypes.string,
  submittedAt: PropTypes.number.isRequired,
  evaluation: PropTypes.object,
  maxPoints: PropTypes.number.isRequired
};

export default EvaluationDetail;
