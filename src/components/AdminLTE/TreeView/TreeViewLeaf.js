import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from 'react-fontawesome';
import { LoadingIcon } from '../../Icons';
import LevelGap from './LevelGap';

const TreeViewLeaf = ({
  loading = false,
  title,
  icon = 'square-o',
  onClick,
  level,
  actions
}) => (
  <li
    onClick={onClick}
    style={{
      cursor: onClick ? 'pointer' : undefined,
      padding: '15px 10px'
    }}>
    <LevelGap level={level} />
    <span style={{ width: 30, textAlign: 'center', display: 'inline-block' }}>
      {loading ? <LoadingIcon /> : <Icon name={icon} />}
    </span>
    {title}
    <span className='pull-right'>
      {actions}
    </span>
  </li>
);

TreeViewLeaf.propTypes = {
  loading: PropTypes.bool,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,
  icon: PropTypes.string,
  onClick: PropTypes.func,
  level: PropTypes.number.isRequired,
  actions: PropTypes.element
};

export default TreeViewLeaf;
