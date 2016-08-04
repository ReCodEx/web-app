import React, { PropTypes } from 'react';
import Box from '../Box';
import Icon from 'react-fontawesome';
import classnames from 'classnames';
import { FormattedNumber, FormattedDate, FormattedTime } from 'react-intl';
import { Modal, Table, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router';

import { isReady, isLoading, hasFailed } from '../../redux/helpers/resourceManager';
import { SOURCE_CODE_DETAIL_URI_FACTORY } from '../../links';

import { LoadingIcon } from '../Icons';
import SourceCodeInfoBox from '../SourceCodeInfoBox';
import AssignmentDetails, {
  LoadingAssignmentDetails,
  FailedAssignmentDetails
} from '../Assignment/AssignmentDetails';
import AssignmentStatusIcon from '../Assignment/AssignmentStatusIcon';

const SubmissionDetail = ({
  assignmentId,
  id,
  note = '',
  evaluationStatus,
  submittedAt,
  evaluation,
  assignment,
  files,
  onCloseSourceViewer,
  children
}) => (
  <div>
    <Box
      title='Vaše řešení'
      noPadding={true}
      collapsable={true}
      type={!evaluation ? undefined : (evaluation.isCorrect ? 'success' : 'danger')}
      isOpen={true}>
      <Table>
        <tbody>
          {note.length > 0 &&
            <tr>
              <th>Poznámka:</th>
              <td>{note}</td>
            </tr>
          }
          <tr>
            <th>Datum a čas odevzdání:</th>
            <td>
              <FormattedDate value={submittedAt * 1000} />&nbsp;<FormattedTime value={submittedAt * 1000} />
            </td>
          </tr>
          <tr>
            <th>Řešení je správné:</th>
            <td>
              <strong>
                <AssignmentStatusIcon status={evaluationStatus} />{' '}
                {evaluationStatus === 'done' && 'Řešení splňuje nastavená kritéria.'}
                {evaluationStatus === 'work-in-progress' && 'Řešení zatím nebylo vyhodnoceno.'}
                {evaluationStatus === 'failed' && 'Řešení nesplňuje nastavená kritéria.'}
                {evaluationStatus === 'evaluation-failed' && 'Vyhodnocovací systém selhal a řešení se nepodařilo vyhodnotit. Odevzdání opakujte a pokud problémy přetrvají, kontaktujte prosím správce webu.'}
              </strong>
            </td>
          </tr>
        </tbody>
      </Table>
    </Box>

    <Box
      title='Detaily vyhodnocení'
      noPadding={true}
      collapsable={true}
      isOpen={true}>
      <Table>
      {!evaluation && (
        <tbody>
          <tr>
            <td className='text-center' colSpan={2}>
              <LoadingIcon />{' '}Zjištuji podrobnosti ...
            </td>
          </tr>
        </tbody>
      )}

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

    <Row>
    {files.map(file => (
      <Col md={4} sm={6} key={file}>
        <Link to={SOURCE_CODE_DETAIL_URI_FACTORY(assignmentId, id, file.id)}>
          <SourceCodeInfoBox {...file} />
        </Link>
      </Col>
    ))}
    </Row>

    {isLoading(assignment) && <LoadingAssignmentDetails />}
    {hasFailed(assignment) && <FailedAssignmentDetails />}
    {isReady(assignment) && (
      <AssignmentDetails
        assignment={assignment.data}
        isAfterFirstDeadline={assignment.data.deadline.first * 1000 < Date.now()}
        isAfterSecondDeadline={assignment.data.deadline.second * 1000 < Date.now()}
        isOpen={false} />
    )}

    <Modal
      show={!!children}
      onHide={onCloseSourceViewer}
      bsSize='large'>
      <Modal.Header closeButton>
        <Modal.Title>Odevzdaný zdrojový kód</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {children}
      </Modal.Body>
    </Modal>
  </div>
);

SubmissionDetail.propTypes = {
  id: PropTypes.string.isRequired,
  note: PropTypes.string,
  submittedAt: PropTypes.number.isRequired,
  evaluation: PropTypes.object
};

export default SubmissionDetail;
