import React, { PropTypes, Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Collapse from 'react-collapse';
import Icon from 'react-fontawesome';
import { LoadingIcon } from '../../Icons';
import { Link } from 'react-router';
import { Button, Nav, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import LevelGap from './LevelGap';

const TreeViewLeaf = ({
  loading = false,
  title,
  icon = 'circle-o',
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
