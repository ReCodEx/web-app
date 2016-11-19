import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';
import Box from '../../AdminLTE/Box';
import DifficultyIcon from '../DifficultyIcon';

import UsersNameContainer from '../../../containers/UsersNameContainer';

const ExerciseDetail = ({
  id,
  name,
  authorId,
  difficulty,
  localizedAssignments
}) => (
  <Box title={name} noPaddding>
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
);

ExerciseDetail.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  authorId: PropTypes.string.isRequired,
  difficulty: PropTypes.string.isRequired,
  localizedAssignments: PropTypes.array.isRequired
};

export default ExerciseDetail;
