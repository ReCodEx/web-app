import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import SourceCodeInfoBox from '../../widgets/SourceCodeInfoBox';
import TestResults from '../../Solutions/TestResults';
import DownloadResultArchiveContainer from '../../../containers/DownloadResultArchiveContainer';
import DownloadSolutionArchiveContainer from '../../../containers/DownloadSolutionArchiveContainer';
import CommentThreadContainer from '../../../containers/CommentThreadContainer';
import SourceCodeViewerContainer from '../../../containers/SourceCodeViewerContainer';
import SubmissionEvaluations from '../../Solutions/SubmissionEvaluations';
import ResourceRenderer from '../../helpers/ResourceRenderer';
import Button from '../../widgets/FlatButton';
import { RefreshIcon, WarningIcon } from '../../icons';

import CompilationLogs from '../../Solutions/CompilationLogs';
import ReferenceSolutionStatus from '../ReferenceSolutionStatus/ReferenceSolutionStatus';

import { EMPTY_OBJ, getFirstItemInOrder } from '../../../helpers/common';

const getLastSubmissionId = evaluations => {
  const evalArray = Object.values(evaluations)
    .map(x => x.data)
    .filter(a => a.submittedAt);
  const first = getFirstItemInOrder(
    evalArray,
    (a, b) => b.submittedAt - a.submittedAt
  );
  return first && first.id;
};

class ReferenceSolutionDetail extends Component {
  state = { openFileId: null, activeSubmissionId: null };
  openFile = id => this.setState({ openFileId: id });
  hideFile = () => this.setState({ openFileId: null });

  render() {
    const {
      solution: {
        id,
        description,
        runtimeEnvironmentId,
        solution: { createdAt, userId, files },
        permissionHints = EMPTY_OBJ,
      },
      exercise,
      evaluations,
      deleteEvaluation = null,
      refreshSolutionEvaluations = null,
    } = this.props;
    const { openFileId } = this.state;
    const evaluationsJS = evaluations && evaluations.toJS();
    const activeSubmissionId =
      evaluationsJS &&
      (this.state.activeSubmissionId || getLastSubmissionId(evaluationsJS));

    if (
      activeSubmissionId &&
      evaluationsJS[activeSubmissionId] &&
      evaluationsJS[activeSubmissionId].data
    ) {
      var {
        submittedBy,
        evaluation,
        isCorrect,
        evaluationStatus,
        ...restSub
      } = evaluationsJS[activeSubmissionId].data;
    } else evaluationStatus = 'missing-submission';

    return (
      <div>
        <Row>
          <Col md={6} sm={12}>
            <ReferenceSolutionStatus
              description={description}
              solution={{ createdAt, userId }}
              exerciseId={exercise.id}
            />
            <Row>
              {files.map(file => (
                <Col lg={6} md={12} key={file.id}>
                  <a
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      this.openFile(file.id);
                    }}>
                    <SourceCodeInfoBox {...file} />
                  </a>
                </Col>
              ))}
              {files.length > 1 && (
                <Col lg={6} md={12}>
                  <DownloadSolutionArchiveContainer
                    solutionId={id}
                    isReference={true}
                  />
                </Col>
              )}
            </Row>
            {evaluation && (
              <CompilationLogs
                initiationOutputs={evaluation.initiationOutputs}
              />
            )}
            <CommentThreadContainer threadId={id} />
          </Col>

          {evaluations && (
            <Col md={6} sm={12}>
              {!evaluation && (!evaluations || evaluations.size === 0) && (
                <div className="callout callout-danger">
                  <WarningIcon gapRight />
                  <FormattedMessage
                    id="app.submissionEvaluation.noEvaluationsWhatSoEver"
                    defaultMessage="There are no submission evaluations. This is higly unusual, since the solution is submitted for evaluation as soon as it is created. Check the configuration of the exercise and try to resubmit this solution again."
                  />
                </div>
              )}

              {!evaluation &&
                evaluations &&
                evaluations.size > 0 &&
                refreshSolutionEvaluations && (
                  <div className="callout callout-warning">
                    <table>
                      <tbody>
                        <tr>
                          <td width="100%" className="em-padding-right">
                            <FormattedMessage
                              id="app.submissionEvaluation.noEvaluationYet"
                              defaultMessage="The evaluation is not available yet. Click the refresh button for an update."
                            />
                          </td>
                          <td>
                            <Button
                              onClick={refreshSolutionEvaluations}
                              bsStyle="primary">
                              <RefreshIcon gapRight />
                              <FormattedMessage
                                id="generic.refresh"
                                defaultMessage="Refresh"
                              />
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

              {evaluation && (
                <TestResults
                  evaluation={evaluation}
                  runtimeEnvironmentId={runtimeEnvironmentId}
                  showJudgeLog={true}
                />
              )}

              {evaluation && (
                <Row>
                  <Col lg={6} md={12}>
                    <DownloadResultArchiveContainer
                      submissionId={restSub.id}
                      isReference={true}
                    />
                  </Col>
                </Row>
              )}
              {activeSubmissionId && (
                <Row>
                  <Col lg={12}>
                    <ResourceRenderer
                      resource={evaluations.toArray()}
                      returnAsArray>
                      {evaluations => (
                        <SubmissionEvaluations
                          submissionId={id}
                          evaluations={evaluations}
                          activeSubmissionId={activeSubmissionId}
                          showInfo={false}
                          onSelect={id =>
                            this.setState({ activeSubmissionId: id })
                          }
                          onDelete={
                            permissionHints.deleteEvaluation
                              ? deleteEvaluation
                              : null
                          }
                        />
                      )}
                    </ResourceRenderer>
                  </Col>
                </Row>
              )}
            </Col>
          )}
        </Row>

        <SourceCodeViewerContainer
          show={openFileId !== null}
          fileId={openFileId}
          onHide={() => this.hideFile()}
        />
      </div>
    );
  }
}

ReferenceSolutionDetail.propTypes = {
  solution: PropTypes.shape({
    id: PropTypes.string.isRequired,
    note: PropTypes.string,
    lastSubmission: PropTypes.shape({ id: PropTypes.string.isRequired }),
    solution: PropTypes.shape({
      createdAt: PropTypes.number.isRequired,
      userId: PropTypes.string.isRequired,
      files: PropTypes.array,
    }).isRequired,
    submissions: PropTypes.array.isRequired,
    permissionHints: PropTypes.object,
  }).isRequired,
  exercise: PropTypes.object.isRequired,
  evaluations: PropTypes.object.isRequired,
  deleteEvaluation: PropTypes.func,
  refreshSolutionEvaluations: PropTypes.func,
};

export default ReferenceSolutionDetail;
