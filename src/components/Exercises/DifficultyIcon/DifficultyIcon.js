import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

const DifficultyIcon = ({ difficulty }) => {
  switch (difficulty) {
    case 'easy':
      return (
        <span className="text-success">
          <FontAwesomeIcon icon={['far', 'smile']} />{' '}
          <FormattedMessage
            id="app.exercises.difficultyIcon.easy"
            defaultMessage="Easy"
          />
        </span>
      );

    case 'medium':
    case 'moderate':
      return (
        <span className="text-warning">
          <FontAwesomeIcon icon={['far', 'meh']} />{' '}
          <FormattedMessage
            id="app.exercises.difficultyIcon.medium"
            defaultMessage="Medium"
          />
        </span>
      );

    case 'hard':
      return (
        <span className="text-danger">
          <FontAwesomeIcon icon={['far', 'frown']} />{' '}
          <FormattedMessage
            id="app.exercises.difficultyIcon.hard"
            defaultMessage="Hard"
          />
        </span>
      );

    default:
      return null;
  }
};

DifficultyIcon.propTypes = {
  difficulty: PropTypes.string.isRequired
};

export default DifficultyIcon;
