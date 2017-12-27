import React, { Component } from 'react';
//import PropTypes from 'prop-types';

import { getTicketFromUrl } from '../../helpers/cas';

import 'admin-lte/dist/css/AdminLTE.min.css';
import 'admin-lte/dist/css/skins/skin-green.min.css';
// import 'admin-lte/dist/css/skins/skin-purple.min.css';

import styles from './LoginExternFinalization.less';

/**
 * Handles the dependency injection of the localized links based on the current language stated in the URL.
 * Also controls the state of the sidebar - collapsing and showing the sidebar.
 */
class LoginExternFinalization extends Component {
  messageHandler = e => {
    if (e.data === 'received') {
      // Once the message with ticket was received, our seconds are numbered...
      window.setTimeout(() => {
        window.close();
      }, 2000);
    } else if (e.data === 'die') {
      // An advice to drop dead immediately ...
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

LoginExternFinalization.propTypes = {
  //  params: PropTypes.shape({
  //    lang: PropTypes.string
  //  }),
};

export default LoginExternFinalization;
