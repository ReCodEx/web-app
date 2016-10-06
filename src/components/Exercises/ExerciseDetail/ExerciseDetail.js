import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import ReactMarkdown from 'react-markdown';
import UsersList from '../../Users/UsersList';
import Box from '../../AdminLTE/Box';
import GroupTree from '../../Groups/GroupTree';
import DifficultyIcon from '../DifficultyIcon';

import { isReady, isLoading, hasFailed } from '../../../redux/helpers/resourceManager';

const ExerciseDetail = ({
  description,
  difficulty
}) => (
  <div>
    <Box title={<FormattedMessage id='app.exercise.detailTitle' defaultMessage='Exercise description' />}>
      <p>
        <DifficultyIcon difficulty={difficulty} />
      </p>
      <ReactMarkdown source={description} />
    </Box>
    <Box title={<FormattedMessage id='app.exercise.detailTitle' defaultMessage='Exercise description' />}>
      <p>
        <DifficultyIcon difficulty={difficulty} />
      </p>
      <ReactMarkdown source={description} />
    </Box>
  </div>
);

ExerciseDetail.propTypes = {
  description: PropTypes.string.isRequired,
  topLevelGroups: PropTypes.array.isRequired,
  groups: ImmutablePropTypes.map.isRequired
};

export default ExerciseDetail;
