import React from 'react';
import PropTypes from 'prop-types';
import BonusPoints from './BonusPoints.js';

const Points = ({ points, maxPoints, bonusPoints, wideFormat = false }) => (
  <span className="text-nowrap">
    {points}
    {bonusPoints !== 0 && <BonusPoints bonus={bonusPoints} />}
    {wideFormat ? ' / ' : '/'}
    {maxPoints}
  </span>
);

Points.propTypes = {
  points: PropTypes.number.isRequired,
  bonusPoints: PropTypes.number.isRequired,
  maxPoints: PropTypes.number.isRequired,
  wideFormat: PropTypes.bool,
};

export default Points;
