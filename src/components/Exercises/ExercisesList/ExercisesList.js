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

ExercisesList.propTypes = {
  exercises: PropTypes.array,
  createActions: PropTypes.func
};

export default ExercisesList;
