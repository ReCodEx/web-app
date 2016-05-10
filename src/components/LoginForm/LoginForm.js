import React, { Component, PropTypes } from 'react';
import Icon from 'react-fontawesome';
import FormBox from '../../components/FormBox/FormBox';
import {
  FormGroup,
  FormControl,
  ControlLabel,
  Button
} from 'react-bootstrap';

class LoginForm extends Component {

  state = { login: '', password: '' };

  changeLogin = (login) => {
    this.setState({ login });
  };

  changePassword = (password) => {
    this.setState({ password });
  };

  tryLogin = () => {
    const { tryLogin } = this.props;
    const { login, password } = this.state;
    tryLogin(login, password);
  };

  render() {
    const {
      isTryingLogin = false,
      hasFailed = false,
    } = this.props;

    return (
      <FormBox
        title='Zadejte své přihlašovací údaje'
        type={hasFailed ? 'danger' : undefined}
        body={
          <span>
            <FormGroup controlId="formControlsText">
              <ControlLabel>Emailová adresa</ControlLabel>
              <FormControl type='email' placeholder='' onChange={e => this.changeLogin(e.target.value)} />
            </FormGroup>
            <FormGroup controlId="formControlsEmail">
              <ControlLabel>Heslo</ControlLabel>
              <FormControl type='password' placeholder='' onChange={e => this.changePassword(e.target.value)} />
            </FormGroup>
          </span>
        }

        footer={
          <div className='text-center'>
            <Button
              bsStyle='success'
              className='btn-flat'
              disabled={isTryingLogin}
              onClick={this.tryLogin}>
              {!isTryingLogin
                ? 'Přihlásit se'
                : <span><Icon name='spinner' spin /> Probíhá přihlašování</span>}
            </Button>
          </div>
        } />
    );
  }
}

LoginForm.propTypes = {
  tryLogin: PropTypes.func.isRequired,
  isTryingLogin: PropTypes.bool,
  hasFailed: PropTypes.bool
};

export default LoginForm;
