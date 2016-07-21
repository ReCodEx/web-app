import React, { PropTypes } from 'react';
import { Modal } from 'react-bootstrap';

const SubmissionDetail = ({
  open,
  onHide,
  onExited
}) => (
  <Modal show={open} onHide={onHide} onExited={onExited}>
    <Modal.Header closeButton>
      <Modal.Title>Detail odevzdaného řešení</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      todo
    </Modal.Body>
  </Modal>
);

SubmissionDetail.propTypes = {
  open: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired
};

export default SubmissionDetail;
