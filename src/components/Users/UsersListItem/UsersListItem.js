import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate, FormattedTime } from 'react-intl';

import UsersName from '../../../components/Users/UsersName';
import {
  LoadingIcon,
  SuperadminIcon,
  SupervisorAdminIcon,
  SupervisorIcon,
  SupervisorStudentIcon
} from '../../icons';
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
            <span>
              {user.privateData.role === 'superadmin' && <SuperadminIcon />}
              {user.privateData.role === 'supervisor-admin' &&
                <SupervisorAdminIcon />}
              {user.privateData.role === 'supervisor' && <SupervisorIcon />}
              {user.privateData.role === 'supervisor-student' &&
                <SupervisorStudentIcon />}
            </span>}
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
              <span>
                <FormattedDate
                  value={user.privateData.createdAt * 1000}
                />&nbsp;&nbsp;
                <FormattedTime value={user.privateData.createdAt * 1000} />
              </span>}
          </td>}

        {createActions &&
          <td className="text-right">
            {createActions(user.id)}
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
          <FormattedMessage id="generic.loading" defaultMessage="Loading ..." />
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
