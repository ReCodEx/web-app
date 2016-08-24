import React, { PropTypes } from 'react';
import BonusPoints from './BonusPoints';

const Points = ({
  points,
  maxPoints,
  bonusPoints
}) => (
  <span>
    {points}{bonusPoints && <BonusPoints bonus={bonusPoints} />}{'/'}{maxPoints}
  </span>
);

Points.propTypes = {
  points: PropTypes.number.isRequired,
  bonusPoints: PropTypes.number,
  maxPoints: PropTypes.number.isRequired
};

export default Points;
