import React, { PropTypes } from 'react';
import { FormattedMessage, FormattedNumber, FormattedTime, FormattedDate } from 'react-intl';
import { Table } from 'react-bootstrap';
import Box from '../../AdminLTE/Box';
import DifficultyIcon from '../DifficultyIcon';

import UsersNameContainer from '../../../containers/UsersNameContainer';

const ExerciseDetail = ({
  id,
  name,
  authorId,
  difficulty,
  createdAt,
  updatedAt,
  version,
  localizedAssignments
}) => (
  <Box title={name} noPadding>
    <Table>
      <tbody>
        <tr>
          <th><FormattedMessage id='app.exercise.difficulty' defaultMessage='Difficulty:' /></th>
          <td><DifficultyIcon difficulty={difficulty} /></td>
        </tr>
        <tr>
          <th><FormattedMessage id='app.exercise.createdAt' defaultMessage='Created at:' /></th>
          <td><FormattedDate value={createdAt * 1000} /> <FormattedTime value={createdAt * 1000} /></td>
        </tr>
        <tr>
          <th><FormattedMessage id='app.exercise.updatedAt' defaultMessage='Last updateded at:' /></th>
          <td><FormattedDate value={createdAt * 1000} /> <FormattedTime value={createdAt * 1000} /></td>
        </tr>
        <tr>
          <th><FormattedMessage id='app.exercise.version' defaultMessage='Version:' /></th>
          <td><FormattedNumber value={version} /></td>
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
  createdAt: PropTypes.number.isRequired,
  updatedAt: PropTypes.number.isRequired,
  version: PropTypes.number.isRequired,
  localizedAssignments: PropTypes.array.isRequired
};

export default ExerciseDetail;
