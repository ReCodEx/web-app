import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import ExercisesListItem from '../ExercisesListItem';
import { LoadingIcon } from '../../icons';

const ExercisesList = ({ heading = null, exercises = [], showGroups }) =>
  <Table hover>
    {Boolean(heading) &&
      <thead>
        {heading}
      </thead>}
    <tbody>
      {exercises.map(
        (exercise, idx) =>
          exercise
            ? <ExercisesListItem
                {...exercise}
                showGroups
                key={exercise ? exercise.id : idx}
              />
            : <tr key={idx}>
                <td colSpan={showGroups ? 8 : 7}>
                  <LoadingIcon gapRight />
                  <FormattedMessage
                    id="generic.loading"
                    defaultMessage="Loading ..."
                  />
                </td>
              </tr>
      )}

      {exercises.length === 0 &&
        <tr>
          <td className="text-center text-muted" colSpan={showGroups ? 8 : 7}>
            <FormattedMessage
              id="app.exercisesList.empty"
              defaultMessage="No exercises match selected filters."
            />
          </td>
        </tr>}
    </tbody>
  </Table>;

ExercisesList.propTypes = {
  heading: PropTypes.any,
  exercises: PropTypes.array,
  showGroups: PropTypes.bool
};

export default ExercisesList;
