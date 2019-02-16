import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from '../../icons';

const DifficultyIcon = ({ difficulty }) => {
  switch (difficulty) {
    case 'easy':
      return (
        <span className="text-success">
          <Icon icon={['far', 'smile']} gapRight />
          <FormattedMessage id="app.exercises.difficultyIcon.easy" defaultMessage="Easy" />
        </span>
      );

    case 'medium':
    case 'moderate':
      return (
        <span className="text-warning">
          <Icon icon={['far', 'meh']} gapRight />
          <FormattedMessage id="app.exercises.difficultyIcon.medium" defaultMessage="Medium" />
        </span>
      );

    case 'hard':
      return (
        <span className="text-danger">
          <Icon icon={['far', 'frown']} gapRight />
          <FormattedMessage id="app.exercises.difficultyIcon.hard" defaultMessage="Hard" />
        </span>
      );

    default:
      return null;
  }
};

DifficultyIcon.propTypes = {
  difficulty: PropTypes.string.isRequired,
};

export default DifficultyIcon;
