import React from 'react';
import { Table } from 'react-bootstrap';
import { injectIntl, FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import GroupExercisesListItem from '../ExercisesSimpleListItem';
import { getLocalizedName } from '../../../helpers/getLocalizedData';

const ExercisesSimpleList = ({
  exercises,
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
          var tmp = getLocalizedName(a, locale).localeCompare(
            getLocalizedName(b, locale),
            locale
          );
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
            locale={locale}
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
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(ExercisesSimpleList);
