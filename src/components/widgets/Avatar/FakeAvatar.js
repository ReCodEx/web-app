import React from 'react';
import PropTypes from 'prop-types';

const getSize = (size, small) => (small ? size * (2 / 3) : size);

const FakeAvatar = ({
  size = 45,
  borderWidth = 2,
  light = false,
  children,
  small = false
}) =>
  <span
    style={{
      display: 'inline-block',
      background: !light ? 'black' : 'white',
      color: 'gray',
      textAlign: 'center',
      width: getSize(size, small),
      hidth: getSize(size, small),
      lineHeight: `${getSize(size, small) - 2 * borderWidth}px`,
      borderStyle: 'solid',
      borderWidth,
      borderColor: !light ? 'transparent' : 'gray',
      borderRadius: Math.ceil(getSize(size, small) / 2),
      fontSize: Math.floor(Math.min(14, getSize(size, small) / 2))
    }}
  >
    {children}
  </span>;

FakeAvatar.propTypes = {
  size: PropTypes.number,
  borderWidth: PropTypes.number,
  light: PropTypes.bool,
  children: PropTypes.element.isRequired,
  small: PropTypes.bool
};

export default FakeAvatar;
