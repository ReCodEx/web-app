import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';

import Button from '../../components/widgets/TheButton';
import Box from '../../components/widgets/Box';
import Callout from '../../components/widgets/Callout';
import Explanation from '../../components/widgets/Explanation';
import { LinkIcon, LoadingIcon, SuccessIcon } from '../../components/icons';
import NiceCheckbox from '../../components/forms/NiceCheckbox';

import { externalLogin, externalLoginFailed, statusTypes } from '../../redux/modules/auth.js';
import { statusSelector, loginErrorSelector } from '../../redux/selectors/auth.js';
import { hasErrorMessage, getErrorMessage } from '../../locales/apiErrorMessages.js';

export const openPopupWindow = url =>
  typeof window !== 'undefined'
    ? window.open(url, 'ExternalLogin', 'modal=true,width=1024,height=850,centerscreen=yes')
    : null;

class ExternalLoginBox extends Component {
  state = { pending: false, lastError: null, short: false };

  constructor(props) {
    super(props);
    this.popupWindow = null;
    this.pollPopupClosed = null;
  }

  setShort = () => {
    this.setState({ short: !this.state.short });
  };

  // Handle the messages from our popup window...
  messageHandler = e => {
    const { shortSessionConfig, login } = this.props;
    const token = e.data; // the message should be the external JWT token

    if (token !== null && e.source === this.popupWindow && this.popupWindow !== null) {
      // cancel the window and the interval
      this.popupWindow.postMessage('received', e.origin);
      login(token, this.state.short && shortSessionConfig ? shortSessionConfig * 60 : null, this.popupWindow, error => {
        if (hasErrorMessage(error)) {
          this.setState({ lastError: error });
        }
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
      shortSessionConfig = null,
      loginStatus,
      loginError,
      intl: { formatMessage },
    } = this.props;

    const pending = this.state.pending || loginStatus === statusTypes.LOGGING_IN;
    const loggedIn = loginStatus === statusTypes.LOGGED_IN;

    return (
      <Box
        title={<FormattedMessage id="app.externalLogin.title" defaultMessage="Sign-in by External Authenticator" />}
        footer={
          <div className="text-center">
            <Button variant="success" onClick={this.onClick} disabled={pending || loggedIn}>
              {pending ? (
                <LoadingIcon gapRight={2} />
              ) : loggedIn ? (
                <SuccessIcon gapRight={2} />
              ) : (
                <LinkIcon gapRight={2} />
              )}
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
        <>
          <p>
            <FormattedMessage
              id="app.externalLogin.description"
              defaultMessage='Sign-in into ReCodEx using external authentication service "{name}". If you do not have an account in ReCodEx, it will attempt to create one. If you do have a local account, it will be associated with your external identity if both have the same e-mail address.'
              values={{ name }}
            />
          </p>
          {helpUrl && (
            <p>
              <FormattedMessage
                id="app.externalLogin.help"
                defaultMessage="In case of any problems, <a>contact the support</a>."
                values={{
                  a: contents => (
                    <a href={helpUrl}>
                      {Array.isArray(contents)
                        ? contents.map((c, i) => <React.Fragment key={i}>{c}</React.Fragment>)
                        : contents}
                    </a>
                  ),
                }}
              />
            </p>
          )}

          {shortSessionConfig && shortSessionConfig > 0 && (
            <NiceCheckbox name="external.short" checked={this.state.short} onChange={this.setShort}>
              <FormattedMessage id="app.loginForm.short" defaultMessage="Short session" /> ({shortSessionConfig} min)
              <Explanation id="loginForm.shortSession">
                <FormattedMessage
                  id="app.loginForm.short.explanation"
                  defaultMessage="Use short session on public computers to reduce the risk of unauthorized access to your account (if you forget to log out)."
                />
              </Explanation>
            </NiceCheckbox>
          )}

          {!pending && (loginStatus === statusTypes.LOGIN_FAILED || this.state.lastError) && (
            <Callout variant="danger" className="mt-3">
              {loginError || this.state.lastError ? (
                getErrorMessage(formatMessage)(loginError || this.state.lastError)
              ) : (
                <FormattedMessage id="app.externalLogin.failed" defaultMessage="External authentication failed." />
              )}
            </Callout>
          )}
        </>
      </Box>
    );
  }
}

ExternalLoginBox.propTypes = {
  name: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  service: PropTypes.string.isRequired,
  helpUrl: PropTypes.string,
  shortSessionConfig: PropTypes.number,
  loginStatus: PropTypes.string,
  loginError: PropTypes.object,
  login: PropTypes.func.isRequired,
  fail: PropTypes.func.isRequired,
  afterLogin: PropTypes.func.isRequired,
  intl: PropTypes.object,
};

export default connect(
  (state, { service }) => ({
    loginStatus: statusSelector(service)(state),
    loginError: loginErrorSelector(state, service),
  }),
  (dispatch, { service, afterLogin = null }) => ({
    login: (token, expiration, popupWindow, errorHandler = null) => {
      const promise = dispatch(externalLogin(service, token, expiration, popupWindow));
      return (afterLogin ? promise.then(afterLogin) : promise).catch(e => errorHandler && errorHandler(e));
    },
    fail: () => dispatch(externalLoginFailed(service)),
  })
)(injectIntl(ExternalLoginBox));
