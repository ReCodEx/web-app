import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Authenticate, LoginFailed } from '../../components/buttons/CAS';
import { openCASWindow } from '../../helpers/cas';
import withLinks from '../../helpers/withLinks';

const makeAbsolute = url =>
  typeof window === 'undefined' ? url : `${window.location.origin}/${url.indexOf('/') === 0 ? url.substr(1) : url}`;

const ensureAbsoluteUrl = url => (url.match('^(https?:)?//.+') !== null ? url : makeAbsolute(url));

class AuthenticationButtonContainer extends Component {
  constructor(props, context) {
    super(props, context);
    this.casWindow = null;
    this.pollPopupClosed = null;
  }

  // Handle the messages from our popup window...
  messageHandler = e => {
    const ticket = e.data; // the message should be the ticket
    const { links, onTicketObtained } = this.props;

    if (ticket !== null && e.source === this.casWindow && this.casWindow !== null) {
      // cancel the window and the interval
      const clientUrl = ensureAbsoluteUrl(links.LOGIN_EXTERN_FINALIZATION_URI_FACTORY('cas-uk'));
      this.casWindow.postMessage('received', e.origin);
      onTicketObtained(ticket, clientUrl, this.casWindow);
      this.dispose(); // delayed window close (1s)
    }
  };

  onClick = () => {
    if (this.casWindow === null || this.casWindow.closed) {
      const { links, onFailed } = this.props;

      const returnUrl = ensureAbsoluteUrl(links.LOGIN_EXTERN_FINALIZATION_URI_FACTORY('cas-uk'));
      this.casWindow = openCASWindow(returnUrl);
      if (!this.casWindow) {
        onFailed(); // not in browser or for some reason the window could not have been opened
      } else {
        // the window is open, now periodically check if the user has already logged in
        window.addEventListener('message', this.messageHandler);
        this.pollPopupClosed = window.setInterval(this.pollPopupClosedHandler, 100);
      }
    } else {
      this.casWindow.focus(); // no need to create the window again
    }
  };

  pollPopupClosedHandler = () => {
    // Check, whether the popup has been closed ...
    if (!this.casWindow || this.casWindow.closed === true) {
      this.dispose();
    }
  };

  /**
   * Clean up all the mess (the window, the interval)
   */
  dispose = () => {
    window.removeEventListener('message', this.messageHandler);

    if (this.pollPopupClosed) {
      clearInterval(this.pollPopupClosed);
      this.pollPopupClosed = null;
    }

    if (this.casWindow) {
      this.casWindow = null;
    }
  };

  /**
   * Avoid memory leaks if the user leaves the page before the popup window is closed.
   */
  componentWillUnmount = this.dispose;

  render = () => {
    const { retry } = this.props;
    const Button = retry ? LoginFailed : Authenticate;
    return <Button onClick={this.onClick} />;
  };
}

AuthenticationButtonContainer.propTypes = {
  links: PropTypes.object.isRequired,
  retry: PropTypes.bool,
  onTicketObtained: PropTypes.func.isRequired,
  onFailed: PropTypes.func.isRequired,
};

export default withLinks(AuthenticationButtonContainer);
