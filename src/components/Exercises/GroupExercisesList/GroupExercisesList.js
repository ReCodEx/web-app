import React from 'react';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import ImmutablePropTypes from 'react-immutable-proptypes';

import GroupExercisesListItem from '../GroupExercisesListItem';
import ResourceRenderer from '../../helpers/ResourceRenderer';

const GroupExercisesList = ({ exercises, ...rest }) =>
  <ResourceRenderer resource={exercises.toArray()}>
    {(...exercises) =>
      <Table>
        <thead>
          <tr>
            <th />
            <th>
              <FormattedMessage
                id="app.groupExercisesList.name"
                defaultMessage="Name"
              />
            </th>
            <th>
              <FormattedMessage
                id="app.groupExercisesList.author"
                defaultMessage="Author"
              />
            </th>
            <th>
              <FormattedMessage
                id="app.groupExercisesList.difficulty"
                defaultMessage="Difficulty"
              />
            </th>
            <th>
              <FormattedMessage
                id="app.groupExercisesList.actions"
                defaultMessage="Actions"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {exercises
            .sort(
              (a, b) =>
                a.name < b.name
                  ? -1
                  : b.name < a.name ? 1 : b.createdAt - a.createdAt
            )
            .map(exercise =>
              <GroupExercisesListItem {...exercise} key={exercise.id} />
            )}

          {exercises.length === 0 &&
            <tr>
              <td className="text-center" colSpan={4}>
                <FormattedMessage
                  id="app.groupExercisesList.empty"
                  defaultMessage="There are no exercises in this list."
                />
              </td>
            </tr>}
        </tbody>
      </Table>}
  </ResourceRenderer>;

GroupExercisesList.propTypes = {
  exercises: ImmutablePropTypes.map.isRequired
};

export default GroupExercisesList;
