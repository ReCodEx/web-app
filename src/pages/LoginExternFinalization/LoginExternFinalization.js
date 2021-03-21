import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getConfigVar } from '../../helpers/config';
import styles from './LoginExternFinalization.less';

const EXTERNAL_AUTH_SERVICE_ID = getConfigVar('EXTERNAL_AUTH_SERVICE_ID');

export const getTokenFromUrl = url => {
  const match = url.match(/[?&]token=([^&\b]+)/);
  return match === null ? null : match[1];
};

/**
 * Handles the dependency injection of the localized links based on the current language stated in the URL.
 * Also controls the state of the sidebar - collapsing and showing the sidebar.
 */
class LoginExternFinalization extends Component {
  constructor(props) {
    super(props);
    this.closeTimeout = null;
  }

  messageHandler = e => {
    if (e.data === 'received') {
      // Once the message with ticket was received, our seconds are numbered...
      this.closeTimeout = window.setTimeout(() => {
        window.close();
      }, 2000);
    } else if (e.data === 'die') {
      // An advice to drop dead immediately ...
      if (this.closeTimeout !== null) {
        window.clearTimeout(this.closeTimeout);
        this.closeTimeout = null;
      }
      window.close();
    }
  };

  componentDidMount() {
    if (this.props.match.params.service !== EXTERNAL_AUTH_SERVICE_ID) {
      // this is not the auth. service you are looking for...
      window.close();
      return;
    }

    const externToken = getTokenFromUrl(window.location.href);
    if (!externToken || !window.opener || window.opener.closed) {
      // we have nothing to send or no one to send it to
      window.close();
      return;
    }

    window.opener.postMessage(externToken, window.location.origin);
    window.addEventListener('message', this.messageHandler);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.messageHandler);
  }

  render() {
    return (
      <div className={styles.container}>
        <p className={styles.centered}>Processing external authentication data...</p>
      </div>
    );
  }
}

LoginExternFinalization.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      service: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default LoginExternFinalization;
