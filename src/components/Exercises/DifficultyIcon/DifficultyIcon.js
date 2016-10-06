import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from 'react-fontawesome';

const DifficultyIcon = ({
  difficulty
}) => {
  switch (difficulty) {
    case 'easy':
      return (
        <span className='text-success'>
          <Icon name='smile-o' /> <FormattedMessage id='app.exercises.difficultyIcon.easy' defaultMessage='Easy' />
        </span>
      );

    case 'medium':
      return (
        <span className='text-warning'>
          <Icon name='meh-o' /> <FormattedMessage id='app.exercises.difficultyIcon.medium' defaultMessage='Medium' />
        </span>
      );

    case 'hard':
      return (
        <span className='text-danger'>
          <Icon name='frown-o' /> <FormattedMessage id='app.exercises.difficultyIcon.hard' defaultMessage='Hard' />
        </span>
      );

    default:
      break;
  }


};

DifficultyIcon.propTypes = {
  difficulty: PropTypes.string.isRequired
};

export default DifficultyIcon;
