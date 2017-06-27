import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isJSON from 'validator/lib/isJSON';

class PipelineVisualisation extends Component {
  state = { source: '' };

  componentWillMount() {
    this.changeSource(this.props.source);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.source !== nextProps.source) {
      this.changeSource(nextProps.source);
    }
  }

  changeSource = source => {
    if (isJSON(source)) {
      this.setState({ source });
    }
  };

  render() {
    const { source } = this.state;
    return (
      <div className="well">
        <h2>This will be a nice graph soon:</h2>
        <code>{source}</code>
      </div>
    );
  }
}

PipelineVisualisation.propTypes = {
  source: PropTypes.string.isRequired
};

export default PipelineVisualisation;
