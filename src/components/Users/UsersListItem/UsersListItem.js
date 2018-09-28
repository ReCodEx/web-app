import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import UsersName from '../../../components/Users/UsersName';
import DateTime from '../../widgets/DateTime';
import { BanIcon, LoadingIcon } from '../../icons';
import { UserRoleIcon } from '../../helpers/usersRoles';
import { safeGet } from '../../../helpers/common';

const createEmailLink = user => {
  const email = safeGet(user, ['privateData', 'email']);
  const urlEncoded = encodeURIComponent(email);
  return (
    <a href={`mailto:${urlEncoded}`}>
      {email}
    </a>
  );
};

const UsersListItem = ({
  user,
  emailColumn = false,
  createdAtColumn = false,
  createActions,
  loggedUserId = '',
  useGravatar = false
}) =>
  user
    ? <tr>
        <td>
          {user.privateData &&
            <UserRoleIcon
              showTooltip
              tooltipId={`role-${user.id}`}
              role={user.privateData.role}
            />}
          {user.privateData &&
            !user.privateData.isAllowed &&
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id={`ban-${user.id}`}>
                  <FormattedMessage
                    id="app.userList.userDeactivated"
                    defaultMessage="The user account was deactivated. The user may not sign in."
                  />
                </Tooltip>
              }
            >
              <BanIcon gapLeft />
            </OverlayTrigger>}
        </td>
        <td>
          <UsersName
            {...user}
            useGravatar={useGravatar}
            currentUserId={loggedUserId}
            showEmail={emailColumn ? null : 'full'}
          />
        </td>

        {emailColumn &&
          <td>
            {createEmailLink(user)}
          </td>}

        {createdAtColumn &&
          <td>
            {user.privateData &&
              user.privateData.createdAt &&
              <span className="small">
                <DateTime
                  unixts={user.privateData.createdAt}
                  showTime={false}
                  showOverlay
                  overlayTooltipId={`createdat-${user.id}`}
                />
              </span>}
          </td>}

        {createActions &&
          <td className="text-right">
            {createActions(user)}
          </td>}
      </tr>
    : <tr>
        <td
          colSpan={
            (createActions ? 2 : 1) +
            Number(emailColumn) +
            Number(createdAtColumn)
          }
        >
          <LoadingIcon gapRight />
          <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
        </td>
      </tr>;

UsersListItem.propTypes = {
  user: PropTypes.object,
  emailColumn: PropTypes.bool,
  createdAtColumn: PropTypes.bool,
  createActions: PropTypes.func,
  loggedUserId: PropTypes.string,
  useGravatar: PropTypes.bool
};

export default UsersListItem;
