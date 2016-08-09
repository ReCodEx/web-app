import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from 'react-fontawesome';
import FormBox from '../../AdminLTE/FormBox';
import {
  FormGroup,
  FormControl,
  ControlLabel,
  Button,
  Alert
} from 'react-bootstrap';

class LoginForm extends Component {

  state = { login: '', password: '', hasFailed: false };

  componentWillReceiveProps = newProps => {
    this.setState({ hasFailed: newProps.hasFailed === true });
  };

  changeLogin = login => {
    this.setState({ login, hasFailed: false });
  };

  changePassword = password => {
    this.setState({ password, hasFailed: false });
  };

  tryLogin = e => {
    e.preventDefault();
    const { tryLogin } = this.props;
    const { login, password } = this.state;
    tryLogin(login, password);
  };

  render() {
    const {
      isTryingToLogin = false,
      hasSucceeded = false
    } = this.props;

    const {
      hasFailed = false,
      login,
      password
    } = this.state;

    const isEmpty = login.length === 0 || password.length === 0;
    const type = hasFailed ? 'danger' : hasSucceeded ? 'success' : undefined;

    const btnContent = !isTryingToLogin
                        ? hasSucceeded
                          ? <span><Icon name='check' /> &nbsp; <FormattedMessage id='app.loginForm.success' defaultMessage='You are successfully signed in' /></span>
                          : <FormattedMessage id='app.loginForm.login' defaultMessage='Sign in' />
                        : <span><Icon name='circle-o-notch' spin /> &nbsp; <FormattedMessage id='app.loginForm.processing' defaultMessage='Signing in ...' /></span>;

    return (
      <FormBox
        title={<FormattedMessage id='app.loginForm.title' defaultMessage='Sign into ReCodEx' />}
        type={type}
        footer={
          <div className='text-center'>
            <Button
              type='submit'
              bsStyle={hasFailed ? 'default' : 'success'}
              className='btn-flat'
              disabled={isTryingToLogin || isEmpty || hasSucceeded}
              onClick={this.tryLogin}>
              {btnContent}
            </Button>
          </div>
        }>
          <span>
            {hasFailed && (
              <Alert bsStyle='danger'>
                <FormattedMessage id='app.loginForm.failed' defaultMessage='Login failed. Please check your credentials.' />
              </Alert>)}
            <FormGroup validationState={hasFailed === true ? 'error' : undefined}>
              <ControlLabel><FormattedMessage id='app.loginForm.email' defaultMessage='E-mail address:' /></ControlLabel>
              <FormControl type='email' onChange={e => this.changeLogin(e.target.value)} name='email' disabled={isTryingToLogin || hasSucceeded} />
            </FormGroup>
            <FormGroup validationState={hasFailed === true ? 'error' : undefined}>
              <ControlLabel><FormattedMessage id='app.loginForm.password' defaultMessage='Password:' /></ControlLabel>
              <FormControl type='password' onChange={e => this.changePassword(e.target.value)} name='password' disabled={isTryingToLogin || hasSucceeded} />
            </FormGroup>
          </span>
        </FormBox>
    );
  }
}

LoginForm.propTypes = {
  tryLogin: PropTypes.func.isRequired,
  isTryingLogin: PropTypes.bool,
  hasFailed: PropTypes.bool,
  hasSucceeded: PropTypes.bool
};

export default LoginForm;
