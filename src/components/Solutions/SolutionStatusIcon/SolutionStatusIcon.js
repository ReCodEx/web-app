import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Icon, {
  AcceptedIcon,
  BanIcon,
  DeadlineIcon,
  EvaluationFailedIcon,
  PastDeadlineIcon,
  PointsIcon,
} from '../../icons';
import StatusIcon from '../../widgets/StatusIcon';

/**
 * Displays solution status indicator icon with tooltip.
 * Special cases:
 * - failure -> display bomb
 * - missing evaluation -> shoe rotating gear
 * - compilation error -> special icon (banned gears)
 *
 * Regular cases: A hand with different colors and optional side icons is displayed:
 * - hand type (thumbs up/down) depends on correctness
 * - if the solution is best solution, the hand is bold (not regular)
 * - color depends on actual points being scored (green-yellow-red, muted if maxpoints === 0)
 * - accepted -> green checkmark bottom-right
 * - after deadline -> gray skull bottom-right
 * - between deadlines -> hourglass bottom-right
 * - overriden or bonus points -> chat-dollar sign top-right
 */
const SolutionStatusIcon = ({
  id,
  placement = 'bottom',
  solution: {
    accepted,
    isBestSolution,
    actualPoints,
    maxPoints,
    maxPointsEver,
    overriddenPoints,
    bonusPoints,
    pastDeadline,
    lastSubmission = null,
  },
  ...props
}) => {
  let icon = <EvaluationFailedIcon {...props} className="text-danger" />;
  let message = null;

  if (!lastSubmission || lastSubmission.failure) {
    // special case - failure
    icon = <EvaluationFailedIcon {...props} className="text-danger" />;
    message = <FormattedMessage id="app.solutionStatusIcon.evaluationFailed" defaultMessage="Evaluation failed." />;
  } else if (!lastSubmission.evaluation) {
    // special case - evaluation in progress
    icon = <Icon {...props} icon="gear" className="text-muted fa-spin" />;
    message = (
      <FormattedMessage
        id="app.solutionStatusIcon.evaluationPending"
        defaultMessage="The evaluation is not available yet."
      />
    );
  } else if (lastSubmission.evaluation.initFailed) {
    // special case - compilation
    icon = (
      <span className="fa-layers fa-fw mr-1">
        <Icon {...props} icon="gears" className="text-muted" transform="shrink-4" />
        <BanIcon className="text-danger almost-opaque" transform="flip-h grow-3" />
      </span>
    );
    message = (
      <FormattedMessage
        id="app.solutionStatusIcon.initFailed"
        defaultMessage="The compilation has failed. No tests were executed."
      />
    );
  } else {
    // show hands
    const score = lastSubmission.evaluation.score;
    const handType = score >= 1.0 ? 'thumbs-up' : score <= 0.0 ? 'thumbs-down' : 'hand-point-right';
    const faType = isBestSolution ? 'fas' : 'far';
    const color =
      maxPoints === 0 && !accepted
        ? 'muted'
        : actualPoints >= maxPointsEver
        ? 'success'
        : actualPoints <= 0
        ? 'danger'
        : 'warning';

    icon = (
      <span className="fa-layers fa-fw mr-1">
        <Icon {...props} icon={[faType, handType]} className={`text-${color}`} transform="grow-3" />

        {(bonusPoints !== 0 || overriddenPoints !== null) && (
          <>
            <Icon icon="comment" className="text-light half-opaque" transform="shrink-2 right-10 up-7" />
            <PointsIcon className="text-warning almost-opaque" transform="shrink-4 right-10 up-7" />
          </>
        )}

        {(accepted || pastDeadline > 0) && (
          <Icon icon="circle" className="text-light half-opaque" transform="shrink-3 right-9 down-7" />
        )}
        {accepted && <AcceptedIcon className="text-success almost-opaque" transform="shrink-5 right-9 down-7" />}
        {!accepted && pastDeadline >= 2 && (
          <PastDeadlineIcon className="text-muted almost-opaque" transform="shrink-5 right-9 down-7" />
        )}
        {!accepted && pastDeadline === 1 && (
          <DeadlineIcon className="text-muted almost-opaque" transform="shrink-5 right-9 down-7" />
        )}
      </span>
    );

    if (accepted || isBestSolution || bonusPoints !== 0 || overriddenPoints !== null || pastDeadline > 0)
      message = (
        <>
          {accepted ? (
            <FormattedMessage
              id="app.solutionStatusIcon.accepted"
              defaultMessage="The solution was marked as accepted."
            />
          ) : (
            isBestSolution && (
              <FormattedMessage
                id="app.solutionStatusIcon.best"
                defaultMessage="This is the best solution submitted so far."
              />
            )
          )}{' '}
          {(bonusPoints !== 0 || overriddenPoints !== null) && (
            <FormattedMessage
              id="app.solutionStatusIcon.pointsChanged"
              defaultMessage="The awarded points were adjusted by the teacher."
            />
          )}{' '}
          {pastDeadline === 1 ? (
            <FormattedMessage
              id="app.solutionStatusIcon.betweenDeadlines"
              defaultMessage="The solution was submitted between the first and the second deadline."
            />
          ) : (
            pastDeadline >= 2 && (
              <FormattedMessage
                id="app.solutionStatusIcon.pastDeadline"
                defaultMessage="The solution was submitted after the deadline."
              />
            )
          )}
        </>
      );
  }

  return <StatusIcon id={id} icon={icon} message={message} placement={placement} />;
};

SolutionStatusIcon.propTypes = {
  id: PropTypes.string.isRequired,
  placement: PropTypes.string,
  solution: PropTypes.shape({
    accepted: PropTypes.bool,
    isBestSolution: PropTypes.bool,
    bonusPoints: PropTypes.number,
    actualPoints: PropTypes.number,
    overriddenPoints: PropTypes.number,
    maxPoints: PropTypes.number,
    maxPointsEver: PropTypes.number,
    pastDeadline: PropTypes.number,
    lastSubmission: PropTypes.shape({
      evaluation: PropTypes.shape({
        score: PropTypes.number,
        initFailed: PropTypes.bool,
      }),
      failure: PropTypes.object,
    }),
  }),
};

export default SolutionStatusIcon;
