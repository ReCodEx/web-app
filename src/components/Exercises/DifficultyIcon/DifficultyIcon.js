import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from 'react-fontawesome';

const DifficultyIcon = ({
  difficulty
}) => {
  switch (difficulty) {
    case 'easy':
      return (
        <span className="text-success">
          <Icon name="smile-o" /> <FormattedMessage id="app.exercises.difficultyIcon.easy" defaultMessage="Easy" />
        </span>
      );

    case 'medium':
    case 'moderate':
      return (
        <span className="text-warning">
          <Icon name="meh-o" /> <FormattedMessage id="app.exercises.difficultyIcon.medium" defaultMessage="Medium" />
        </span>
      );

    case 'hard':
      return (
        <span className="text-danger">
          <Icon name="frown-o" /> <FormattedMessage id="app.exercises.difficultyIcon.hard" defaultMessage="Hard" />
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
