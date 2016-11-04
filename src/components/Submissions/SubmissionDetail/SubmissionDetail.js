import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Icon from 'react-fontawesome';
import { FormattedMessage, FormattedDate, FormattedTime } from 'react-intl';
import { Table, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router';

import Box from '../../AdminLTE/Box';
import SourceCodeInfoBox from '../../SourceCodeInfoBox';
import ResourceRenderer from '../../ResourceRenderer';
import LocalizedAssignments from '../../Assignments/Assignment/LocalizedAssignments';
import AssignmentStatusIcon from '../../Assignments/Assignment/AssignmentStatusIcon';
import TestResults from '../TestResults';
import CommentThreadContainer from '../../../containers/CommentThreadContainer';

import EvaluationDetail from '../EvaluationDetail';

const SubmissionDetail = ({
  assignmentId,
  id,
  note = '',
  evaluationStatus,
  submittedAt,
  evaluation,
  maxPoints,
  assignment,
  files,
  onCloseSourceViewer,
  children
}, {
  links: { SOURCE_CODE_DETAIL_URI_FACTORY }
}) => (
  <div>
    <Row>
      <Col lg={4}>
        <Row>
          <Col lg={12} md={6} sm={12}>
            <Box
              title={<FormattedMessage id='app.submission.title' defaultMessage='Your solution' />}
              noPadding={true}
              collapsable={true}
              isOpen={true}>
              <Table>
                <tbody>
                  {note.length > 0 &&
                    <tr>
                      <td className='text-center'><Icon name='pencil' /></td>
                      <th><FormattedMessage id='app.submission.yourNote' defaultMessage='Your note:' /></th>
                      <td>{note}</td>
                    </tr>
                  }
                  <tr>
                    <td className='text-center'><Icon name='clock-o' /></td>
                    <th><FormattedMessage id='app.submission.submittedAt' defaultMessage='Submitted at:' /></th>
                    <td>
                      <FormattedDate value={submittedAt * 1000} />&nbsp;<FormattedTime value={submittedAt * 1000} />
                    </td>
                  </tr>
                  <tr>
                    <td className='text-center'><b><AssignmentStatusIcon status={evaluationStatus} /></b></td>
                    <th><FormattedMessage id='app.submission.isCorrect' defaultMessage='Your solution is correct:' /></th>
                    <td>
                      <strong>
                        {evaluationStatus === 'done' &&
                          <FormattedMessage id='app.submission.evaluation.status.isCorrect' defaultMessage='Your solution is correct and meets all criteria.' />}
                        {evaluationStatus === 'work-in-progress' &&
                          <FormattedMessage id='app.submission.evaluation.status.workInProgress' defaultMessage='Your solution has not been evaluated yet.' />}
                        {evaluationStatus === 'failed' &&
                          <FormattedMessage id='app.submission.evaluation.status.failed' defaultMessage='Your solution does not meet the defined criteria.' />}
                        {evaluationStatus === 'evaluation-failed' &&
                          <FormattedMessage id='app.submission.evaluation.status.systemFailiure' defaultMessage={`Evaluation process had failed and your submission
                            could not have been evaluated. Please submit your solution once more. If you keep receiving errors please contact the administrator of this project.`} />}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Box>
          </Col>

          {evaluationStatus !== 'work-in-progress' && (
            <Col lg={12} md={6} sm={12}>
              <EvaluationDetail
                assignment={assignment}
                evaluation={evaluation}
                submittedAt={submittedAt}
                maxPoints={maxPoints} />
            </Col>
          )}
        </Row>
        <Row>
        {files.map(file => (
          <Col lg={12} sm={6} key={file.id}>
            <Link to={SOURCE_CODE_DETAIL_URI_FACTORY(assignmentId, id, file.id)}>
              <SourceCodeInfoBox {...file} />
            </Link>
          </Col>
        ))}
        </Row>
      </Col>
      <Col lg={8}>
        <Row>
          {evaluation && (
            <Col sm={6}>
              <TestResults evaluation={evaluation} />
              <CommentThreadContainer threadId={id} />
            </Col>
          )}
          <Col sm={6}>
            <ResourceRenderer resource={assignment}>
              {({ localizedAssignments }) => <LocalizedAssignments locales={localizedAssignments} />}
            </ResourceRenderer>
          </Col>
        </Row>
      </Col>
    </Row>

    {children &&
      React.cloneElement(children, { show: !!children, onCloseSourceViewer })}
  </div>
);

SubmissionDetail.propTypes = {
  id: PropTypes.string.isRequired,
  evaluationStatus: PropTypes.string.isRequired,
  assignmentId: PropTypes.string.isRequired,
  note: PropTypes.string,
  submittedAt: PropTypes.number.isRequired,
  evaluation: PropTypes.object,
  maxPoints: PropTypes.number.isRequired,
  assignment: ImmutablePropTypes.map,
  files: PropTypes.array,
  onCloseSourceViewer: PropTypes.func,
  children: PropTypes.element
};

SubmissionDetail.contextTypes = {
  links: PropTypes.object
};

export default SubmissionDetail;
