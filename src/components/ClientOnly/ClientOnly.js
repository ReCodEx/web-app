import { Component, PropTypes } from 'react';

class ClientOnly extends Component {

  state = { isBrowser: false };

  componentDidMount() {
    this.setState({ isBrowser: true }); // eslint-disable-line react/no-did-mount-set-state
  }

  render() {
    if (this.state.isBrowser) {
      return this.props.children;
    } else {
      return null;
    }
  }

}

ClientOnly.propTypes = {
  children: PropTypes.element.isRequired
};

export default ClientOnly;
