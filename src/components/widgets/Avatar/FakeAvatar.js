import React from 'react';
import PropTypes from 'prop-types';

const getSize = (size, borderWidth, small) => (small ? size * (2 / 3) : size) - 2 * borderWidth;

const FakeAvatar = ({ size = 45, borderWidth = 2, light = false, children, small = false, altClassName = '' }) => (
  <span
    style={{
      display: 'inline-block',
      background: !light ? '#286090' : 'white',
      color: !light ? 'white' : 'gray',
      textAlign: 'center',
      width: getSize(size, borderWidth, small),
      height: getSize(size, borderWidth, small),
      lineHeight: `${getSize(size, borderWidth, small) - 2 * borderWidth}px`,
      borderStyle: 'solid',
      borderWidth,
      borderColor: !light ? 'transparent' : 'gray',
      borderRadius: Math.floor(getSize(size, borderWidth, small) / 2),
      fontSize: Math.floor(Math.max(10, getSize(size, borderWidth, small) / 2)),
      fontWeight: 'bolder',
    }}
    className={altClassName}>
    {children}
  </span>
);

FakeAvatar.propTypes = {
  size: PropTypes.number,
  borderWidth: PropTypes.number,
  light: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  small: PropTypes.bool,
  altClassName: PropTypes.string,
};

export default FakeAvatar;
