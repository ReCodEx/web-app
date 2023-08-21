import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useLocation, useNavigate } from 'react-router-dom';

import ActionButtons, { prepareButtonDescriptors } from '../../widgets/ActionButtons';
import withLinks from '../../../helpers/withLinks';

/**
 * Action templates containing basic parameters: label, icon (name), variant (success if missing),
 * and confirm (confirm yes/no message for a popover; no confirmation required if missing)
 */
const actionsTemplates = {
  setPromoted: {
    label: <FormattedMessage id="app.referenceSolution.actions.setPromoted" defaultMessage="Promote" />,
    icon: 'star',
    variant: 'warning',
    pending: 'visibilityPending',
  },
  unsetPromoted: {
    label: <FormattedMessage id="app.referenceSolution.actions.unsetPromoted" defaultMessage="Demote" />,
    icon: ['far', 'star'],
    variant: 'secondary',
    pending: 'visibilityPending',
  },
  setPublic: {
    label: <FormattedMessage id="app.referenceSolution.actions.setPublic" defaultMessage="Make public" />,
    icon: ['far', 'eye'],
    pending: 'visibilityPending',
  },
  setPrivate: {
    label: <FormattedMessage id="app.referenceSolution.actions.setPrivate" defaultMessage="Make private" />,
    icon: ['far', 'eye-slash'],
    variant: 'secondary',
    pending: 'visibilityPending',
  },
  setPrivateOther: {
    label: <FormattedMessage id="app.referenceSolution.actions.setPrivate" defaultMessage="Make private" />,
    icon: ['far', 'eye-slash'],
    variant: 'danger',
    pending: 'visibilityPending',
    confirm: (
      <FormattedMessage
        id="app.referenceSolution.actions.setPrivateConfirm"
        defaultMessage="Changing this solution to private will prevent you from seeing it again since only an author may see a private solution. Do you wish to proceed?"
      />
    ),
  },
};

// known actions list is kept separately since keys in actionsTemplates are not guaranteed to keep any ordering
const knownActions = ['setPromoted', 'unsetPromoted', 'setPublic', 'setPrivate', 'setPrivateOther'];

const ReferenceSolutionActions = ({
  id,
  currentUserId = null,
  solution,
  visibilityPending = false,
  size = undefined,
  dropdown = false,
  setVisibility = null,
  links: { EXERCISE_REFERENCE_SOLUTIONS_URI_FACTORY, REFERENCE_SOLUTION_URI_FACTORY },
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isOnSolutionPage = pathname === REFERENCE_SOLUTION_URI_FACTORY(solution.exerciseId, id);
  const exerciseSolutionsUrl = EXERCISE_REFERENCE_SOLUTIONS_URI_FACTORY(solution.exerciseId);

  const permissionHints = solution && solution.permissionHints;
  if (!permissionHints.setVisibility) {
    setVisibility = null;
  }

  // set private other must properly redirect, if the detail of the solution is visualized
  const setPrivateOther =
    setVisibility && isOnSolutionPage
      ? () => setVisibility(0).then(() => navigate(exerciseSolutionsUrl, { replace: true }))
      : () => setVisibility(0);

  const actionHandlers = {
    setPromoted: setVisibility && permissionHints.promote && solution.visibility < 2 && (() => setVisibility(2)),
    unsetPromoted: setVisibility && solution.visibility > 1 && (() => setVisibility(1)),
    setPublic: setVisibility && solution.visibility <= 0 && (() => setVisibility(1)),
    setPrivate:
      setVisibility && solution.visibility > 0 && solution.authorId === currentUserId && (() => setVisibility(0)),
    setPrivateOther: solution.visibility > 0 && solution.authorId !== currentUserId && setPrivateOther,
  };

  const pendingIndicators = { visibilityPending };
  const actions = prepareButtonDescriptors(actionsTemplates, knownActions, actionHandlers, pendingIndicators);

  return (
    <ActionButtons
      id={id}
      actions={actions}
      size={size}
      dropdown={dropdown}
      dropdownLabel={<FormattedMessage id="generic.update" defaultMessage="Update" />}
    />
  );
};

ReferenceSolutionActions.propTypes = {
  id: PropTypes.string.isRequired,
  currentUserId: PropTypes.string,
  solution: PropTypes.shape({
    authorId: PropTypes.string.isRequired,
    exerciseId: PropTypes.string.isRequired,
    visibility: PropTypes.number.isRequired,
    permissionHints: PropTypes.object,
  }),
  visibilityPending: PropTypes.bool,
  setVisibility: PropTypes.func,
  size: PropTypes.string,
  dropdown: PropTypes.bool,
  links: PropTypes.object.isRequired,
};

export default withLinks(ReferenceSolutionActions);
