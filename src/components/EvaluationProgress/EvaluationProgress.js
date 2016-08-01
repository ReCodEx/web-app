import React, { PropTypes } from 'react';
import { Modal, ProgressBar, Well } from 'react-bootstrap';

const EvaluationProgress = ({
  messages = [],
  progress = 0,
  isOpen
}) => (
  <Modal show={isOpen} onHide={close} backdrop='static'>
    <Modal.Header closeButton>
      <Modal.Title>Odevzdat nové řešení</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <ProgressBar now={progress} active />
      <Well>
        <pre>
          {messages.map((msg, i) => <div key={i}>{msg}</div>)}
        </pre>
      </Well>
    </Modal.Body>
  </Modal>
);

EvaluationProgress.propTypes = {
  messages: PropTypes.array.isRequired,
  progress: PropTypes.number.isRequired
};

export default EvaluationProgress;
