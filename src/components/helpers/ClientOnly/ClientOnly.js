import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ClientOnly extends Component {
  state = { isBrowser: false };

  componentDidMount() {
    this.setState({ isBrowser: true }); // eslint-disable-line react/no-did-mount-set-state
  }

  render() {
    if (this.state.isBrowser) {
      return (
        <span>
          {this.props.children}
        </span>
      );
    } else {
      return <span />;
    }
  }
}

ClientOnly.propTypes = {
  children: PropTypes.any
};

export default ClientOnly;
