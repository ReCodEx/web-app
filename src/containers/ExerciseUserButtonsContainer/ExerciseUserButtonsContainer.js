import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import { setAuthor, setAdmins } from '../../redux/modules/exercises.js';
import { getExerciseSetAuthorStatus, getExerciseSetAdminsStatus } from '../../redux/selectors/exercises.js';

import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import { AdminIcon, AuthorIcon, LoadingIcon, RemoveUserIcon, WarningIcon } from '../../components/icons';

const ExerciseUserButtonsContainer = ({
  exercise,
  userId,
  setAuthor,
  setAuthorStatus,
  addAdmin,
  removeAdmin,
  setAdminsStatus,
  size = 'xs',
}) => {
  const isAdmin = exercise.adminsIds && exercise.adminsIds.includes(userId);
  return exercise.authorId !== userId ? (
    <TheButtonGroup>
      {exercise.permissionHints.changeAuthor && (
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id={`authorButton-${userId}`}>
              <FormattedMessage
                id="app.editExercise.setAuthorButton"
                defaultMessage="Make this user an author of the exercise (replacing current author)"
              />
            </Tooltip>
          }>
          <Button
            variant={setAuthorStatus === false ? 'danger' : 'warning'}
            size={size}
            onClick={setAuthor}
            disabled={Boolean(setAuthorStatus)}>
            {setAuthorStatus === false && <WarningIcon fixedWidth smallGapRight />}
            {setAuthorStatus ? <LoadingIcon fixedWidth /> : <AuthorIcon fixedWidth />}
          </Button>
        </OverlayTrigger>
      )}

      {exercise.permissionHints.updateAdmins && (
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id={`adminButton-${userId}`}>
              {isAdmin ? (
                <FormattedMessage
                  id="app.editExercise.removeAdminButton"
                  defaultMessage="Remove the user from exercise admins"
                />
              ) : (
                <FormattedMessage
                  id="app.editExercise.addAdminButton"
                  defaultMessage="Make the user an exercise admin"
                />
              )}
            </Tooltip>
          }>
          <Button
            variant={isAdmin || setAuthorStatus === false ? 'danger' : 'success'}
            size={size}
            onClick={isAdmin ? removeAdmin : addAdmin}
            disabled={Boolean(setAdminsStatus)}>
            {setAdminsStatus === false && <WarningIcon fixedWidth smallGapRight />}
            {setAdminsStatus ? (
              <LoadingIcon fixedWidth />
            ) : isAdmin ? (
              <RemoveUserIcon fixedWidth />
            ) : (
              <AdminIcon fixedWidth />
            )}
          </Button>
        </OverlayTrigger>
      )}
    </TheButtonGroup>
  ) : (
    <OverlayTrigger
      placement="bottom"
      overlay={
        <Tooltip id={`disabledButton-${userId}`}>
          <FormattedMessage
            id="app.editExercise.userIsAuthor"
            defaultMessage="The user is the author of the exercise"
          />
        </Tooltip>
      }>
      <Button variant="secondary" size={size} disabled>
        <AuthorIcon fixedWidth />
      </Button>
    </OverlayTrigger>
  );
};

ExerciseUserButtonsContainer.propTypes = {
  userId: PropTypes.string.isRequired,
  exercise: PropTypes.object.isRequired,
  setAuthorStatus: PropTypes.bool,
  setAdminsStatus: PropTypes.bool,
  size: PropTypes.string,
  setAuthor: PropTypes.func.isRequired,
  addAdmin: PropTypes.func.isRequired,
  removeAdmin: PropTypes.func.isRequired,
};

export default connect(
  (state, { exercise }) => ({
    setAuthorStatus: getExerciseSetAuthorStatus(state, exercise.id),
    setAdminsStatus: getExerciseSetAdminsStatus(state, exercise.id),
  }),
  (dispatch, { exercise, userId }) => ({
    setAuthor: () => dispatch(setAuthor(exercise.id, userId)),
    addAdmin: () => dispatch(setAdmins(exercise.id, [...exercise.adminsIds, userId])),
    removeAdmin: () =>
      dispatch(
        setAdmins(
          exercise.id,
          exercise.adminsIds.filter(id => id !== userId)
        )
      ),
  })
)(ExerciseUserButtonsContainer);
