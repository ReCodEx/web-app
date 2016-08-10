import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import {
  init,
  addMessage,
  completedTask,
  skippedTask,
  failedTask
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

  componentWillMount = () => this.init(this.props);
  componentWillReceiveProps = (props) => this.init(props);

  init = (props) => {
    const {
      submissionId,
      port = 4567,
      url = '195.113.17.8',
      isOpen
    } = props;

    if (!this.socket && submissionId !== null) {
      this.socket = new WebSocket(`ws://${url}:${port}`);
      this.socket.onopen = () => this.socket.send(submissionId);
      this.socket.onmessage = this.onMessage;
      this.socket.onerror = () => this.onError();
      this.socket.onclose = () => this.onConnectionClosed();
    }
  };

  onMessage = (msg) => {
    const data = JSON.parse(msg.data);
    const { addMessage } = this.props;
    addMessage(this.getMessage(data));

    switch (data.command) {
      case 'TASK':
        this.updateProgress(data);
        break;
      case 'FINISHED':
        this.closeSocket();
        break;
    }
  };

  getMessage = ({ command, task_id = false, task_state = 'OK' }) => ({    // eslint-disable-line camelcase
    wasSuccessful: command !== 'TASK' || task_state === 'COMPLETED',      // eslint-disable-line camelcase
    text: this.getRandomMessage(),
    status: this.getStatus(task_state)
  });

  getRandomMessage = () => {
    if (!this.availableMessages || this.availableMessages.length === 0) {
      this.availableMessages = Object.assign([], randomMessages);
    }

    const randomIndex = Math.floor(Math.random() * this.availableMessages.length);
    return this.availableMessages.splice(randomIndex, 1).pop();
  };

  /** @todo Rewrite when localization is introduced */
  getStatus = status => {
    switch (status) {
      case 'COMPLETED':
        return 'HOTOVO';
      case 'SKIPPED':
        return 'PŘESKOČENO';
      case 'FAILED':
        return 'SELHALO';
      default:
        return 'OK';
    }
  };

  updateProgress = task => {
    const { completedTask, skippedTask, failedTask } = this.props;
    switch (task.task_state) {
      case 'COMPLETED':
        completedTask();
        break;
      case 'SKIPPED':
        skippedTask();
        break;
      case 'FAILED':
        failedTask();
        break;
    }
  };

  closeSocket = () => {
    const {
      addMessage,
      goToEvaluationDetails
    } = this.props;

    this.socket.close();
    addMessage({ wasSuccessful: true, status: 'OK', text: lastMessage });
  };

  // @todo Do something ??
  onError = () => {
    console.log('websocket connection failed');
  };

  // @todo Do something ??
  onConnectionClosed = () => {
    console.log('websocket connection was closed');
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

    return (
      <EvaluationProgress
        isOpen={isOpen}
        messages={messages}
        completed={progress.completed}
        skipped={progress.skipped}
        failed={progress.failed}
        finished={isFinished}
        finishProcessing={this.finish} />
    );
  };

}

EvaluationProgressContainer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  assignmentId: PropTypes.string,
  submissionId: PropTypes.string,
  port: PropTypes.number,
  url: PropTypes.string,
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
  (dispatch, props) => ({
    finishProcessing: () => dispatch(finishProcessing()),
    completedTask: () => dispatch(completedTask()),
    skippedTask: () => dispatch(skippedTask()),
    failedTask: () => dispatch(failedTask()),
    addMessage: (message) => dispatch(addMessage(message))
  })
)(EvaluationProgressContainer);
