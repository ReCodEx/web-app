import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {
  FormattedMessage,
  FormattedNumber,
  FormattedDate,
  FormattedTime
} from 'react-intl';
import { Table } from 'react-bootstrap';

import Box from '../../widgets/Box';
import { SuccessOrFailureIcon } from '../../icons';

const EvaluationDetail = ({ evaluation, isCorrect }) =>
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
              id="app.evaluationDetail.buildSucceeded"
              defaultMessage="Build succeeded:"
            />
          </th>
          <td className="text-center">
            <SuccessOrFailureIcon success={!evaluation.initFailed} />
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
      </tbody>
    </Table>
  </Box>;

EvaluationDetail.propTypes = {
  evaluation: PropTypes.object.isRequired,
  isCorrect: PropTypes.bool.isRequired
};

export default EvaluationDetail;
