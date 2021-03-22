import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, FormattedHTMLMessage, intlShape, injectIntl } from 'react-intl';

import Button from '../../components/widgets/FlatButton';
import Box from '../../components/widgets/Box';
import { LinkIcon, LoadingIcon, SuccessIcon } from '../../components/icons';
import { externalLogin, externalLoginFailed, statusTypes } from '../../redux/modules/auth';
import { statusSelector } from '../../redux/selectors/auth';
import { hasErrorMessage, getErrorMessage } from '../../locales/apiErrorMessages';

export const openPopupWindow = url =>
  typeof window !== 'undefined'
    ? window.open(url, 'ExternalLogin', 'modal=true,width=1024,height=850,centerscreen=yes')
    : null;

class ExternalLoginBox extends Component {
  state = { pending: false, lastError: null };

  constructor(props) {
    super(props);
    this.popupWindow = null;
    this.pollPopupClosed = null;
  }

  // Handle the messages from our popup window...
  messageHandler = e => {
    const token = e.data; // the message should be the external JWT token

    if (token !== null && e.source === this.popupWindow && this.popupWindow !== null) {
      // cancel the window and the interval
      this.popupWindow.postMessage('received', e.origin);
      this.props.login(token, this.popupWindow, error => {
        error.json().then(body => {
          if (body && body.error && hasErrorMessage(body.error)) {
            this.setState({ lastError: body.error });
          }
        });
      });
      this.dispose(); // delayed window close (1s)
    }
  };

  onClick = () => {
    if (this.popupWindow === null || this.popupWindow.closed) {
      const { url, fail } = this.props;

      this.popupWindow = openPopupWindow(url);
      if (!this.popupWindow) {
        fail(); // not in browser or for some reason the window could not have been opened
      } else {
        // the window is open, now periodically check if the user has already logged in
        window.addEventListener('message', this.messageHandler);
        this.pollPopupClosed = window.setInterval(this.pollPopupClosedHandler, 100);
      }
    } else {
      this.popupWindow.focus(); // no need to create the window again
    }
    this.setState({ pending: true, lastError: null });
  };

  pollPopupClosedHandler = () => {
    // Check, whether the popup has been closed ...
    if (!this.popupWindow || this.popupWindow.closed === true) {
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

    if (this.popupWindow) {
      this.popupWindow = null;
    }

    this.setState({ pending: false });
  };

  /**
   * Avoid memory leaks if the user leaves the page before the popup window is closed.
   */
  componentWillUnmount = this.dispose;

  render() {
    const {
      name,
      helpUrl,
      loginStatus,
      intl: { formatMessage },
    } = this.props;

    const pending = this.state.pending || loginStatus === statusTypes.LOGGING_IN;
    const loggedIn = loginStatus === statusTypes.LOGGED_IN;

    return (
      <Box
        title={<FormattedMessage id="app.externalLogin.title" defaultMessage="Sign-in by External Authenticator" />}
        footer={
          <div className="text-center">
            <Button bsStyle="success" onClick={this.onClick} disabled={pending || loggedIn}>
              {pending ? <LoadingIcon gapRight /> : loggedIn ? <SuccessIcon gapRight /> : <LinkIcon gapRight />}
              {pending ? (
                <FormattedMessage id="app.externalLogin.button.authenticating" defaultMessage="Authenticating..." />
              ) : loggedIn ? (
                <FormattedMessage id="app.externalLogin.button.authenticated" defaultMessage="Authenticated" />
              ) : (
                <FormattedMessage id="app.externalLogin.button.authenticate" defaultMessage="Authenticate" />
              )}
            </Button>
          </div>
        }>
        <p>
          <FormattedMessage
            id="app.externalLogin.description"
            defaultMessage="Sign-in into ReCodEx using external authentication service '{name}'. If you do not have an account in ReCodEx, it will attempt to create one. If you do have a local account, it will be associated with your external identity if both have the same e-mail address."
            values={{ name }}
          />
        </p>
        {helpUrl && (
          <p>
            <FormattedHTMLMessage
              id="app.externalLogin.help"
              defaultMessage="In case of any problems, <a href='{helpUrl}'>contact the support</a>."
              values={{ helpUrl }}
            />
          </p>
        )}

        {!pending && this.state.lastError && (
          <p className="callout callout-danger em-margin-top">{getErrorMessage(formatMessage)(this.state.lastError)}</p>
        )}

        {!pending && this.state.lastError === null && loginStatus === statusTypes.LOGIN_FAILED && (
          <p className="callout callout-danger em-margin-top">
            <FormattedMessage id="app.externalLogin.failed" defaultMessage="External authentication failed." />
          </p>
        )}
      </Box>
    );
  }
}

ExternalLoginBox.propTypes = {
  name: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  service: PropTypes.string.isRequired,
  helpUrl: PropTypes.string,
  loginStatus: PropTypes.string,
  login: PropTypes.func.isRequired,
  fail: PropTypes.func.isRequired,
  afterLogin: PropTypes.func.isRequired,
  intl: intlShape,
};

export default connect(
  (state, { service }) => ({
    loginStatus: statusSelector(service)(state),
  }),
  (dispatch, { service, afterLogin = null }) => ({
    login: (token, popupWindow, errorHandler = null) => {
      const promise = dispatch(externalLogin(service, token, popupWindow));
      return (afterLogin ? promise.then(afterLogin) : promise).catch(e => errorHandler && errorHandler(e));
    },
    fail: () => dispatch(externalLoginFailed(service)),
  })
)(injectIntl(ExternalLoginBox));
