import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from 'react-fontawesome';
import { LoadingIcon } from '../../icons';
import LevelGap from './LevelGap';
import GroupsName from '../../../components/Groups/GroupsName';

const TreeViewLeaf = ({
  loading = false,
  title,
  admins,
  icon = 'square-o',
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
      {loading ? <LoadingIcon /> : <Icon name={icon} />}
    </span>
    {title}
    {admins &&
      admins.length > 0 &&
      <span>
        &nbsp;&nbsp; (<small>
          <em>
            {admins
              .map(a => a.name.firstName + ' ' + a.name.lastName)
              .join(', ')}
          </em>
        </small>)
      </span>}
    <span className="pull-right">{actions}</span>
  </li>;

TreeViewLeaf.propTypes = {
  loading: PropTypes.bool,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage, GroupsName]) })
  ]).isRequired,
  admins: PropTypes.array,
  icon: PropTypes.string,
  onClick: PropTypes.func,
  level: PropTypes.number.isRequired,
  actions: PropTypes.element
};

export default TreeViewLeaf;
