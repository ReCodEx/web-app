import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { injectIntl, FormattedMessage } from 'react-intl';

import ExercisesListItem from '../ExercisesListItem';
import { getLocalizedName } from '../../../helpers/getLocalizedData';

const ExercisesList = ({
  exercises = [],
  createActions,
  intl: { locale },
  ...rest
}) =>
  <Table hover>
    <thead>
      <tr>
        <th>
          <FormattedMessage id="generic.name" defaultMessage="Name" />
        </th>
        <th>
          <FormattedMessage id="generic.author" defaultMessage="Author" />
        </th>
        <th>
          <FormattedMessage
            id="generic.runtimesShort"
            defaultMessage="Runtimes/Languages"
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
            getLocalizedName(a, locale).localeCompare(
              getLocalizedName(b, locale),
              locale
            ) || b.createdAt - a.createdAt
        )
        .map(exercise =>
          <ExercisesListItem
            {...exercise}
            createActions={createActions}
            locale={locale}
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
