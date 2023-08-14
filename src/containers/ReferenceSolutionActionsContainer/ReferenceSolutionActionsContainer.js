import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';

import ReferenceSolutionActions from '../../components/ReferenceSolutions/ReferenceSolutionActions';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';

import { setVisibility } from '../../redux/modules/referenceSolutions';
import {
  getReferenceSolution,
  getReferenceSolutionSetVisibilityStatus,
} from '../../redux/selectors/referenceSolutions';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';

const ReferenceSolutionActionsContainer = ({
  id,
  currentUserId = null,
  solution,
  visibilityPending = null,
  setVisibility,
  ...props
}) => {
  return (
    <ResourceRenderer resource={[solution]}>
      {solution => (
        <ReferenceSolutionActions
          {...props}
          id={id}
          currentUserId={currentUserId}
          solution={solution}
          visibilityPending={visibilityPending}
          setVisibility={setVisibility}
        />
      )}
    </ResourceRenderer>
  );
};

ReferenceSolutionActionsContainer.propTypes = {
  id: PropTypes.string.isRequired,
  currentUserId: PropTypes.string,
  solution: ImmutablePropTypes.map,
  visibilityPending: PropTypes.bool,
  setVisibility: PropTypes.func.isRequired,
};

export default connect(
  (state, { id }) => {
    return {
      currentUserId: loggedInUserIdSelector(state),
      solution: getReferenceSolution(id)(state),
      visibilityPending: getReferenceSolutionSetVisibilityStatus(state, id),
    };
  },
  (dispatch, { id }) => ({
    setVisibility: visibility => dispatch(setVisibility(id, visibility)),
  })
)(ReferenceSolutionActionsContainer);
