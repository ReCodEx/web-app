import React, { PropTypes } from 'react';
import Icon from 'react-fontawesome';
import prettyBytes from 'pretty-bytes';

const SourceCodeInfoBox = ({
  id,
  name,
  size,
  uploadedAt,
  onClick
}) => (
  <div className='info-box' onClick={onClick}>
    <span className='info-box-icon bg-yellow'>
      <Icon name='files-o' />
    </span>
    <div className='info-box-content'>
      <span className='info-box-text'>{name}</span>
      <span className='info-box-number'>{prettyBytes(size)}</span>
    </div>
  </div>
);

SourceCodeInfoBox.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  uploadedAt: PropTypes.string.isRequired,
  onClick: PropTypes.func
};

export default SourceCodeInfoBox;
