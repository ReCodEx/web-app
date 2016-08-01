import React, { PropTypes } from 'react';
import { ListGroupItem } from 'react-bootstrap';
import FakeGravatar from '../FakeGravatar';

const LoadingUsersListItem = () => (
  <ListGroupItem>
    <div className='pull-left image'>
      <FakeGravatar />
    </div>
    <div className='pull-left info'>
      <p>Načítám...</p>
    </div>
  </ListGroupItem>
);

export default LoadingUsersListItem;
