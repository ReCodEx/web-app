import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import AcceptSolution from '../../components/buttons/AcceptSolution';
import {
  acceptSubmission,
  unacceptSubmission
} from '../../redux/modules/submissions';
import { isAccepted } from '../../redux/selectors/submissions';

const AcceptSolutionContainer = ({ accepted, accept, unaccept }) => {
  return (
    <AcceptSolution accepted={accepted} accept={accept} unaccept={unaccept} />
  );
};

AcceptSolutionContainer.propTypes = {
  id: PropTypes.string.isRequired,
  accepted: PropTypes.bool.isRequired,
  accept: PropTypes.func.isRequired,
  unaccept: PropTypes.func.isRequired
};

const mapStateToProps = (state, { id }) => ({
  accepted: isAccepted(id)(state)
});

const mapDispatchToProps = (dispatch, { id }) => ({
  accept: () => dispatch(acceptSubmission(id)),
  unaccept: () => dispatch(unacceptSubmission(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(
  AcceptSolutionContainer
);
