import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import { List } from 'immutable';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';

import {
  addMessage,
  completedTask,
  skippedTask,
  failedTask,
  finish as finishEvaluationProgress,
  dropObserver,
} from '../../redux/modules/evaluationProgress';

import {
  getExpectedTasksCount,
  getCompletedPercent,
  getSkippedPercent,
  getFailedPercent,
  getMessages,
  isFinished,
} from '../../redux/selectors/evaluationProgress';

import { finishProcessing as finishSubmissionProcessing } from '../../redux/modules/submission';

import EvaluationProgress from '../../components/Assignments/EvaluationProgress';
import randomMessages, { extraMessages } from './randomMessages';

class EvaluationProgressContainer extends Component {
  state = { realTimeProcessing: true, monitor: null };

  socket = null;

  componentDidMount = () => this.init(this.props);

  componentDidUpdate = prevProps => {
    if (this.props.monitor && this.props.monitor.id) {
      if (prevProps.monitor && prevProps.monitor.id) {
        if (this.props.monitor.id === prevProps.monitor.id) {
          return;
        }
      }
      this.init(this.props);
    }
  };

  componentWillUnmount = () => {
    this.closeSocket();
  };

  init = props => {
    const { monitor } = props;
    this.closeSocket();

    if (
      monitor !== null &&
      (!this.state.monitor || monitor.url !== this.state.monitor.url || monitor.id !== this.state.monitor.id)
    ) {
      if (typeof WebSocket === 'function') {
        this.setState({ monitor, realTimeProcessing: true });
        this.socket = new WebSocket(monitor.url);
        this.socket.onopen = () => this.socket.send(monitor.id);
        this.socket.onmessage = this.onMessage;
        this.socket.onerror = err => this.onError(err);
      } else {
        this.setState({ realTimeProcessing: false });
      }
    }
  };

  onError = () => {
    const {
      addMessage,
      intl: { formatMessage },
    } = this.props;
    addMessage({
      wasSuccessful: false,
      status: 'SKIPPED',
      text: formatMessage(extraMessages.error),
    });
    this.closeSocket();
  };

  onMessage = msg => {
    const data = JSON.parse(msg.data);
    const {
      addMessage,
      intl: { formatMessage },
    } = this.props;

    switch (data.command) {
      case 'TASK':
        this.updateProgress(data);
        break;
      case 'FINISHED':
        addMessage(this.formatMessageInternal(data));
        this.closeSocket();
        addMessage({
          wasSuccessful: true,
          status: 'OK',
          text: formatMessage(extraMessages.last),
        });
        break;
    }
  };

  formatMessageInternal = ({
    command,
    task_state = 'OK', // eslint-disable-line camelcase
    text = null,
  }) => ({
    wasSuccessful: command !== 'TASK' || task_state === 'COMPLETED', // eslint-disable-line camelcase
    text: text || this.props.intl.formatMessage(this.getRandomMessage()),
    status: task_state, // eslint-disable-line camelcase
  });

  getRandomMessage = () => {
    if (!this.availableMessages || this.availableMessages.length === 0) {
      this.availableMessages = Object.assign([], Object.values(randomMessages));
    }

    const randomIndex = Math.floor(Math.random() * this.availableMessages.length);
    return this.availableMessages.splice(randomIndex, 1).pop();
  };

  updateProgress = task => {
    const { completedTask, skippedTask, failedTask } = this.props;
    const msg = this.formatMessageInternal(task);
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
    if (this.socket) {
      this.socket.close();
      this.socket = null;

      // fire a callback if any
      const { finishEvaluationProgress } = this.props;
      finishEvaluationProgress && finishEvaluationProgress();
    }
  };

  finish = () => {
    const { finishSubmissionProcessing, dropObserver, onFinish } = this.props;
    finishSubmissionProcessing();
    this.closeSocket();
    dropObserver();
    onFinish && onFinish();
  };

  userCloseAction = () => {
    const { finishSubmissionProcessing, dropObserver, onUserClose } = this.props;
    finishSubmissionProcessing();
    this.closeSocket();
    dropObserver();
    onUserClose && onUserClose();
  };

  render = () => {
    const { isOpen, messages, progress, isFinished } = this.props;
    const now = new Date();
    const isAprilFoolsDay = now.getDate() === 1 && now.getMonth() === 3;

    return this.state.realTimeProcessing === true ? (
      <EvaluationProgress
        isOpen={isOpen}
        messages={isAprilFoolsDay ? messages : null}
        completed={progress.completed}
        skipped={progress.skipped}
        failed={progress.failed}
        finished={isFinished}
        showContinueButton={isFinished || !this.socket}
        finishProcessing={this.finish}
        onClose={this.userCloseAction}
      />
    ) : (
      <EvaluationProgress
        isOpen={isOpen}
        completed={0}
        skipped={100}
        failed={0}
        finished={false}
        showContinueButton={true}
        finishProcessing={this.finish}
        onClose={this.userCloseAction}
        messages={List([
          this.formatMessageInternal({
            command: 'TASK',
            task_state: 'SKIPPED',
            text: (
              <FormattedMessage
                id="app.evaluationProgress.noWebSockets"
                defaultMessage="Your browser does not support realtime progress monitoring or the connection to the server could not be estabelished or was lost. The evaluation has already started and you will be able to see the results soon."
              />
            ),
          }),
        ])}
      />
    );
  };
}

EvaluationProgressContainer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  monitor: PropTypes.shape({
    id: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }),
  isFinished: PropTypes.bool.isRequired,
  submissionId: PropTypes.string,
  port: PropTypes.number,
  url: PropTypes.string,
  path: PropTypes.string,
  finishEvaluationProgress: PropTypes.func,
  finishSubmissionProcessing: PropTypes.func.isRequired,
  addMessage: PropTypes.func.isRequired,
  expectedTasksCount: PropTypes.number.isRequired,
  progress: PropTypes.shape({
    completed: PropTypes.number.isRequired,
    skipped: PropTypes.number.isRequired,
    failed: PropTypes.number.isRequired,
  }),
  completedTask: PropTypes.func.isRequired,
  skippedTask: PropTypes.func.isRequired,
  failedTask: PropTypes.func.isRequired,
  goToEvaluationDetails: PropTypes.func,
  messages: ImmutablePropTypes.list,
  intl: PropTypes.object.isRequired,
  dropObserver: PropTypes.func.isRequired,
  onUserClose: PropTypes.func,
  onFinish: PropTypes.func,
};

export default connect(
  state => ({
    expectedTasksCount: getExpectedTasksCount(state),
    progress: {
      completed: getCompletedPercent(state),
      skipped: getSkippedPercent(state),
      failed: getFailedPercent(state),
    },
    isFinished: isFinished(state),
    messages: getMessages(state),
  }),
  {
    finishEvaluationProgress,
    finishSubmissionProcessing,
    completedTask,
    skippedTask,
    failedTask,
    addMessage,
    dropObserver,
  }
)(injectIntl(EvaluationProgressContainer));
