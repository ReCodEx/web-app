import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';
import { connect } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import PageContent from '../../components/layout/PageContent';
import ChangePasswordForm from '../../components/forms/ChangePasswordForm';
import { AcceptIcon } from '../../components/icons';
import InsetPanel from '../../components/widgets/InsetPanel';
import DateTime from '../../components/widgets/DateTime';
import Callout from '../../components/widgets/Callout';

import { acceptInvitation } from '../../redux/modules/users.js';
import { decode, isTokenValid } from '../../redux/helpers/token';
import withLinks from '../../helpers/withLinks.js';

const AcceptInvitation = ({ acceptInvitation, links: { DASHBOARD_URI } }) => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const [acceptOperation, setAcceptOperation] = useState();

  const rawToken = search.substring(1);
  const token = decode(rawToken);
  const name = (token && token.usr) || [];
  if (name[3]) {
    name[2] = name[2] + ','; // separator for suffix titles
  }
  const isValid = token && isTokenValid(token);
  return (
    <PageContent
      icon={<AcceptIcon />}
      title={<FormattedMessage id="app.acceptInvitation.title" defaultMessage="Accept Invitation" />}>
      <>
        <InsetPanel>
          <FormattedMessage
            id="app.acceptInvitation.welcome"
            defaultMessage="Congratulations, you have been invited to ReCodEx! You can create a local account by completing the registration process below. Your profile information are already filled in and cannot be changed. You only need to set a password for your new account."
          />
        </InsetPanel>

        <h3>
          <FormattedMessage id="app.acceptInvitation.invitationDetails" defaultMessage="Invitation details" />
        </h3>
        {token ? (
          <Table bordered>
            <tbody>
              <tr>
                <th className="shrink-col text-nowrap">
                  <FormattedMessage id="app.inviteUserForm.emailAndLogin" defaultMessage="Email (and login name):" />
                </th>
                <td>
                  <code>{token.eml}</code>
                </td>
              </tr>

              <tr>
                <th className="shrink-col text-nowrap">
                  <FormattedMessage id="app.acceptInvitation.userName" defaultMessage="Invited person" />:
                </th>
                <td>{name.join(' ')}</td>
              </tr>

              <tr>
                <th className="shrink-col text-nowrap">
                  <FormattedMessage id="app.acceptInvitation.invitationCreated" defaultMessage="Invitation created" />:
                </th>
                <td>
                  <DateTime unixTs={token.iat} showRelative />
                </td>
              </tr>

              <tr>
                <th className="shrink-col text-nowrap">
                  <FormattedMessage id="app.acceptInvitation.expireAt" defaultMessage="Token will expire at" />:
                </th>
                <td>
                  <DateTime unixTs={token.exp} showRelative isDeadline={!isValid} />
                </td>
              </tr>
            </tbody>
          </Table>
        ) : (
          <Callout variant="danger">
            <FormattedMessage
              id="app.acceptInvitation.badInvalidToken"
              defaultMessage="The invitation token cannot be decoded! The link you used was probably corrupted."
            />
          </Callout>
        )}

        {isValid ? (
          <ChangePasswordForm
            onSubmit={({ password }) => {
              setAcceptOperation(null);
              acceptInvitation(password, rawToken).then(
                () => {
                  setAcceptOperation(true);
                  navigate(DASHBOARD_URI, { replace: true });
                },
                () => setAcceptOperation(false)
              );
            }}
            firstTime
            isChanging={acceptOperation === null}
            hasFailed={acceptOperation === false}
            hasSucceeded={acceptOperation === true}
          />
        ) : (
          token && (
            <Callout variant="warning">
              <FormattedMessage
                id="app.acceptInvitation.invalidToken"
                defaultMessage="The invitation token is not valid!"
              />
            </Callout>
          )
        )}
      </>
    </PageContent>
  );
};

AcceptInvitation.propTypes = {
  acceptInvitation: PropTypes.func.isRequired,
  links: PropTypes.object,
};

export default withLinks(
  connect(undefined, dispatch => ({
    acceptInvitation: (password, token) => dispatch(acceptInvitation(password, token)),
  }))(AcceptInvitation)
);
