import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import style from './Icon.less';

const Icon = ({
  gapLeft = false,
  gapRight = false,
  className = [],
  ...props
}) => {
  const passedClassNames =
    typeof className === 'string' ? { [className]: true } : className;
  return (
    <FontAwesomeIcon
      {...props}
      className={classNames({
        ...passedClassNames,
        [style.gapLeft]: gapLeft,
        [style.gapRight]: gapRight
      })}
    />
  );
};

Icon.propTypes = {
  className: PropTypes.any,
  gapLeft: PropTypes.bool,
  gapRight: PropTypes.bool
};

export default Icon;
