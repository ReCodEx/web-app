import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from 'react-fontawesome';
import classNames from 'classnames';
import { Modal, ProgressBar, Table } from 'react-bootstrap';
import Button from '../../widgets/FlatButton';
import EvaluationStatusText from './EvaluationStatusText';

const messagesContainerStyle = {
  maxHeight: 300,
  overflowY: 'scroll'
};

class EvaluationProgress extends Component {
  state = { messagesCount: 0 };

  componentDidUpdate() {
    if (this.state.messagesCount < this.props.messages.size) {
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
      messages = [],
      completed = 0,
      skipped = 0,
      failed = 0,
      finishProcessing,
      onClose
    } = this.props;

    return (
      <Modal show={isOpen} backdrop="static" onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FormattedMessage
              id="app.evaluationProgress.title"
              defaultMessage="Solution is being evaluated"
            />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProgressBar>
            <ProgressBar now={completed} bsStyle="success" active={!finished} />
            <ProgressBar now={skipped} bsStyle="warning" active={!finished} />
            <ProgressBar now={failed} bsStyle="danger" active={!finished} />
          </ProgressBar>
          {messages &&
            <div
              style={messagesContainerStyle}
              ref={c => {
                this.bodyContainer = c;
              }}
            >
              <Table responsive>
                <tbody>
                  {messages.map(({ wasSuccessful, text, status }, i) =>
                    <tr key={i}>
                      <td
                        className={classNames({
                          'text-center': true,
                          'text-success': wasSuccessful,
                          'text-danger': !wasSuccessful
                        })}
                      >
                        <strong>
                          <Icon
                            name={
                              wasSuccessful ? 'check-circle' : 'times-circle'
                            }
                          />
                        </strong>
                      </td>
                      <td>
                        {text}
                      </td>
                      <td
                        className={classNames({
                          'text-center': true,
                          'text-success': wasSuccessful,
                          'text-danger': !wasSuccessful,
                          'text-bold': true
                        })}
                      >
                        <EvaluationStatusText status={status} />
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>}
        </Modal.Body>
        <Modal.Footer>
          <p className="text-center">
            <Button
              bsStyle={finished ? 'success' : 'default'}
              onClick={finishProcessing}
              disabled={!showContinueButton}
            >
              <FormattedMessage
                id="app.evaluationProgress.continue"
                defaultMessage="See The Results"
              />
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
  messages: PropTypes.object.isRequired,
  completed: PropTypes.number.isRequired,
  skipped: PropTypes.number.isRequired,
  failed: PropTypes.number.isRequired,
  finishProcessing: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default EvaluationProgress;
