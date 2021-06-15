import React from 'react';
import { ListGroupItem } from 'react-bootstrap';
import { LoadingAvatar } from '../../widgets/Avatar';

const LoadingUsersListItem = () => (
  <ListGroupItem>
    <div className="float-left image">
      <LoadingAvatar />
    </div>
    <div className="float-left info">
      <p>Načítám...</p>
    </div>
  </ListGroupItem>
);

export default LoadingUsersListItem;
