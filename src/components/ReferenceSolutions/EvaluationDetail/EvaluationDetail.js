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
import { MaybeSucceededIcon } from '../../icons';

const EvaluationDetail = ({ evaluation, note = '' }) => (
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
            <b>
              <FormattedNumber style="percent" value={evaluation.score} />
            </b>
          </td>
        </tr>
      </tbody>
    </Table>
  </Box>
);

EvaluationDetail.propTypes = {
  evaluation: PropTypes.object.isRequired,
  note: PropTypes.string
};

export default EvaluationDetail;
