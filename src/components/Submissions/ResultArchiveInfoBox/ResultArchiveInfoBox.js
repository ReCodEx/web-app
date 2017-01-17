import React, { PropTypes } from 'react';
import Icon from 'react-fontawesome';

const ResultArchiveInfoBox = ({
  submissionId
}) => (
  <div className='info-box'>
    <span className='info-box-icon bg-yellow'>
      <Icon name='files-o' />
    </span>
    <div className='info-box-content'>
      <span className='info-box-text'>Result archive</span>
    </div>
  </div>
);

ResultArchiveInfoBox.propTypes = {
  submissionId: PropTypes.string.isRequired
};

export default ResultArchiveInfoBox;
