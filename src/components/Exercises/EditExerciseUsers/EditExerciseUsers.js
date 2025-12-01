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
      type={exercise.permissionHints.changeAuthor || exercise.permissionHints.updateAdmins ? 'warning' : undefined}
      title={<FormattedMessage id="app.editExercise.authorAndAdminsTitle" defaultMessage="Author and Administrators" />}
      noPadding
      unlimitedHeight>
      <>
        <Table className="border-bottom mb-1">
          <tbody>
            <tr>
              <th className="icon-col">
                <AuthorIcon fixedWidth gapLeft={2} className="text-success" />
              </th>
              <th>
                <FormattedMessage id="generic.author" defaultMessage="Author" />:
              </th>
              <td>
                <UsersNameContainer userId={exercise.authorId} showEmail="icon" link />
              </td>
            </tr>
            <tr>
              <th className="icon-col">
                <AdminIcon fixedWidth gapLeft={2} />
              </th>
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
                    <span className="float-end me-2">
                      <ExerciseUserButtonsContainer userId={id} exercise={exercise} />
                    </span>
                  </div>
                ))}
                {exercise.adminsIds.length === 0 && (
                  <em className="small text-body-secondary">
                    <FormattedMessage id="app.exercise.noAdmins" defaultMessage="no administrators appointed" />
                  </em>
                )}
              </td>
            </tr>
          </tbody>
        </Table>

        {(exercise.permissionHints.changeAuthor || exercise.permissionHints.updateAdmins) && (
          <div className="m-3">
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
