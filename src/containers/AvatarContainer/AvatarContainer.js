import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { loggedInUserSelector } from '../../redux/selectors/users';
import Avatar, { LoadingAvatar, FailedAvatar, FakeAvatar } from '../../components/widgets/Avatar';
import { safeGet } from '../../helpers/common';

const AvatarContainer = ({ currentUser, avatarUrl, fullName, firstName, size = 45, ...props }) => (
  <ResourceRenderer
    loading={<LoadingAvatar size={size} />}
    failed={<FailedAvatar size={size} />}
    resource={currentUser}>
    {currentUser =>
      safeGet(currentUser, ['privateData', 'settings', 'useGravatar'], false) && avatarUrl !== null ? (
        <Avatar size={size} src={avatarUrl} title={fullName} {...props} />
      ) : (
        <FakeAvatar size={size} {...props}>
          {firstName[0]}
        </FakeAvatar>
      )
    }
  </ResourceRenderer>
);

AvatarContainer.propTypes = {
  currentUser: PropTypes.object.isRequired,
  avatarUrl: PropTypes.string,
  fullName: PropTypes.string.isRequired,
  firstName: PropTypes.string.isRequired,
  size: PropTypes.number,
};

export default connect(state => ({
  currentUser: loggedInUserSelector(state),
}))(AvatarContainer);
