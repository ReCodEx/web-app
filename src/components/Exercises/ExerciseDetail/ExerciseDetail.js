import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import ReactMarkdown from 'react-markdown';
import { Table } from 'react-bootstrap';
import UsersList from '../../Users/UsersList';
import Box from '../../AdminLTE/Box';
import DifficultyIcon from '../DifficultyIcon';

import UsersNameContainer from '../../../containers/UsersNameContainer';
import { isReady, isLoading, hasFailed } from '../../../redux/helpers/resourceManager';

const ExerciseDetail = ({
  name,
  description,
  assignment,
  authorId,
  difficulty
}) => (
  <div>
    <Box title={name}>
      <Table>
        <tbody>
          <tr>
            <th><FormattedMessage id='app.exercise.difficulty' defaultMessage='Difficulty' /></th>
            <td><DifficultyIcon difficulty={difficulty} /></td>
          </tr>
          <tr>
            <th><FormattedMessage id='app.exercise.author' defaultMessage='Author:' /></th>
            <td><UsersNameContainer userId={authorId} /></td>
          </tr>
        </tbody>
      </Table>
    </Box>
    <Box title={<FormattedMessage id='app.exercise.detailTitle' defaultMessage='Exercise description' />}>
      <ReactMarkdown source={description} />
    </Box>
    <Box title={<FormattedMessage id='app.exercise.assignment' defaultMessage='Assignmnent' />}>
      <ReactMarkdown source={assignment} />
    </Box>
  </div>
);

ExerciseDetail.propTypes = {
  id: PropTypes.string.isRequired,
  authorId: PropTypes.string.isRequired,
  difficulty: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  assignment: PropTypes.string.isRequired
};

export default ExerciseDetail;
