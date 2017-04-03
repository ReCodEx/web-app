import React, { PropTypes } from 'react';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import ExercisesListItem from '../ExercisesListItem';

const ExercisesList = ({
  exercises = [],
  createActions,
  ...rest
}) => (
  <Table>
    <thead>
      <tr>
        <th></th>
        <th><FormattedMessage id='app.exercisesList.name' defaultMessage='Name' /></th>
        <th><FormattedMessage id='app.exercisesList.author' defaultMessage='Author' /></th>
        <th><FormattedMessage id='app.exercisesList.difficulty' defaultMessage='Difficulty' /></th>
        <th><FormattedMessage id='app.exercisesList.created' defaultMessage='Created' /></th>
      </tr>
    </thead>
    <tbody>
    {exercises
      .sort((a, b) => a.name < b.name ? -1 : b.name < a.name ? 1 : b.createdAt - a.createdAt)
      .map(exercise => (
        <ExercisesListItem {...exercise} createActions={createActions} key={exercise.id} />
      ))}

    {exercises.length === 0 && (
      <tr>
        <td className='text-center' colSpan={4}>
          <FormattedMessage id='app.exercisesList.empty' defaultMessage='There are no exercises in this list.' />
        </td>
      </tr>
    )}
    </tbody>
  </Table>
);

ExercisesList.propTypes = {
  exercises: PropTypes.array,
  createActions: PropTypes.func
};

export default ExercisesList;
