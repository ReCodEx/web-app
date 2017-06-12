import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { FormattedDate, FormattedTime, FormattedMessage } from 'react-intl';
import { ButtonGroup } from 'react-bootstrap';
import Button from '../../widgets/FlatButton';
import { LinkContainer } from 'react-router-bootstrap';
import DeleteAssignmentButtonContainer from '../../../containers/DeleteAssignmentButtonContainer';

import withLinks from '../../../hoc/withLinks';
import {
  EditIcon,
  MaybePublicIcon,
  MaybeBonusAssignmentIcon
} from '../../icons';

const AdminAssignmentTableRow = ({
  id,
  isPublic,
  name,
  allowSecondDeadline,
  firstDeadline,
  secondDeadline,
  isBonus,
  links: {
    ASSIGNMENT_DETAIL_URI_FACTORY: detail,
    ASSIGNMENT_EDIT_URI_FACTORY: edit
  }
}) =>
  <tr>
    <td className="text-center">
      <MaybePublicIcon id={id} isPublic={isPublic} />
    </td>
    <td>
      <MaybeBonusAssignmentIcon id={id} isBonus={isBonus} />
      <Link to={detail(id)}>{name}</Link>
    </td>
    <td>
      <FormattedDate value={new Date(firstDeadline * 1000)} />{', '}
      <FormattedTime value={new Date(firstDeadline * 1000)} />
    </td>
    <td>
      {allowSecondDeadline
        ? <span>
            <FormattedDate value={new Date(secondDeadline * 1000)} />{', '}
            <FormattedTime value={new Date(secondDeadline * 1000)} />
          </span>
        : <span>-</span>}
    </td>
    <td>
      <ButtonGroup>
        <LinkContainer to={edit(id)}>
          <Button bsSize="xs">
            <EditIcon />
            {' '}
            <FormattedMessage
              id="app.adminAssignmentsTableRow.edit"
              defaultMessage="Edit"
            />
          </Button>
        </LinkContainer>
        <DeleteAssignmentButtonContainer id={id} bsSize="xs" />
      </ButtonGroup>
    </td>
  </tr>;

AdminAssignmentTableRow.propTypes = {
  id: PropTypes.any.isRequired,
  isPublic: PropTypes.bool.isRequired,
  isBonus: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  firstDeadline: PropTypes.number.isRequired,
  allowSecondDeadline: PropTypes.bool.isRequired,
  secondDeadline: PropTypes.number.isRequired,
  groupId: PropTypes.string,
  links: PropTypes.object
};

export default withLinks(AdminAssignmentTableRow);
