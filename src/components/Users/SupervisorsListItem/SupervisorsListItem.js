import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Label, ProgressBar, ListGroupItem, Clearfix } from 'react-bootstrap';
import Icon from 'react-fontawesome';
import { Link } from 'react-router';
import MakeRemoveSupervisorButtonContainer from '../../../containers/MakeRemoveSupervisorButtonContainer';

const SupervisorsListItem = ({
  isAdmin,
  id,
  fullName,
  avatarUrl,
  groupId
}, {
  links: { USER_URI_FACTORY }
}) => (
  <tr>
    <td className='text-center' width={80}>
      <img src={avatarUrl} className='img-circle' width={45} />
    </td>
    <td>
      <div><strong>{fullName}</strong></div>
      <small><Link to={USER_URI_FACTORY(id)}>{id}</Link></small>
    </td>
    {isAdmin && (
      <td width={150}>
        <MakeRemoveSupervisorButtonContainer userId={id} groupId={groupId} />
      </td>
    )}
  </tr>
);

SupervisorsListItem.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string.isRequired
};

SupervisorsListItem.contextTypes = {
  links: PropTypes.object
};

export default SupervisorsListItem;
