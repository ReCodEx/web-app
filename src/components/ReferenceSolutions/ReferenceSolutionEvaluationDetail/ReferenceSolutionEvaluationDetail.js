import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';

import ReferenceSolutionDetail from '../ReferenceSolutionDetail';
import SourceCodeInfoBox from '../../widgets/SourceCodeInfoBox';
import TestResults from '../../Submissions/TestResults';
import SourceCodeViewerContainer from '../../../containers/SourceCodeViewerContainer';
import ResultArchiveInfoBox from '../../../components/Submissions/ResultArchiveInfoBox';
import CompilationLogs from '../../../components/Submissions/CompilationLogs';
import EvaluationDetail from '../EvaluationDetail';

class ReferenceSolutionEvaluationDetail extends Component {
  state = { openFileId: null };
  openFile = id => this.setState({ openFileId: id });
  hideFile = () => this.setState({ openFileId: null });

  render() {
    const {
      referenceSolution,
      solutionEvaluation,
      exerciseId,
      downloadEvaluationArchive
    } = this.props;
    const { openFileId } = this.state;

    return (
      <div>
        <Row>
          <Col lg={6} sm={12}>
            <ReferenceSolutionDetail
              {...referenceSolution}
              exerciseId={exerciseId}
            />
            <Row>
              {referenceSolution.solution.files.map(file => (
                <Col lg={6} md={12} key={file.id}>
                  <a
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      this.openFile(file.id);
                    }}
                  >
                    <SourceCodeInfoBox {...file} />
                  </a>
                </Col>
              ))}
            </Row>
            {solutionEvaluation.evaluation && (
              <CompilationLogs
                initiationOutputs={
                  solutionEvaluation.evaluation.initiationOutputs
                }
              />
            )}
          </Col>
          {solutionEvaluation.evaluation && (
            <Col lg={6} sm={12}>
              <EvaluationDetail evaluation={solutionEvaluation.evaluation} />

              <TestResults
                evaluation={solutionEvaluation.evaluation}
                runtimeEnvironmentId={referenceSolution.runtimeEnvironmentId}
              />

              <Row>
                <Col lg={6} md={12}>
                  <a href="#" onClick={downloadEvaluationArchive}>
                    <ResultArchiveInfoBox id={solutionEvaluation.id} />
                  </a>
                </Col>
              </Row>
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

ReferenceSolutionEvaluationDetail.propTypes = {
  referenceSolution: PropTypes.object.isRequired,
  solutionEvaluation: PropTypes.object.isRequired,
  exerciseId: PropTypes.string.isRequired,
  downloadEvaluationArchive: PropTypes.func.isRequired
};

export default ReferenceSolutionEvaluationDetail;
