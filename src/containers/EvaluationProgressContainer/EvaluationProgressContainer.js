import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { List } from 'immutable';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import {
  init,
  addMessage,
  completedTask,
  skippedTask,
  failedTask,
  finish
} from '../../redux/modules/evaluationProgress';

import {
  getExpectedTasksCount,
  getCompletedPercent,
  getSkippedPercent,
  getFailedPercent,
  getMessages,
  isFinished
} from '../../redux/selectors/evaluationProgress';

import { finishProcessing } from '../../redux/modules/submission';

import EvaluationProgress from '../../components/EvaluationProgress';
import randomMessages, { lastMessage } from './randomMessages';

class EvaluationProgressContainer extends Component {

  state = { realTimeProcessing: true };
  componentWillMount = () => this.init(this.props);
  componentWillReceiveProps = (props) => this.init(props);
  componentWillUnmount = () => {
    if (this.socket) {
      this.socket.close();
    }
  };

  init = (props) => {
    const {
      monitor,
      isOpen
    } = props;

    if (!this.socket && monitor !== null) {
      if (typeof WebSocket === 'function') {
        this.socket = new WebSocket(monitor.url);
        this.socket.onopen = () => this.socket.send(monitor.id);
        this.socket.onmessage = this.onMessage;
        this.socket.onerror = (err) => this.onError(err);
      } else {
        this.setState({ realTimeProcessing: false });
      }
    }
  };

  onError = (err) => {
    const { addMessage } = this.props;
    console.warn('communication over websocket failed', err);
    addMessage({
      wasSuccessful: false,
      status: 'SKIPPED',
      text: err // @todo: Translatable error msg
    });
    this.closeSocket();
  };

  onMessage = (msg) => {
    const data = JSON.parse(msg.data);
    const { addMessage } = this.props;

    switch (data.command) {
      case 'TASK':
        this.updateProgress(data);
        break;
      case 'FINISHED':
        addMessage(this.formatMessage(data));
        this.closeSocket();
        addMessage({ wasSuccessful: true, status: 'OK', text: lastMessage });
        break;
    }
  };

  formatMessage = ({ command, task_state = 'OK', text = null }) => ({    // eslint-disable-line camelcase
    wasSuccessful: command !== 'TASK' || task_state === 'COMPLETED',      // eslint-disable-line camelcase
    text: text || this.getRandomMessage(),
    status: task_state // eslint-disable-line camelcase
  });

  getRandomMessage = () => {
    if (!this.availableMessages || this.availableMessages.length === 0) {
      this.availableMessages = Object.assign([], randomMessages);
    }

    const randomIndex = Math.floor(Math.random() * this.availableMessages.length);
    return this.availableMessages.splice(randomIndex, 1).pop();
  };

  updateProgress = task => {
    const { completedTask, skippedTask, failedTask } = this.props;
    const msg = this.formatMessage(task);
    switch (task.task_state) {
      case 'COMPLETED':
        completedTask(msg);
        break;
      case 'SKIPPED':
        skippedTask(msg);
        break;
      case 'FAILED':
        failedTask(msg);
        break;
    }
  };

  closeSocket = () => {
    const {
      finish,
      goToEvaluationDetails
    } = this.props;

    this.socket.close();
    this.isClosed = true;

    // fire a callback if any
    finish && finish();
  };

  finish = () => {
    const { link, finishProcessing } = this.props;
    const { router } = this.context;
    finishProcessing();
    router.push(link);
  };

  render = () => {
    const {
      isOpen,
      expectedTasksCount,
      messages,
      progress,
      isFinished
    } = this.props;

    return this.state.realTimeProcessing === true
      ? <EvaluationProgress
          isOpen={isOpen}
          messages={messages}
          completed={progress.completed}
          skipped={progress.skipped}
          failed={progress.failed}
          finished={isFinished}
          showContinueButton={isFinished || this.isClosed}
          finishProcessing={this.finish} />
      : <EvaluationProgress
          isOpen={isOpen}
          completed={0}
          skipped={100}
          failed={0}
          finished={false}
          showContinueButton={true}
          finishProcessing={this.finish}
          messages={List([
            this.formatMessage({
              command: 'TASK',
              task_state: 'SKIPPED',
              text: <FormattedMessage
                      id='app.evaluationProgress.noWebSockets'
                      defaultMessage='Your browser does not support realtime progress monitoring or the connection to the server could not be estabelished or was lost. The evaluation has already started and you will be able to see the results soon.' />
            })
          ])} />;
  };

}

EvaluationProgressContainer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  submissionId: PropTypes.string,
  port: PropTypes.number,
  url: PropTypes.string,
  path: PropTypes.string,
  finish: PropTypes.func,
  finishProcessing: PropTypes.func.isRequired,
  link: PropTypes.string.isRequired
};

EvaluationProgressContainer.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default connect(
  state => ({
    expectedTasksCount: getExpectedTasksCount(state),
    progress: {
      completed: getCompletedPercent(state),
      skipped: getSkippedPercent(state),
      failed: getFailedPercent(state)
    },
    isFinished: isFinished(state),
    messages: getMessages(state)
  }),
  {
    finish,
    finishProcessing,
    completedTask,
    skippedTask,
    failedTask,
    addMessage
  }
)(EvaluationProgressContainer);
