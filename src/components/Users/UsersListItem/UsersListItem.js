import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import UsersName from '../../../components/Users/UsersName';
import { LoadingIcon } from '../../icons';

const UsersListItem = ({
  user,
  createActions,
  loggedUserId = '',
  useGravatar = false
}) =>
  user
    ? <tr>
        <td>
          <UsersName
            {...user}
            useGravatar={useGravatar}
            currentUserId={loggedUserId}
            showEmail="full"
          />
        </td>
        {createActions &&
          <td className="text-right">
            {createActions(user.id)}
          </td>}
      </tr>
    : <tr>
        <td colSpan={createActions ? 2 : 1}>
          <LoadingIcon gapRight />
          <FormattedMessage id="generic.loading" defaultMessage="Loading ..." />
        </td>
      </tr>;

UsersListItem.propTypes = {
  user: PropTypes.object,
  createActions: PropTypes.func,
  loggedUserId: PropTypes.string,
  useGravatar: PropTypes.bool
};

export default UsersListItem;
