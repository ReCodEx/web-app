import React, { Component, PropTypes } from 'react';


class EvaluationProgressContainer extends Component {

  state = { messages: [], progress: 0 };

  componentWillMount = () => {
    const {
      channelId,
      port = 4567,
      url = 'recodex.projekty.ms.mff.cuni.cz'
    } = this.props;

    this.socket = new WebSocket();
    this.socket.onopen = () => this.socket.send(channelId);
    this.socket.onmessage = ({ data }) =>
      this.setState({
        messages: [ ...this.state.messages, data ]
      });
    this.socket.onerror = () => this.finish(false);
    this.socket.onclose = () => this.finish(true);
  };

  finish = (successful) => {
    console.log('socket was closed', successful);
  };

  render = () =>
    <EvaluationProgress
      messages={this.state.messages}
      progress={this.state.progress} />;

}

EvaluationProgressContainer.propTypes = {
  channelId: PropTypes.string.isRequired,
  port: PropTypes.number,
  url: PropTypes.string,
  jobsCount: PropTypes.number
};

export default EvaluationProgressContainer;
