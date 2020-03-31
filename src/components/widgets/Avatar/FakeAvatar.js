import React from 'react';
import PropTypes from 'prop-types';
import { Image } from 'react-bootstrap';
import { URL_PATH_PREFIX } from '../../../helpers/config';

const getSize = (size, borderWidth, small) => (small ? size * (2 / 3) : size) - 2 * borderWidth;

const FakeAvatar = ({ size = 45, borderWidth = 0, light = false, children, small = false, altClassName = '' }) => (
  <span
    style={{
      display: 'inline-block',
      textAlign: 'center',
      width: getSize(size, borderWidth, small),
      height: getSize(size, borderWidth, small),
      lineHeight: `${getSize(size, borderWidth, small) - 2 * borderWidth}px`,
      fontSize: Math.floor(Math.max(10, getSize(size, borderWidth, small) / 2)),
      fontWeight: 'bolder',
    }}
    className={altClassName}>
    <Image
      src={`${URL_PATH_PREFIX}/public/avatar.png`}
      width={getSize(size, borderWidth, small)}
      height={getSize(size, borderWidth, small)}
    />
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
