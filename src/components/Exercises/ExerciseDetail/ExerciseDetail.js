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
  id,
  name,
  authorId,
  difficulty,
  localizedAssignments
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
  </div>
)

ExerciseDetail.propTypes = {
  id: PropTypes.string.isRequired,
  authorId: PropTypes.string.isRequired,
  difficulty: PropTypes.string.isRequired,
  localizedAssignments: PropTypes.array.isRequired
};

export default ExerciseDetail;
