import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import StatusIcon from '../../../widgets/StatusIcon';
import Icon, { EvaluationFailedIcon } from '../../../icons';

const AssignmentStatusIcon = ({ id, submission = null, accepted = false, isBestSolution = false }) => {
  if (!submission) {
    return (
      <Icon
        icon="exclamation-triangle"
        className="text-danger"
        tooltipId={id}
        tooltip={
          <FormattedMessage
            id="app.assignmentStatusIcon.solutionMissingSubmission"
            defaultMessage="The solution was not submitted for evaluation probably due to an error. You may need to resubmit it."
          />
        }
      />
    );
  }

  if (!submission.evaluation && !submission.failure) {
    return (
      <Icon
        icon="cogs"
        className="text-warning"
        tooltipId={id}
        tooltip={
          <FormattedMessage
            id="app.assignmentStatusIcon.inProgress"
            defaultMessage="Assignment solution is being evaluated."
          />
        }
      />
    );
  }

  if (submission.failure) {
    return (
      <EvaluationFailedIcon
        className="text-danger"
        tooltipId={id}
        tooltip={<FormattedMessage id="app.solutionStatusIcon.evaluationFailed" defaultMessage="Evaluation failed." />}
      />
    );
  }

  if (submission.evaluation.score >= 1.0) {
    return (
      <StatusIcon
        accepted={accepted}
        icon={
          <Icon
            icon={isBestSolution ? 'thumbs-up' : ['far', 'thumbs-up']}
            className="text-success"
            tooltipId={id}
            tooltip={
              <>
                <FormattedMessage
                  id="app.assignmentStatusIcon.ok"
                  defaultMessage="Assignment is successfully completed."
                />
                {isBestSolution && !accepted && (
                  <FormattedMessage
                    id="app.assignmentStatusIcon.isBestSolution"
                    defaultMessage="This is the best solution of the author submitted so far."
                  />
                )}
              </>
            }
          />
        }
      />
    );
  }

  return (
    <StatusIcon
      accepted={accepted}
      icon={
        <Icon
          icon={isBestSolution ? 'thumbs-down' : ['far', 'thumbs-down']}
          className="text-danger"
          tooltipId={id}
          tooltip={
            <>
              <FormattedMessage
                id="app.assignmentStatusIcon.failed"
                defaultMessage="No correct solution was submitted yet."
              />
              {isBestSolution && !accepted && (
                <FormattedMessage
                  id="app.assignmentStatusIcon.isBestSolution"
                  defaultMessage="This is the best solution of the author submitted so far."
                />
              )}
            </>
          }
        />
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
