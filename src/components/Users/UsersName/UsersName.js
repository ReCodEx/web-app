import React, { PropTypes, cloneElement } from 'react';
import { Link } from 'react-router';
import Avatar from '../../AdminLTE/Avatar';

const UsersName = ({
  id,
  fullName,
  avatarUrl,
  size = 25
}, {
  links: { USER_URI_FACTORY }
}) => (
  <div>
    <div className='pull-left'>
      <Avatar size={size} src={avatarUrl} title={fullName} />
    </div>
    <div className='pull-left'>
      <p>
        <Link to={USER_URI_FACTORY(id)}>
          {fullName}
        </Link>
      </p>
    </div>
  </div>
);

UsersName.propTypes = {
  id: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string.isRequired
};

UsersName.contextTypes = {
  links: PropTypes.object
};

export default UsersName;
