import React from 'react';
import PropTypes from 'prop-types';

const GridLine = ({
  x = null,
  y = null,
  width,
  height,
  isMarker = false,
  strokeWidth = isMarker ? 0.3 : 0.1,
  markerColor = 'orange',
}) => {
  const strokeGradient = x === null ? 'gridlineHorizontal' : 'gridlineVertical';
  const boundingBoxCoordinates = { x1: 0, y1: isMarker ? -2 : -10, x2: width, y2: height + 7 };
  // the +- 0.001 is actually a hack to create non-zero bounding box, which is necessary for the gradients to work
  const lineCoordinates =
    x === null
      ? { y1: (1 - y) * height - 0.001, y2: (1 - y) * height + 0.001 } // y is automatically flipped (100% is at the top, 0% is at bottom)
      : { x1: x * width - 0.001, x2: x * width + 0.001 };
  return (
    <line
      {...boundingBoxCoordinates}
      {...lineCoordinates}
      stroke={isMarker ? markerColor : `url(#${strokeGradient})`}
      strokeWidth={strokeWidth}
      strokeDasharray="1"
      strokeLinecap="round"
    />
  );
};

GridLine.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  strokeWidth: PropTypes.number,
  isMarker: PropTypes.bool,
  markerColor: PropTypes.string,
};

export default GridLine;
