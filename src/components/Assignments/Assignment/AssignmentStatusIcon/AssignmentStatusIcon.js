import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import StatusIcon from '../../../widgets/StatusIcon';
import Icon, { EvaluationFailedIcon } from '../../../icons';

const AssignmentStatusIcon = ({ id, submission = null, accepted = false, isBestSolution = false }) => {
  if (!submission) {
    return (
      <StatusIcon
        id={id}
        icon={<Icon icon="exclamation-triangle" className="text-red" />}
        message={
          <FormattedMessage
            id="app.assignemntStatusIcon.solutionMissingSubmission"
            defaultMessage="The solution was not submitted for evaluation probably due to an error. You may need to resubmit it."
          />
        }
      />
    );
  }

  if (!submission.evaluation && !submission.failure) {
    return (
      <StatusIcon
        id={id}
        icon={<Icon icon="cogs" className="text-yellow" />}
        message={
          <FormattedMessage
            id="app.assignemntStatusIcon.inProgress"
            defaultMessage="Assignment solution is being evaluated."
          />
        }
      />
    );
  }

  if (submission.failure) {
    return (
      <StatusIcon
        id={id}
        icon={<EvaluationFailedIcon className="text-danger" />}
        message={<FormattedMessage id="app.solutionStatusIcon.evaluationFailed" defaultMessage="Evaluation failed." />}
      />
    );
  }

  if (submission.evaluation.score >= 1.0) {
    return (
      <StatusIcon
        id={id}
        accepted={accepted}
        icon={<Icon icon={isBestSolution ? 'thumbs-up' : ['far', 'thumbs-up']} className="text-green" />}
        message={
          <>
            <FormattedMessage id="app.assignemntStatusIcon.ok" defaultMessage="Assignment is successfully completed." />
            {isBestSolution && !accepted && (
              <FormattedMessage
                id="app.assignemntStatusIcon.isBestSolution"
                defaultMessage="This is the best solution of the author submitted so far."
              />
            )}
          </>
        }
      />
    );
  }

  return (
    <StatusIcon
      id={id}
      accepted={accepted}
      icon={<Icon icon={isBestSolution ? 'thumbs-down' : ['far', 'thumbs-down']} className="text-red" />}
      message={
        <>
          <FormattedMessage
            id="app.assignemntStatusIcon.failed"
            defaultMessage="No correct solution was submitted yet."
          />
          {isBestSolution && !accepted && (
            <FormattedMessage
              id="app.assignemntStatusIcon.isBestSolution"
              defaultMessage="This is the best solution of the author submitted so far."
            />
          )}
        </>
      }
    />
  );
};

AssignmentStatusIcon.propTypes = {
  id: PropTypes.string.isRequired,
  submission: PropTypes.object,
  accepted: PropTypes.bool,
  isBestSolution: PropTypes.bool,
};

export default AssignmentStatusIcon;
