import React, { PropTypes } from 'react';
import { ProgressBar, Well } from 'react-bootstrap';

const EvaluationProgress = ({
  messages = [],
  progress = 0
}) => (
  <div>
    <ProgressBar now={progress} active />
    <Well>
      <pre>
        {messages.map(msg => <div>{msg}</div>)}
      </pre>
    </Well>
  </div>
);

EvaluationProgress.propTypes = {
  messages: PropTypes.array.isRequired,
  progress: PropTypes.number.isRequired
};

export default EvaluationProgress;
