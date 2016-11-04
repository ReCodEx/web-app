import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Grid, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router';

import SubmissionStatus from '../SubmissionStatus';
import SourceCodeInfoBox from '../../SourceCodeInfoBox';
import LocalizedAssignments from '../../Assignments/Assignment/LocalizedAssignments';
import TestResults from '../TestResults';
import CommentThreadContainer from '../../../containers/CommentThreadContainer';

import EvaluationDetail from '../EvaluationDetail';

const SubmissionDetail = ({
  submission: {
    id,
    note = '',
    evaluationStatus,
    submittedAt,
    maxPoints,
    files,
    evaluation
  },
  assignment,
  onCloseSourceViewer,
  children
}, {
  links: { SOURCE_CODE_DETAIL_URI_FACTORY }
}) => (
  <div>
    <Row>
      <Col lg={4} md={6} sm={12}>
        <SubmissionStatus
          evaluationStatus={evaluationStatus}
          submittedAt={submittedAt}
          note={note} />
        <CommentThreadContainer threadId={id} />
      </Col>

      {evaluation && (
        <Col lg={4} md={6} sm={12}>
          <EvaluationDetail
            assignment={assignment}
            evaluation={evaluation}
            submittedAt={submittedAt}
            maxPoints={maxPoints} />
          <TestResults evaluation={evaluation} />
        </Col>
      )}

      <Col lg={4} md={6} sm={12}>
        <LocalizedAssignments locales={assignment.localizedAssignments} />
      </Col>
    </Row>

    {/*
      Source codes
      */}
    <Row>
      <Col xs={12}>
        <h2>
          <FormattedMessage id='app.submission.files.title' defaultMessage='Submitted files' />
        </h2>
      </Col>
    </Row>
    <Row>
      {files.map(file => (
      <Col lg={4} sm={6} key={file.id}>
        <Link to={SOURCE_CODE_DETAIL_URI_FACTORY(assignment.id, id, file.id)}>
          <SourceCodeInfoBox {...file} />
        </Link>
      </Col>
      ))}
    </Row>

    {children &&
      React.cloneElement(children, { show: !!children, onCloseSourceViewer })}
  </div>
);

SubmissionDetail.propTypes = {
  assignmentId: PropTypes.string.isRequired,
  submission: PropTypes.shape({
    id: PropTypes.string.isRequired,
    evaluationStatus: PropTypes.string.isRequired,
    note: PropTypes.string,
    submittedAt: PropTypes.number.isRequired,
    evaluation: PropTypes.object,
    maxPoints: PropTypes.number.isRequired,
    files: PropTypes.array
  }).isRequired,
  assignment: PropTypes.object.isRequired,
  onCloseSourceViewer: PropTypes.func,
  children: PropTypes.element
};

SubmissionDetail.contextTypes = {
  links: PropTypes.object
};

export default SubmissionDetail;
