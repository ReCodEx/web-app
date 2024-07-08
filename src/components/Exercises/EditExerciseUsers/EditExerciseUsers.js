import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';

import ExerciseUserButtonsContainer from '../../../containers/ExerciseUserButtonsContainer';
import AddUserContainer from '../../../containers/AddUserContainer';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import Box from '../../widgets/Box';
import Explanation from '../../widgets/Explanation';
import { AdminIcon, AuthorIcon } from '../../icons';

import { knownRoles, isSupervisorRole } from '../../helpers/usersRoles.js';

const ROLES_FILTER = knownRoles.filter(isSupervisorRole);

const EditExerciseUsers = ({ exercise, instanceId }) => {
  return (
    <Box
      type="warning"
      title={<FormattedMessage id="app.editExercise.manageUsers" defaultMessage="Manage related users" />}
      noPadding>
      <>
        <Table className="border-bottom mb-1">
          <tbody>
            <tr>
              <td className="text-center text-muted shrink-col em-padding-left em-padding-right">
                <AuthorIcon fixedWidth gapLeft />
              </td>
              <th>
                <FormattedMessage id="generic.author" defaultMessage="Author" />:
              </th>
              <td>
                <UsersNameContainer userId={exercise.authorId} showEmail="icon" link />
              </td>
            </tr>
            <tr>
              <td className="text-center text-muted shrink-col em-padding-left em-padding-right">
                <AdminIcon fixedWidth gapLeft />
              </td>
              <th>
                <FormattedMessage id="app.exercise.admins" defaultMessage="Administrators" />:
                <Explanation id="admins">
                  <FormattedMessage
                    id="app.exercise.admins.explanation"
                    defaultMessage="The administrators have the same permissions as the author towards the exercise, but they are not explicitly mentioned in listings or used in search filters."
                  />
                </Explanation>
              </th>
              <td>
                {exercise.adminsIds.map(id => (
                  <div key={id} className="mb-2">
                    <UsersNameContainer userId={id} showEmail="icon" link />
                    <span className="float-right mr-2">
                      <ExerciseUserButtonsContainer userId={id} exercise={exercise} />
                    </span>
                  </div>
                ))}
                {exercise.adminsIds.length === 0 && (
                  <em className="small text-muted">
                    <FormattedMessage id="app.exercise.noAdmins" defaultMessage="no administrators appointed" />
                  </em>
                )}
              </td>
            </tr>
          </tbody>
        </Table>

        {(exercise.permissionHints.changeAuthor || exercise.permissionHints.updateAdmins) && (
          <div className="m-3 mt-1">
            <AddUserContainer
              instanceId={instanceId}
              id={`add-exercise-user-${exercise.id}`}
              rolesFilter={ROLES_FILTER}
              createActions={({ id }) => <ExerciseUserButtonsContainer userId={id} exercise={exercise} />}
            />
          </div>
        )}
      </>
    </Box>
  );
};

EditExerciseUsers.propTypes = {
  instanceId: PropTypes.string.isRequired,
  exercise: PropTypes.object.isRequired,
};

export default EditExerciseUsers;
