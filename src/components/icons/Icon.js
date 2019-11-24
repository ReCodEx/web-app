import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classnames from 'classnames';
import style from './Icon.less';

const Icon = ({
  smallGapLeft = false,
  smallGapRight = false,
  gapLeft = false,
  gapRight = false,
  largeGapLeft = false,
  largeGapRight = false,
  timid = false,
  className = [],
  onClick,
  onDoubleClick,
  ...props
}) => {
  const passedClassNames = typeof className === 'string' ? { [className]: true } : className;
  return (
    <FontAwesomeIcon
      {...props}
      className={classnames({
        ...passedClassNames,
        [style.smallGapLeft]: smallGapLeft,
        [style.smallGapRight]: smallGapRight,
        [style.gapLeft]: gapLeft,
        [style.gapRight]: gapRight,
        [style.largeGapLeft]: largeGapLeft,
        [style.largeGapRight]: largeGapRight,
        timid: timid,
        clickable: Boolean(onClick || onDoubleClick),
      })}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    />
  );
};

Icon.propTypes = {
  className: PropTypes.any,
  smallGapLeft: PropTypes.bool,
  smallGapRight: PropTypes.bool,
  gapLeft: PropTypes.bool,
  gapRight: PropTypes.bool,
  largeGapLeft: PropTypes.bool,
  largeGapRight: PropTypes.bool,
  timid: PropTypes.bool,
  onClick: PropTypes.func,
  onDoubleClick: PropTypes.func,
};

export default Icon;
