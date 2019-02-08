import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AllowUserButton from '../../components/buttons/AllowUserButton';
import { setIsAllowed } from '../../redux/modules/users';
import {
  userIsAllowed,
  userIsAllowedPending,
} from '../../redux/selectors/users';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';

const AllowUserButtonContainer = ({
  id,
  loggedInUserId,
  isAllowed,
  pending,
  setIsAllowed,
  ...props
}) =>
  loggedInUserId !== id ? (
    <AllowUserButton
      id={id}
      isAllowed={isAllowed}
      pending={pending}
      setIsAllowed={setIsAllowed}
      {...props}
    />
  ) : null;

AllowUserButtonContainer.propTypes = {
  id: PropTypes.string.isRequired,
  loggedInUserId: PropTypes.string.isRequired,
  isAllowed: PropTypes.bool.isRequired,
  pending: PropTypes.bool,
  setIsAllowed: PropTypes.func.isRequired,
};

export default connect(
  (state, { id }) => ({
    loggedInUserId: loggedInUserIdSelector(state),
    isAllowed: userIsAllowed(state)(id),
    pending: userIsAllowedPending(state)(id),
  }),
  (dispatch, { id }) => ({
    setIsAllowed: allowed => dispatch(setIsAllowed(id, allowed)),
  })
)(AllowUserButtonContainer);
