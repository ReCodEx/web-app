import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Authenticate, LoginFailed } from '../../components/buttons/CAS';
import { openCASWindow, getTicketFromUrl } from '../../helpers/cas';
import withLinks from '../../hoc/withLinks';
import { absolute } from '../../links';

class AuthenticationButtonContainer extends Component {
  constructor(props, context) {
    super(props, context);
    this.casWindow = null;
    this.pollCASLogin = null;
  }

  onClick = () => {
    if (this.casWindow === null) {
      const { links, onFailed } = this.props;
      const returnUrl = absolute(links.HOME_URI);
      this.casWindow = openCASWindow(returnUrl);
      if (!this.casWindow) {
        onFailed(); // not in browser or for some reason the window could not have been opened
      } else {
        // the window is open, now periodically check if the user has already logged in
        this.pollCASLogin = setInterval(this.pollTicket, 100);
      }
    } else {
      this.casWindow.focus(); // no need to create the window again
    }
  };

  pollTicket = () => {
    const { onTicketObtained, links } = this.props;
    if (this.casWindow === null || this.casWindow.closed === true) {
      // the user has closed the window manually or the window was closed
      // programatically, but the interval was cleared too late
      this.dispose();
    } else {
      try {
        const ticket = getTicketFromUrl(this.casWindow.location.href);
        if (ticket !== null) {
          // cancel the window and the interval
          this.dispose(1000); // delayed window close (1s)
          const clientUrl = absolute(links.HOME_URI);
          onTicketObtained(ticket, clientUrl);
        }
      } catch (e) {
        // silent error - not redirected yet
      }
    }
  };

  /**
   * Clean up all the mess (the window, the interval)
   */
  dispose = (windowCloseDelay = 0) => {
    if (this.pollCASLogin) {
      clearInterval(this.pollCASLogin);
      this.pollCASLogin = null;
    }

    if (this.casWindow) {
      if (windowCloseDelay > 0 && !this.casWindow.closed) {
        // A delay before close is requested ...
        const lingeringWindow = this.casWindow;
        lingeringWindow.blur();
        window.setTimeout(() => {
          if (!lingeringWindow.closed) lingeringWindow.close();
        }, windowCloseDelay);
      } else {
        // Close immediately
        this.casWindow.close();
      }

      this.casWindow = null;
      window.focus(); // focus back to our main window
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
  onFailed: PropTypes.func.isRequired
};

export default withLinks(AuthenticationButtonContainer);
