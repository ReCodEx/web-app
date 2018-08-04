import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import AcceptSolution from '../../components/buttons/AcceptSolution';
import {
  acceptSolution,
  unacceptSolution
} from '../../redux/modules/solutions';
import { isAccepted, isAcceptPending } from '../../redux/selectors/solutions';

const AcceptSolutionContainer = ({
  accepted,
  acceptPending,
  accept,
  unaccept
}) => {
  return (
    <AcceptSolution
      accepted={accepted}
      acceptPending={acceptPending}
      accept={accept}
      unaccept={unaccept}
    />
  );
};

AcceptSolutionContainer.propTypes = {
  id: PropTypes.string.isRequired,
  accepted: PropTypes.bool.isRequired,
  acceptPending: PropTypes.bool.isRequired,
  accept: PropTypes.func.isRequired,
  unaccept: PropTypes.func.isRequired
};

const mapStateToProps = (state, { id }) => ({
  accepted: isAccepted(id)(state),
  acceptPending: isAcceptPending(id)(state)
});

const mapDispatchToProps = (dispatch, { id }) => ({
  accept: () => dispatch(acceptSolution(id)),
  unaccept: () => dispatch(unacceptSolution(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(
  AcceptSolutionContainer
);
