import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classnames from 'classnames';
import { Modal, ProgressBar, Table } from 'react-bootstrap';
import ImmutablePropTypes from 'react-immutable-proptypes';

import Button from '../../widgets/TheButton';
import EvaluationStatusText from './EvaluationStatusText';
import Icon from '../../icons';

const messagesContainerStyle = {
  maxHeight: 300,
  overflowY: 'scroll',
};

class EvaluationProgress extends Component {
  state = { messagesCount: 0 };

  componentDidUpdate() {
    if (this.props.messages && this.state.messagesCount < this.props.messages.size) {
      this.setState({ messagesCount: this.props.messages.size });
      setTimeout(this.scrollToBottom, 10);
    }
  }

  scrollToBottom = () => {
    const el = this.bodyContainer;
    if (el) {
      // the element is not available when the box is collapsed
      el.scrollTop = el.scrollHeight;
    }
  };

  render() {
    const {
      isOpen,
      finished = false,
      showContinueButton = false,
      messages,
      completed = 0,
      skipped = 0,
      failed = 0,
      finishProcessing,
      onClose,
    } = this.props;

    return (
      <Modal show={isOpen} backdrop="static" onHide={onClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FormattedMessage id="app.evaluationProgress.title" defaultMessage="Solution is being evaluated" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProgressBar>
            <ProgressBar now={completed} variant="success" animated={!finished} />
            <ProgressBar now={skipped} variant="warning" animated={!finished} />
            <ProgressBar now={failed} variant="danger" animated={!finished} />
          </ProgressBar>
          {messages && (
            <div
              style={messagesContainerStyle}
              ref={c => {
                this.bodyContainer = c;
              }}>
              <Table responsive>
                <tbody>
                  {messages.map(({ wasSuccessful, text, status }, i) => (
                    <tr key={i}>
                      <td
                        className={classnames({
                          'text-center': true,
                          'text-success': wasSuccessful,
                          'text-danger': !wasSuccessful,
                        })}>
                        <strong>
                          <Icon icon={wasSuccessful ? 'check-circle' : 'times-circle'} />
                        </strong>
                      </td>
                      <td>{text}</td>
                      <td
                        className={classnames({
                          'text-center': true,
                          'text-success': wasSuccessful,
                          'text-danger': !wasSuccessful,
                          'text-bold': true,
                        })}>
                        <EvaluationStatusText status={status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <p className="text-center">
            <Button
              variant={finished ? 'success' : 'secondary'}
              onClick={finishProcessing}
              disabled={!showContinueButton}>
              <FormattedMessage id="app.evaluationProgress.continue" defaultMessage="See The Results" />
            </Button>
          </p>
        </Modal.Footer>
      </Modal>
    );
  }
}

EvaluationProgress.propTypes = {
  isOpen: PropTypes.bool,
  showContinueButton: PropTypes.bool,
  finished: PropTypes.bool.isRequired,
  messages: ImmutablePropTypes.list,
  completed: PropTypes.number.isRequired,
  skipped: PropTypes.number.isRequired,
  failed: PropTypes.number.isRequired,
  finishProcessing: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EvaluationProgress;
