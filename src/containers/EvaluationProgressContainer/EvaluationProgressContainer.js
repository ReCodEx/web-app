import React, { Component, PropTypes } from 'react';
import EvaluationProgress from '../../components/EvaluationProgress';

class EvaluationProgressContainer extends Component {

  state = { messages: [], progress: 0 };

  componentWillMount = () => this.init(this.props);
  componentWillReceiveProps = (props) => this.init(props);

  init = (props) => {
    const {
      channelId,
      port = 4567,
      url = '195.113.17.8',
      isOpen
    } = props;

    if (!this.socket && channelId !== null) {
      this.socket = new WebSocket(`ws://${url}:${port}`);
      this.socket.onopen = () => this.socket.send(channelId);
      this.socket.onmessage = ({ data }) =>
        this.setState({
          messages: [ ...this.state.messages, data ]
        });
      this.socket.onerror = () => this.finish(false);
      this.socket.onclose = () => this.finish(true);
    }
  };

  finish = (successful) => {
    console.log('socket was closed', successful);
  };

  render = () =>
    <EvaluationProgress
      isOpen={this.props.isOpen}
      messages={this.state.messages}
      progress={this.state.progress} />;

}

EvaluationProgressContainer.propTypes = {
  channelId: PropTypes.string,
  port: PropTypes.number,
  url: PropTypes.string,
  isOpen: PropTypes.bool,
  jobsCount: PropTypes.number
};

export default EvaluationProgressContainer;
