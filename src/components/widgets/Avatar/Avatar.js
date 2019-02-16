import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * Used on many places for displaying a round profile picture of a user.
 * LoadingAvatar and FailedAvatar are used to mock the visual appearance
 * of the avatar while the image is being downloaded or if the download
 * failed for some reason.
 */
const Avatar = ({ src, size = 45, title = 'avatar', altClassName = '' }) => (
  <img src={src} alt={title} width={size} className={classnames('img-circle', altClassName)} />
);

Avatar.propTypes = {
  src: PropTypes.string.isRequired,
  title: PropTypes.string,
  size: PropTypes.number,
  altClassName: PropTypes.string,
};

export default Avatar;
