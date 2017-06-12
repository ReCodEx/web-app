import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from 'react-fontawesome';
import { LoadingIcon } from '../../icons';
import LevelGap from './LevelGap';

const TreeViewLeaf = ({
  loading = false,
  title,
  externalId,
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
    <LevelGap level={level} />
    <span style={{ width: 30, textAlign: 'center', display: 'inline-block' }}>
      {loading ? <LoadingIcon /> : <Icon name={icon} />}
    </span>
    {title}
    {externalId &&
      externalId !== '' &&
      <span>
        {' '}(
        <code>{externalId}</code>
        )
      </span>}
    <span className="pull-right">
      {actions}
    </span>
  </li>;

TreeViewLeaf.propTypes = {
  loading: PropTypes.bool,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,
  externalId: PropTypes.string,
  icon: PropTypes.string,
  onClick: PropTypes.func,
  level: PropTypes.number.isRequired,
  actions: PropTypes.element
};

export default TreeViewLeaf;
