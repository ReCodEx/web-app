import React from 'react';
import { ListGroupItem } from 'react-bootstrap';
import { LoadingAvatar } from '../../widgets/Avatar';

const LoadingUsersListItem = () =>
  <ListGroupItem>
    <div className="pull-left image">
      <LoadingAvatar />
    </div>
    <div className="pull-left info">
      <p>Načítám...</p>
    </div>
  </ListGroupItem>;

export default LoadingUsersListItem;
