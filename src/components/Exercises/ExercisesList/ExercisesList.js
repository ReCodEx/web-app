import React from 'react';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import ExercisesListItem, { LoadingExercisesListItem } from '../ExercisesListItem';

const ExercisesList = ({
  exercises = [],
  createActions,
  ...rest
}) => (
  <Table>
    <tbody>
    {exercises.map(user => (
      <ExercisesListItem {...user} createActions={createActions} key={user.id} />
    ))}

    {exercises.length === 0 && (
      <tr>
        <td className='text-center'>
          <FormattedMessage id='app.exercisesList.empty' defaultMessage='There are no exercises in this list.' />
        </td>
      </tr>
    )}
    </tbody>
  </Table>
);

export default ExercisesList;
