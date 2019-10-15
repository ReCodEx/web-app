import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage, intlShape, injectIntl } from 'react-intl';
import { Alert, FormControl, ControlLabel, Well } from 'react-bootstrap';

import Box from '../../widgets/Box';
import AuthenticationButtonContainer from '../../../containers/CAS/AuthenticationButtonContainer';
import { safeGet } from '../../../helpers/common';
import { getConfigVar } from '../../../helpers/config';
import { getErrorMessage } from '../../../locales/apiErrorMessages';

const casHelpdeskUrl = getConfigVar('CAS_HELPDESK_URL');

class RegistrationCAS extends Component {
  state = { instanceId: null, lastError: null };

  changeInstance = ev => {
    this.setState({ instanceId: ev.target.value });
  };

  ticketObtainedHandler = (ticket, clientUrl) => {
    const {
      instances,
      onSubmit,
      intl: { formatMessage },
    } = this.props;
    this.setState({ lastError: null });
    onSubmit({
      instanceId: this.state.instanceId || safeGet(instances, [0, 'id']),
      serviceId: 'cas-uk',
      clientUrl,
      ticket,
    }).catch(err =>
      err.json().then(body => this.setState({ lastError: getErrorMessage(formatMessage)(body && body.error) }))
    );
  };

  failedHandler = () => {
    this.setState({
      lastError: (
        <FormattedMessage
          id="app.externalRegistrationForm.uiFailure"
          defaultMessage="Unexpected UI failure. Communication between frontend and external registrator has been disrupted."
        />
      ),
    });
  };

  render() {
    const { instances } = this.props;
    return (
      <Box
        title={<FormattedMessage id="app.cas.registration.title" defaultMessage="Register Account Bound to CAS" />}
        footer={
          <div className="text-center">
            <AuthenticationButtonContainer
              retry={this.state.lastError !== null}
              onTicketObtained={this.ticketObtainedHandler}
              onFailed={this.failedHandler}
            />
          </div>
        }>
        <div>
          {this.state.lastError !== null && (
            <Alert bsStyle="danger">
              <p>{this.state.lastError}</p>
              {casHelpdeskUrl && casHelpdeskUrl.startsWith('mailto:') && (
                <p>
                  <FormattedHTMLMessage
                    id="app.externalRegistrationForm.failedHelpdeskMail"
                    defaultMessage=" If the problem prevails, please, contact the <a href='{casHelpdeskUrl}'>technical support</a>."
                    values={{ casHelpdeskUrl }}
                  />
                </p>
              )}
              {casHelpdeskUrl && !casHelpdeskUrl.startsWith('mailto:') && (
                <p>
                  <FormattedHTMLMessage
                    id="app.externalRegistrationForm.failedHelpdeskPage"
                    defaultMessage=" If the problem prevails, please, visit the <a href='{casHelpdeskUrl}'>help page</a>."
                    values={{ casHelpdeskUrl }}
                  />
                </p>
              )}
            </Alert>
          )}

          <Well>
            <FormattedMessage
              id="app.cas.registration.description"
              defaultMessage="Created account will be bound to external identifier provided by UK CAS. Such account may use both external CAS authentication or locally created credentials. Furthermore, accounts bound to CAS may use additional features provided by SIS bindings."
            />
          </Well>
          {/* We are NOT creating a redux-form here, so we build FormControl manually (instead of using SelectField). */}
          <ControlLabel>
            <FormattedMessage id="app.externalRegistrationForm.instance" defaultMessage="Instance:" />
          </ControlLabel>
          <FormControl componentClass="select" bsClass="form-control full-width" onChange={this.changeInstance}>
            {instances.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </FormControl>
        </div>
      </Box>
    );
  }
}

RegistrationCAS.propTypes = {
  instances: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  intl: intlShape,
};

export default injectIntl(RegistrationCAS);
