import React, { PropTypes } from 'react';
import Box from '../Box';
import Icon from 'react-fontawesome';
import classnames from 'classnames';
import { FormattedNumber, FormattedDate, FormattedTime } from 'react-intl';

import AssignmentStatusIcon from '../Assignment/AssignmentStatusIcon';
import { Table } from 'react-bootstrap';

const getStatus = evaluation =>
  !evaluation
    ? 'work-in-progress'
    : evaluation.evaluationFailed === true
      ? 'evaluation-failed'
      : evaluation.isCorrect === true
        ? 'done'
        : 'failed';

const SubmissionDetail = ({
  id,
  note = '',
  evaluation,
  submittedAt,
  files
}) => (
  <div>
    <Box
      title='Detail odevzdaného řešení'
      noPadding={false}
      collapsable={true}
      type={!evaluation ? undefined : (evaluation.isCorrect ? 'success' : 'danger')}
      isOpen={true}>
      {note.length > 0 && <p><b>Poznámka:</b> {note}</p>}
      <Table>
        <tbody>
          <tr>
            <th>Datum a čas odevzdání:</th>
            <td>
              <FormattedDate value={submittedAt * 1000} />&nbsp;<FormattedTime value={submittedAt * 1000} />
            </td>
          </tr>
          <tr>
            <th>Řešení je správné:</th>
            <td>
              <AssignmentStatusIcon status={getStatus(evaluation)} />{' '}
              {getStatus(evaluation) === 'done' && 'Řešení splňuje nastavená kritéria.'}
              {getStatus(evaluation) === 'work-in-progress' && 'Řešení zatím nebylo vyhodnoceno.'}
              {getStatus(evaluation) === 'failed' && 'Řešení nesplňuje nastavená kritéria.'}
              {getStatus(evaluation) === 'evaluation-failed' && 'Vyhodnocovací systém selhal a řešení se nepodařilo vyhodnotit. Odevzdání opakujte a pokud problémy přetrvají, kontaktujte prosím správce webu.'}
            </td>
          </tr>
        </tbody>
        {evaluation && (
          <tbody>
            <tr>
              <th>Čas vyhodnocení:</th>
              <td className={'text-center'}>
                <FormattedDate value={evaluation.evaluatedAt * 1000} />&nbsp;<FormattedTime value={evaluation.evaluatedAt * 1000} />
              </td>
            </tr>

            {/* @todo: Was submitted before the (second?) deadline? */}

            <tr>
              <th>Vyhodnocování proběhlo až do konce:</th>
              <td className={
                classnames({
                  'text-center': true,
                  'text-danger': evaluation.evaluationFailed
                })
              }>
                <Icon name={evaluation.evaluationFailed ? 'times' : 'check'} />
              </td>
            </tr>
            <tr>
              <th>Vyhodnocení je platné:</th>
              <td className={
                classnames({
                  'text-center': true,
                  'text-danger': !evaluation.isValid
                })
              }>
                <Icon name={evaluation.isValid ? 'check' : 'times'} />
              </td>
            </tr>
            <tr>
              <th>Hodnocení:</th>
              <td className={
                classnames({
                  'text-center': true,
                  'text-danger': !evaluation.isCorrect,
                  'text-success': evaluation.isCorrect
                })
              }>
                <b><FormattedNumber style='percent' value={evaluation.score} /></b>
              </td>
            </tr>
            <tr>
              <th>Počet získaných bodů:</th>
              <td className={
                classnames({
                  'text-center': true,
                  'text-danger': !evaluation.isCorrect,
                  'text-success': evaluation.isCorrect
                })
              }>
                <b>{evaluation.points}/{evaluation.maxPoints}</b>
              </td>
            </tr>
          </tbody>
        )}
      </Table>
    </Box>

    {/*
    // @todo List the source code with COLOR HIGHLIGHTING!!
    {files.map(file => (
      <Box key={file} collapsable isOpen={false} title={file.name}>
        <Well>
          {file.content}
        </Well>
      </Box>
    ))}
    */}
  </div>
);

SubmissionDetail.propTypes = {
  id: PropTypes.string.isRequired,
  note: PropTypes.string,
  submittedAt: PropTypes.number.isRequired,
  evaluation: PropTypes.object
};

export default SubmissionDetail;
