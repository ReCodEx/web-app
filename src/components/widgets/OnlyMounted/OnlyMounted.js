import React, { Component } from 'react';
import PropTypes from 'prop-types';

class OnlyMounted extends Component {
  state = { mounted: false };

  componentDidMount() {
    this.setState({ mounted: true });
  }

  componentWillUnmount() {
    this.setState({ mounted: false });
  }

  render() {
    const { children, fallback = null } = this.props;
    return this.state.mounted
      ? children
      : fallback || <div className="bg-secondary-subtle p-5 mb-1 w-100 rounded opacity-50" />;
  }
}

OnlyMounted.propTypes = {
  fallback: PropTypes.any,
  children: PropTypes.any,
};

export default OnlyMounted;
