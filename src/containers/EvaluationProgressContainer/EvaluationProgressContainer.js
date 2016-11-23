import React, { Component, PropTypes } from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { List } from 'immutable';
import { connect } from 'react-redux';

import {
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
import randomMessages, { extraMessages } from './randomMessages';

class EvaluationProgressContainer extends Component {

  state = { realTimeProcessing: true, monitor: null };
  componentWillMount = () => this.init(this.props);
  componentWillReceiveProps = (props) => this.init(props);
  componentWillUnmount = () => {
    this.closeSocket();
    this.socket = null;
  };

  init = (props) => {
    const { monitor } = props;
    if (!this.socket && monitor !== null && monitor !== this.state.monitor) {
      if (typeof WebSocket === 'function') {
        this.socket = new WebSocket(monitor.url);
        this.socket.onopen = () => this.socket.send(monitor.id);
        this.socket.onmessage = this.onMessage;
        this.socket.onerror = (err) => this.onError(err);
        this.setState({ monitor });
      } else {
        this.setState({ realTimeProcessing: false });
      }
    }
  };

  onError = () => {
    const {
      addMessage,
      intl: { formatMessage }
    } = this.props;
    addMessage({
      wasSuccessful: false,
      status: 'SKIPPED',
      text: formatMessage(extraMessages.error)
    });
    this.closeSocket();
  };

  onMessage = (msg) => {
    const data = JSON.parse(msg.data);
    const {
      addMessage,
      intl: { formatMessage }
    } = this.props;

    switch (data.command) {
      case 'TASK':
        this.updateProgress(data);
        break;
      case 'FINISHED':
        addMessage(this.formatMessage(data));
        this.closeSocket();
        addMessage({ wasSuccessful: true, status: 'OK', text: formatMessage(extraMessages.last) });
        break;
    }
  };

  formatMessage = ({ command, task_state = 'OK', text = null }) => ({    // eslint-disable-line camelcase
    wasSuccessful: command !== 'TASK' || task_state === 'COMPLETED',      // eslint-disable-line camelcase
    text: text || this.props.intl.formatMessage(this.getRandomMessage()),
    status: task_state // eslint-disable-line camelcase
  });

  getRandomMessage = () => {
    if (!this.availableMessages || this.availableMessages.length === 0) {
      this.availableMessages = Object.assign([], Object.values(randomMessages));
    }

    const randomIndex = Math.floor(Math.random() * this.availableMessages.length);
    return this.availableMessages.splice(randomIndex, 1).pop();
  };

  updateProgress = (task) => {
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
    this.isClosed = true;
    if (this.socket) {
      this.socket.close();
    }

    // fire a callback if any
    const { finish } = this.props;
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
  monitor: PropTypes.shape({
    id: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired
  }),
  isFinished: PropTypes.bool.isRequired,
  submissionId: PropTypes.string,
  port: PropTypes.number,
  url: PropTypes.string,
  path: PropTypes.string,
  finish: PropTypes.func,
  finishProcessing: PropTypes.func.isRequired,
  link: PropTypes.string.isRequired,
  addMessage: PropTypes.func.isRequired,
  expectedTasksCount: PropTypes.number.isRequired,
  progress: PropTypes.shape({
    completed: PropTypes.number.isRequired,
    skipped: PropTypes.number.isRequired,
    failed: PropTypes.number.isRequired
  }),
  completedTask: PropTypes.func.isRequired,
  skippedTask: PropTypes.func.isRequired,
  failedTask: PropTypes.func.isRequired,
  goToEvaluationDetails: PropTypes.func,
  messages: PropTypes.object,
  intl: PropTypes.object.isRequired
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
)(
  injectIntl(EvaluationProgressContainer)
);
