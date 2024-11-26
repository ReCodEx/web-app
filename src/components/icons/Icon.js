import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classnames from 'classnames';
import * as style from './Icon.less';

const Icon = ({
  gapLeft = -1,
  gapRight = -1,
  disabled = false,
  timid = false,
  className = [],
  onClick,
  onDoubleClick,
  tooltip = null,
  tooltipId = null,
  tooltipPlacement = 'right',
  ...props
}) => {
  const passedClassNames = typeof className === 'string' ? { [className]: true } : className;
  const gapLeftNum = typeof gapLeft === 'number' ? gapLeft : gapLeft ? 2 : -1;
  const gapRightNum = typeof gapRight === 'number' ? gapRight : gapRight ? 2 : -1;
  return tooltip ? (
    <OverlayTrigger placement={tooltipPlacement} overlay={<Tooltip id={tooltipId}>{tooltip}</Tooltip>}>
      <span
        className={classnames({
          [`ms-${gapLeftNum}`]: gapLeftNum >= 0 && gapLeftNum <= 5,
          [`me-${gapRightNum}`]: gapRightNum >= 0 && gapRightNum <= 5,
        })}>
        <FontAwesomeIcon
          {...props}
          className={classnames({
            ...passedClassNames,
            [style.disabled]: disabled,
            timid,
            clickable: Boolean(onClick || onDoubleClick),
          })}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
        />
      </span>
    </OverlayTrigger>
  ) : (
    <FontAwesomeIcon
      {...props}
      className={classnames({
        ...passedClassNames,
        [`ms-${gapLeftNum}`]: gapLeftNum >= 0 && gapLeftNum <= 5,
        [`me-${gapRightNum}`]: gapRightNum >= 0 && gapRightNum <= 5,
        [style.disabled]: disabled,
        timid,
        clickable: Boolean(onClick || onDoubleClick),
      })}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    />
  );
};

Icon.propTypes = {
  className: PropTypes.any,
  gapLeft: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  gapRight: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  disabled: PropTypes.bool,
  timid: PropTypes.bool,
  onClick: PropTypes.func,
  onDoubleClick: PropTypes.func,
  tooltip: PropTypes.any,
  tooltipId: PropTypes.string,
  tooltipPlacement: PropTypes.string,
};

export default Icon;
