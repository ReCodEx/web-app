import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import UsersName from '../../../components/Users/UsersName';
import DateTime from '../../widgets/DateTime';
import { LoadingIcon } from '../../icons';
import { UserRoleIcon } from '../../helpers/usersRoles.js';
import { safeGet } from '../../../helpers/common.js';

const createEmailLink = user => {
  const email = safeGet(user, ['privateData', 'email']);
  const urlEncoded = encodeURIComponent(email);
  return <a href={`mailto:${urlEncoded}`}>{email}</a>;
};

const UsersListItem = ({ user, emailColumn = false, createdAtColumn = false, createActions, loggedUserId = '' }) =>
  user ? (
    <tr>
      <td>
        {user.privateData && <UserRoleIcon showTooltip tooltipId={`role-${user.id}`} role={user.privateData.role} />}
      </td>
      <td>
        <UsersName
          {...user}
          currentUserId={loggedUserId}
          showEmail={emailColumn ? null : 'full'}
          showExternalIdentifiers
          link
          listItem
        />
      </td>

      {emailColumn && <td>{createEmailLink(user)}</td>}

      {createdAtColumn && (
        <td>
          {user.privateData && user.privateData.createdAt && (
            <span className="small">
              <DateTime
                unixts={user.privateData.createdAt}
                showTime={false}
                showOverlay
                overlayTooltipId={`createdat-${user.id}`}
              />
            </span>
          )}
        </td>
      )}

      {createActions && <td className="text-end">{createActions(user)}</td>}
    </tr>
  ) : (
    <tr>
      <td colSpan={(createActions ? 2 : 1) + Number(emailColumn) + Number(createdAtColumn)}>
        <LoadingIcon gapRight={2} />
        <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
      </td>
    </tr>
  );

UsersListItem.propTypes = {
  user: PropTypes.object,
  emailColumn: PropTypes.bool,
  createdAtColumn: PropTypes.bool,
  createActions: PropTypes.func,
  loggedUserId: PropTypes.string,
};

export default UsersListItem;
