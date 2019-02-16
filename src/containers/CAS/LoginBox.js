import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import LoginButton from '../../components/buttons/CAS/LoginButton';
import Box from '../../components/widgets/Box';
import { externalLogin, externalLoginFailed, loginServices, statusTypes } from '../../redux/modules/auth';
import { statusSelector } from '../../redux/selectors/auth';

const LoginBox = ({ login, fail, status }) => (
  <Box
    title={<FormattedMessage id="app.cas.login.title" defaultMessage="Authenticate throught CAS UK" />}
    footer={
      <div className="text-center">
        <LoginButton onLogin={login} onFailed={fail} loginStatus={status} />
        {status === statusTypes.LOGIN_FAILED && (
          <p className="callout callout-danger em-margin-top">
            <FormattedMessage
              id="app.cas.login.failed"
              defaultMessage="Signing to ReCodEx using UK-CAS authentication process failed. This usually means that you either do not have an account in ReCodEx yet, the account is disabled, or binding between your account and CAS identity has not been created."
            />
          </p>
        )}
      </div>
    }>
    <FormattedMessage
      id="app.cas.login.description"
      defaultMessage="After you click on the button below, you will be redirected to CAS UK. After you are authenticated, the popup window will be closed and you will be logged into ReCodEx."
    />
  </Box>
);

LoginBox.propTypes = {
  login: PropTypes.func.isRequired,
  fail: PropTypes.func.isRequired,
  status: PropTypes.string,
};

export default connect(
  state => ({
    status: statusSelector(loginServices.external.CAS_UK_TICKET)(state),
  }),
  dispatch => ({
    fail: () => dispatch(externalLoginFailed(loginServices.external.CAS_UK_TICKET)),
    login: (ticket, clientUrl, popupWindow = null) => {
      const login = externalLogin(loginServices.external.CAS_UK_TICKET);
      return dispatch(login({ ticket, clientUrl }, popupWindow));
    },
  })
)(LoginBox);
