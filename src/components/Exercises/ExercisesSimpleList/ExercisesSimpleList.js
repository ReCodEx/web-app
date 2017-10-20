import React from 'react';
import { Table } from 'react-bootstrap';
import { injectIntl, FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import GroupExercisesListItem from '../ExercisesSimpleListItem';

const ExercisesSimpleList = ({ exercises, createActions, intl, ...rest }) =>
  <Table>
    <thead>
      <tr>
        <th>
          <FormattedMessage
            id="app.exercisesSimpleList.name"
            defaultMessage="Name"
          />
        </th>
        <th>
          <FormattedMessage
            id="app.exercisesSimpleListt.author"
            defaultMessage="Author"
          />
        </th>
        <th>
          <FormattedMessage
            id="app.exercisesSimpleList.difficulty"
            defaultMessage="Difficulty"
          />
        </th>
        {createActions && <th />}
      </tr>
    </thead>
    <tbody>
      {exercises
        .sort((a, b) => {
          var tmp = a.name.localeCompare(b.name, intl.locale);
          if (tmp === 0) {
            return b.createdAt - a.createdAt;
          } else {
            return tmp;
          }
        })
        .map(exercise =>
          <GroupExercisesListItem
            {...exercise}
            createActions={createActions}
            key={exercise.id}
          />
        )}

      {exercises.length === 0 &&
        <tr>
          <td className="text-center" colSpan={4}>
            <FormattedMessage
              id="app.exercisesSimpleList.empty"
              defaultMessage="There are no exercises in this list."
            />
          </td>
        </tr>}
    </tbody>
  </Table>;

ExercisesSimpleList.propTypes = {
  exercises: PropTypes.array.isRequired,
  createActions: PropTypes.func,
  intl: PropTypes.shape({ formatMessage: PropTypes.func.isRequired }).isRequired
};

export default injectIntl(ExercisesSimpleList);
