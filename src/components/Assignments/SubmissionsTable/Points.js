import React from 'react';
import PropTypes from 'prop-types';
import BonusPoints from './BonusPoints';

const Points = ({ points, maxPoints, bonusPoints }) => (
  <span>
    {points}
    {bonusPoints !== 0 && <BonusPoints bonus={bonusPoints} />}
    {'/'}
    {maxPoints}
  </span>
);

Points.propTypes = {
  points: PropTypes.number.isRequired,
  bonusPoints: PropTypes.number.isRequired,
  maxPoints: PropTypes.number.isRequired
};

export default Points;
