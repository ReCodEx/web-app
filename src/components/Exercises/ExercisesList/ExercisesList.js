import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { injectIntl, FormattedMessage } from 'react-intl';

import ExercisesListItem from '../ExercisesListItem';

const ExercisesList = ({ exercises = [], createActions, intl, ...rest }) =>
  <Table hover>
    <thead>
      <tr>
        <th />
        <th>
          <FormattedMessage id="app.exercisesList.name" defaultMessage="Name" />
        </th>
        <th>
          <FormattedMessage
            id="app.exercisesList.author"
            defaultMessage="Author"
          />
        </th>
        <th>
          <FormattedMessage
            id="app.exercisesList.groups"
            defaultMessage="Groups"
          />
        </th>
        <th>
          <FormattedMessage
            id="app.exercisesList.difficulty"
            defaultMessage="Difficulty"
          />
        </th>
        <th>
          <FormattedMessage
            id="app.exercisesList.created"
            defaultMessage="Created"
          />
        </th>
      </tr>
    </thead>
    <tbody>
      {exercises
        .filter(e => e !== null)
        .sort(
          (a, b) =>
            a.name.localeCompare(b.name, intl.locale) ||
            b.createdAt - a.createdAt
        )
        .map(exercise =>
          <ExercisesListItem
            {...exercise}
            createActions={createActions}
            key={exercise.id}
          />
        )}

      {exercises.length === 0 &&
        <tr>
          <td className="text-center" colSpan={6}>
            <FormattedMessage
              id="app.exercisesList.empty"
              defaultMessage="There are no exercises in this list."
            />
          </td>
        </tr>}
    </tbody>
  </Table>;

ExercisesList.propTypes = {
  exercises: PropTypes.array,
  createActions: PropTypes.func,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(ExercisesList);
