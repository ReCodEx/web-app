import React, { Component, PropTypes } from 'react';
import Icon from 'react-fontawesome';
import FormBox from '../../components/FormBox';
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
                          ? <span><Icon name='check' /> &nbsp; Přihlášení proběhlo úspěšně</span>
                          : 'Přihlásit se'
                        : <span><Icon name='circle-o-notch' spin /> &nbsp; Probíhá přihlašování</span>

    return (
      <FormBox
        title='Zadejte své přihlašovací údaje'
        type={type}
        footer={
          <div className='text-center'>
            <Button
              type='submit'
              bsStyle={hasFailed ? 'default' : 'success'}
              className='btn-flat'
              disabled={isTryingToLogin || isEmpty || hasFailed || hasSucceeded}
              onClick={this.tryLogin}>
              {btnContent}
            </Button>
          </div>
        }>
          <span>
            {hasFailed && <Alert bsStyle='danger'>Přihlášení se nezdařilo, zkontrolujte si své přihlašovací údaje.</Alert>}
            <FormGroup controlId="loginEmail" validationState={hasFailed === true ? 'error' : undefined}>
              <ControlLabel>Emailová adresa</ControlLabel>
              <FormControl type='email' onChange={e => this.changeLogin(e.target.value)} name='email' disabled={isTryingToLogin || hasSucceeded} />
            </FormGroup>
            <FormGroup controlId="loginPwd" validationState={hasFailed === true ? 'error' : undefined}>
              <ControlLabel>Heslo</ControlLabel>
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
