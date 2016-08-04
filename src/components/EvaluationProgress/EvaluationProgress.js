import React, { PropTypes } from 'react';
import Icon from 'react-fontawesome';
import classnames from 'classnames';
import { Button, Modal, ProgressBar, Table } from 'react-bootstrap';

const EvaluationProgress = ({
  isOpen,
  finished = false,
  messages = [],
  completed = 0,
  skipped = 0,
  failed = 0,
  finishProcessing
}) => (
  <Modal show={isOpen} backdrop='static'>
    <Modal.Header>
      <Modal.Title>Odevzdat nové řešení</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <ProgressBar>
        <ProgressBar now={completed} bsStyle='success' active={!finished} />
        <ProgressBar now={skipped} bsStyle='warning' active={!finished} />
        <ProgressBar now={failed} bsStyle='danger' active={!finished} />
      </ProgressBar>
      <Table responsive>
        <tbody>
        {messages.map(({ wasSuccessful, text, status }, i) =>
          <tr key={i}>
            <td className={'text-center ' + (wasSuccessful ? 'text-success' : 'text-danger')}>
              <strong>
                <Icon name={wasSuccessful ? 'check-circle' : 'times-circle'} />
              </strong>
            </td>
            <td>
              {text}
            </td>
            <td className={'text-center ' + (wasSuccessful ? 'text-success' : 'text-danger')}>
              <strong>
              {status}
              </strong>
            </td>
          </tr>)}
        </tbody>
      </Table>
    </Modal.Body>
    <Modal.Footer>
      <p className='text-center'>
        <Button
          bsStyle={finished ? 'success' : 'default'}
          className='btn-flat'
          onClick={finishProcessing}
          disabled={!finished}>
          Pokračovat k vyhodnocení
        </Button>
      </p>
    </Modal.Footer>
  </Modal>
);

EvaluationProgress.propTypes = {
  finished: PropTypes.bool.isRequired,
  messages: PropTypes.object.isRequired,
  completed: PropTypes.number.isRequired,
  skipped: PropTypes.number.isRequired,
  failed: PropTypes.number.isRequired
};

export default EvaluationProgress;
