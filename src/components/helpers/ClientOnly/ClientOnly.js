import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ClientOnly extends Component {
  state = { isBrowser: false };

  componentDidMount() {
    this.setState({ isBrowser: true });  
  }

  render() {
    if (this.state.isBrowser) {
      return <>{this.props.children}</>;
    } else {
      return <span />;
    }
  }
}

ClientOnly.propTypes = {
  children: PropTypes.any,
};

export default ClientOnly;
