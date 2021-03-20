import React, { Component } from 'react';

import { getTicketFromUrl } from '../../helpers/cas';

import styles from './LoginExternFinalization.less';

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
    const ticket = getTicketFromUrl(window.location.href);
    if (!ticket || !window.opener || window.opener.closed) {
      window.close();
      return;
    }

    window.opener.postMessage(ticket, window.location.origin);
    window.addEventListener('message', this.messageHandler);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.messageHandler);
  }

  render() {
    return (
      <div className={styles.container}>
        <p className={styles.centered}>Processing CAS authentication...</p>
      </div>
    );
  }
}

export default LoginExternFinalization;
