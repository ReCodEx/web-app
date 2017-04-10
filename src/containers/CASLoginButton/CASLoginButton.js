import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Button from '../../components/AdminLTE/FlatButton';
import { createCASLoginUrl, getTicketFromUrl } from '../../helpers/cas';

class CASLoginButton extends Component {
  constructor(props, context) {
    super(props, context);
    this.casWindow = null;
    this.pollCASLogin = null;
  }

  onClick = () => {
    if (typeof window !== 'undefined') {
      if (this.casWindow === null) {
        const { returnUrl } = this.props;
        this.casWindow = window.open(
          createCASLoginUrl(returnUrl),
          'CAS',
          'modal=true'
        );
        this.pollCASLogin = setInterval(this.detectTicket, 100);
      } else {
        this.casWindow.focus(); // no need to create the window again
      }
    }
  };

  detectTicket = () => {
    if (this.casWindow && this.casWindow.closed === false) {
      try {
        const url = this.casWindow.location.href;
        const ticket = getTicketFromUrl(url);
        if (ticket !== null) {
          const { verifyTicket } = this.props;
          verifyTicket(ticket); // dispatch an action to verify the token
          this.dispose();
        }
      } catch (e) {
        // silent error
      }
    } else {
      this.dispose();
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

  render() {
    return (
      <Button onClick={this.onClick}>
        <FormattedMessage
          id="app.casLoginButton.login"
          defaultMessage="Authenticate through CAS"
        />
      </Button>
    );
  }
}

CASLoginButton.propTypes = {
  returnUrl: PropTypes.string.isRequired,
  verifyTicket: PropTypes.func.isRequired
};

const mapStateToProps = (state, props) => ({});
const mapDispatchToProps = { validateTicket: ticket => false }; // @todo ticket must be an action creator

export default connect(mapStateToProps, mapDispatchToProps)(CASLoginButton);
