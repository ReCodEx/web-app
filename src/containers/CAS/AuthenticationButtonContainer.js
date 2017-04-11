import React, { Component, PropTypes } from 'react';
import { Authenticate, LoginFailed } from '../../components/CAS';
import { createCASLoginUrl, getTicketFromUrl } from '../../helpers/cas';
import withLinks from '../../hoc/withLinks';
import { absolute } from '../../links';

class AuthenticationButtonContainer extends Component {
  constructor(props, context) {
    super(props, context);
    this.casWindow = null;
    this.pollCASLogin = null;
  }

  onClick = () => {
    if (typeof window !== 'undefined') {
      if (this.casWindow === null) {
        const { links } = this.props;
        const returnUrl = absolute(links.HOME_URI);
        this.casWindow = window.open(
          createCASLoginUrl(returnUrl),
          'CAS',
          'modal=true,width=1024,height=850'
        );
        this.pollCASLogin = setInterval(this.detectTicket, 100);
      } else {
        this.casWindow.focus(); // no need to create the window again
      }
    }
  };

  detectTicket = () => {
    const { onTicketObtained } = this.props;
    if (this.casWindow === null || this.casWindow.closed === true) {
      this.dispose();
    } else {
      try {
        const url = this.casWindow.location.href;
        const ticket = getTicketFromUrl(url);
        if (ticket !== null) {
          this.dispose();
          onTicketObtained(ticket); // dispatch an action to verify the token
        }
      } catch (e) {
        // silent error - not redirected yet
        return;
      }
    }
  };

  /**
   * Clean up all the mess (the window, the interval)
   */
  dispose = () => {
    if (this.casWindow) {
      this.casWindow.close();
      this.casWindow = null;
    }

    if (this.pollCASLogin) {
      clearInterval(this.pollCASLogin);
      this.pollCASLogin = null;
    }
  };

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
  onTicketObtained: PropTypes.func.isRequired
};

export default withLinks(AuthenticationButtonContainer);
