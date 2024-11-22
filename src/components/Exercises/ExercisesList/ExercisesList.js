import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import ExercisesListItem from '../ExercisesListItem';
import { LoadingIcon } from '../../icons';
import { UserUIDataContext } from '../../../helpers/contexts.js';

const ExercisesList = ({
  heading = null,
  exercises = [],
  showGroups = false,
  showAssignButton = false,
  assignExercise = null,
  reload,
}) => {
  const navigate = useNavigate();
  return (
    <UserUIDataContext.Consumer>
      {({ openOnDoubleclick = false }) => (
        <Table hover>
          {Boolean(heading) && <thead>{heading}</thead>}
          <tbody>
            {exercises.map((exercise, idx) =>
              exercise ? (
                <ExercisesListItem
                  {...exercise}
                  showGroups={showGroups}
                  showAssignButton={showAssignButton}
                  assignExercise={assignExercise}
                  key={exercise ? exercise.id : idx}
                  reload={reload}
                  doubleClickPush={openOnDoubleclick ? navigate : null}
                />
              ) : (
                <tr key={idx}>
                  <td colSpan={showGroups ? 8 : 7}>
                    <LoadingIcon gapRight />
                    <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
                  </td>
                </tr>
              )
            )}

            {exercises.length === 0 && (
              <tr>
                <td className="text-center text-body-secondary" colSpan={showGroups ? 8 : 7}>
                  <FormattedMessage
                    id="app.exercisesList.empty"
                    defaultMessage="No exercises match selected filters."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </UserUIDataContext.Consumer>
  );
};

ExercisesList.propTypes = {
  heading: PropTypes.any,
  exercises: PropTypes.array,
  showGroups: PropTypes.bool,
  showAssignButton: PropTypes.bool,
  assignExercise: PropTypes.func,
  reload: PropTypes.func,
};

export default ExercisesList;
