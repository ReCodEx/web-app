import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import AcceptSolution from '../../components/buttons/AcceptSolution';
import { setSolutionFlag } from '../../redux/modules/solutions';
import { isAccepted, isSetFlagPending } from '../../redux/selectors/solutions';

const AcceptSolutionContainer = ({ accepted, acceptPending, accept, unaccept, ...props }) => {
  return (
    <AcceptSolution accepted={accepted} acceptPending={acceptPending} accept={accept} unaccept={unaccept} {...props} />
  );
};

AcceptSolutionContainer.propTypes = {
  id: PropTypes.string.isRequired,
  accepted: PropTypes.bool.isRequired,
  acceptPending: PropTypes.bool.isRequired,
  accept: PropTypes.func.isRequired,
  unaccept: PropTypes.func.isRequired,
};

const mapStateToProps = (state, { id }) => ({
  accepted: isAccepted(state, id),
  acceptPending: isSetFlagPending(state, id, 'accepted'),
});

const mapDispatchToProps = (dispatch, { id }) => ({
  accept: () => dispatch(setSolutionFlag(id, 'accepted', true)),
  unaccept: () => dispatch(setSolutionFlag(id, 'accepted', false)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AcceptSolutionContainer);
