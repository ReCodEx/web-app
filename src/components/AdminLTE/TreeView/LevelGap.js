import React, { PropTypes } from 'react';

const LevelGap = ({ level = 0 }) => (
  <span style={{
    width: level * 20,
    display: 'inline-block'
  }} />
);

LevelGap.propTypes = {
  level: PropTypes.number
};

export default LevelGap;
