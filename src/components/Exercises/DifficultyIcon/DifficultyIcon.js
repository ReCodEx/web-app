import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from '../../icons';

const difficultyIcons = {
  easy: 'smile',
  medium: 'meh',
  hard: 'frown',
};

const difficultyClassNames = {
  easy: 'text-success',
  medium: 'text-warning',
  hard: 'text-danger',
};

const difficultyCaptions = {
  easy: <FormattedMessage id="app.exercises.difficultyIcon.easy" defaultMessage="Easy" />,
  medium: <FormattedMessage id="app.exercises.difficultyIcon.medium" defaultMessage="Medium" />,
  hard: <FormattedMessage id="app.exercises.difficultyIcon.hard" defaultMessage="Hard" />,
};

const DifficultyIcon = ({ difficulty }) => (
  <span className={difficultyClassNames[difficulty] || 'text-success'}>
    <Icon icon={['far', difficultyIcons[difficulty] || 'smile']} gapRight={1} />
    <small>
      {difficultyCaptions[difficulty] || (
        <FormattedMessage id="app.exercises.difficultyIcon.unknown" defaultMessage="Unknown" />
      )}
    </small>
  </span>
);

DifficultyIcon.propTypes = {
  difficulty: PropTypes.string.isRequired,
};

export default DifficultyIcon;
