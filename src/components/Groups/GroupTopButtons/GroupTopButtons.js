import React from 'react';
import PropTypes from 'prop-types';
import { LinkContainer } from 'react-router-bootstrap';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import LeaveJoinGroupButtonContainer from '../../../containers/LeaveJoinGroupButtonContainer';
import { GroupIcon, EditIcon, InfoIcon } from '../../icons';
import withLinks from '../../../helpers/withLinks';

const GroupTopButtons = ({
  group,
  userId,
  canEdit,
  canLeaveJoin,
  links: {
    GROUP_EDIT_URI_FACTORY,
    GROUP_DETAIL_URI_FACTORY,
    GROUP_INFO_URI_FACTORY
  }
}) =>
  <p>
    {canEdit &&
      <LinkContainer to={GROUP_EDIT_URI_FACTORY(group.id)}>
        <Button bsStyle="warning">
          <EditIcon />{' '}
          <FormattedMessage
            id="app.editGroup.title"
            defaultMessage="Edit Group"
          />
        </Button>
      </LinkContainer>}
    <LinkContainer to={GROUP_INFO_URI_FACTORY(group.id)}>
      <Button bsStyle="primary">
        <InfoIcon />{' '}
        <FormattedMessage id="app.group.info" defaultMessage="Group Info" />
      </Button>
    </LinkContainer>
    {!group.organizational &&
      <LinkContainer to={GROUP_DETAIL_URI_FACTORY(group.id)}>
        <Button bsStyle="primary">
          <GroupIcon />{' '}
          <FormattedMessage
            id="app.group.detailButton"
            defaultMessage="Group Detail"
          />
        </Button>
      </LinkContainer>}
    {canLeaveJoin &&
      <LeaveJoinGroupButtonContainer
        userId={userId}
        groupId={group.id}
        bsSize="normal"
      />}
  </p>;

GroupTopButtons.propTypes = {
  group: PropTypes.object.isRequired,
  userId: PropTypes.string.isRequired,
  canEdit: PropTypes.bool.isRequired,
  canLeaveJoin: PropTypes.bool,
  links: PropTypes.object
};

export default withLinks(GroupTopButtons);
