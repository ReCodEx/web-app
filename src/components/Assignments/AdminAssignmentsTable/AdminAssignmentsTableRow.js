import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { FormattedDate, FormattedTime, FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { EditIcon, MaybePublicIcon } from '../../Icons';

const AdminAssignmentTableRow = ({
  id,
  isPublic,
  name,
  allowSecondDeadline,
  firstDeadline,
  secondDeadline
}, {
  links: {
    ASSIGNMENT_DETAIL_URI_FACTORY: detail,
    ASSIGNMENT_EDIT_URI_FACTORY: edit
  }
}) => (
  <tr>
    <td className='text-center'>
      <MaybePublicIcon id={id} isPublic={isPublic} />
    </td>
    <td>
      <Link to={detail(id)}>{name}</Link>
    </td>
    <td>
      <FormattedDate value={new Date(firstDeadline * 1000)} />{', '}
      <FormattedTime value={new Date(firstDeadline * 1000)} />
    </td>
    <td>
      {allowSecondDeadline
        ? (
          <span>
            <FormattedDate value={new Date(secondDeadline * 1000)} />{', '}
            <FormattedTime value={new Date(secondDeadline * 1000)} />
          </span>
        ) : <span>-</span>}
    </td>
    <td>
      <LinkContainer to={edit(id)}>
        <Button bsSize='xs'>
          <EditIcon /> <FormattedMessage id='app.adminAssignmentsTableRow.edit' defaultMessage='Edit' />
        </Button>
      </LinkContainer>
    </td>
  </tr>
);

AdminAssignmentTableRow.propTypes = {
  id: PropTypes.any.isRequired,
  isPublic: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  firstDeadline: PropTypes.number.isRequired,
  allowSecondDeadline: PropTypes.bool.isRequired,
  secondDeadline: PropTypes.number.isRequired,
  groupId: PropTypes.string
};

AdminAssignmentTableRow.contextTypes = {
  links: PropTypes.object
};

export default AdminAssignmentTableRow;
