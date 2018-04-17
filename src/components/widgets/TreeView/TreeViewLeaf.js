import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

import Icon, { LoadingIcon, GroupIcon } from '../../icons';
import LevelGap from './LevelGap';
import GroupsName from '../../../components/Groups/GroupsName';
import UsersNameContainer from '../../../containers/UsersNameContainer';

const TreeViewLeaf = ({
  id,
  loading = false,
  title,
  admins,
  organizational,
  isPublic,
  icon = ['far', 'square'],
  onClick,
  level,
  actions
}) =>
  <li
    onClick={onClick}
    style={{
      cursor: onClick ? 'pointer' : undefined,
      padding: '15px 10px'
    }}
  >
    <LevelGap level={level - 1} /> {/* root group is not displayed */}
    <span style={{ width: 30, textAlign: 'center', display: 'inline-block' }}>
      {loading ? <LoadingIcon gapRight /> : <Icon icon={icon} gapRight />}
    </span>
    {title}
    {admins &&
      admins.length > 0 &&
      <span>
        &nbsp;&nbsp; (<small>
          <em>
            {admins.map(a =>
              <UsersNameContainer key={a} userId={a} isSimple />
            )}
          </em>
        </small>)
      </span>}
    {organizational &&
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id={`${id}-organizational-tooltip`}>
            <FormattedMessage
              id="app.groupTree.treeViewLeaf.organizationalTooltip"
              defaultMessage="The group is organizational (it does not have any students or assignments)"
            />
          </Tooltip>
        }
      >
        <GroupIcon
          organizational={true}
          className="text-muted"
          style={{ marginLeft: '0.5em' }}
        />
      </OverlayTrigger>}
    {isPublic &&
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id={`${id}-public-tooltip`}>
            <FormattedMessage
              id="app.groupTree.treeViewLeaf.publicTooltip"
              defaultMessage="The group is public"
            />
          </Tooltip>
        }
      >
        <FontAwesomeIcon
          icon="eye"
          className="text-muted"
          style={{ marginLeft: '0.5em' }}
        />
      </OverlayTrigger>}
    <span className="pull-right">{actions}</span>
  </li>;

TreeViewLeaf.propTypes = {
  id: PropTypes.string,
  loading: PropTypes.bool,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage, GroupsName]) })
  ]).isRequired,
  admins: PropTypes.array,
  organizational: PropTypes.bool,
  isPublic: PropTypes.bool,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  onClick: PropTypes.func,
  level: PropTypes.number.isRequired,
  actions: PropTypes.element
};

export default TreeViewLeaf;
