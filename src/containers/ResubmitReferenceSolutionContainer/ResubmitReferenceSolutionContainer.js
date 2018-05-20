import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ResubmitSolution from '../../components/buttons/ResubmitSolution';
import withLinks from '../../helpers/withLinks';
import { resubmitReferenceSolution } from '../../redux/modules/referenceSolutions';

const ResubmitReferenceSolutionContainer = ({
  id,
  resubmit,
  isDebug = true,
  links: { SUBMISSION_DETAIL_URI_FACTORY }
}) => {
  return (
    <span>
      <ResubmitSolution id={id} resubmit={resubmit} isDebug={isDebug} />
    </span>
  );
};

ResubmitReferenceSolutionContainer.propTypes = {
  id: PropTypes.string.isRequired,
  resubmit: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  isDebug: PropTypes.bool
};

const mapStateToProps = state => ({});

const mapDispatchToProps = (dispatch, { id }) => ({
  resubmit: isDebug => dispatch(resubmitReferenceSolution(id, isDebug))
});

export default withLinks(
  connect(mapStateToProps, mapDispatchToProps)(
    ResubmitReferenceSolutionContainer
  )
);
