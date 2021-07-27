import React from 'react';
import PropTypes from 'prop-types';

const PointsLine = ({ x1 = null, x2 = null, y, y2 = y, width, height, color, strokeWidth = 1, markers = true }) => {
  const stroke = x1 === null ? 'url(#lineInGradient)' : x2 === null ? 'url(#lineOutGradient)' : color;
  // the +- 0.001 is actually a hack to create non-zero bounding box, which is necessary for the gradients to work
  const coordinates = {
    x1: x1 ? x1 * width : 0,
    x2: x2 ? x2 * width : width,
    // y is automatically flipped (100% is at the top, 0% is at bottom)
    y1: (1 - y) * height - 0.001,
    y2: (1 - y2) * height + 0.001,
  };
  return (
    <>
      <line {...coordinates} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      {x1 !== null && markers && (
        <>
          <circle cx={coordinates.x1} cy={coordinates.y1} r="2" stroke={color} fill="white" />
          <circle cx={coordinates.x1} cy={coordinates.y1} r="1" fill={color} />
        </>
      )}
      {x2 !== null && markers && <circle cx={coordinates.x2} cy={coordinates.y2} r="1.5" stroke={color} fill="white" />}
    </>
  );
};

PointsLine.propTypes = {
  x1: PropTypes.number,
  x2: PropTypes.number,
  y: PropTypes.number,
  y2: PropTypes.number,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  color: PropTypes.string,
  strokeWidth: PropTypes.number,
  markers: PropTypes.bool,
};

export default PointsLine;
