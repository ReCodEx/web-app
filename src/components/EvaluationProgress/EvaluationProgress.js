import React, { PropTypes } from 'react';
import Icon from 'react-fontawesome';
import { Link } from 'react-router';
import classnames from 'classnames';
import { Button, Modal, ProgressBar, Table } from 'react-bootstrap';

const EvaluationProgress = ({
  isOpen,
  finished = false,
  messages = [],
  completed = 0,
  skipped = 0,
  failed = 0,
  link
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
        <Link
          to={link}
          className={classnames({
            'btn': true,
            'btn-default': !finished,
            'btn-success': finished,
            'btn-flat': true
          })}
          disabled={!finished}>
          Pokračovat k vyhodnocení
        </Link>
      </p>
    </Modal.Footer>
  </Modal>
);

EvaluationProgress.propTypes = {
  finished: PropTypes.bool.isRequired,
  messages: PropTypes.object.isRequired,
  completed: PropTypes.number.isRequired,
  skipped: PropTypes.number.isRequired,
  failed: PropTypes.number.isRequired,
  link: PropTypes.string.isRequired
};

export default EvaluationProgress;
