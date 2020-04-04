import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import StatusIcon from '../../../widgets/StatusIcon';
import Icon, { CodeIcon, EvaluationFailedIcon } from '../../../icons';

export const getStatusDesc = (status, lastSubmission) => {
  if (status === null) {
    status = 'work-in-progress';
  }
  return status === 'work-in-progress' && !lastSubmission ? 'missing-submission' : status;
};

const AssignmentStatusIcon = ({ id, status, accepted = false, isBestSolution = false }) => {
  switch (status) {
    case 'done':
      return (
        <StatusIcon
          id={id}
          accepted={accepted}
          icon={<Icon icon={isBestSolution ? 'thumbs-up' : ['far', 'thumbs-up']} className="text-green" />}
          message={
            <React.Fragment>
              <FormattedMessage
                id="app.assignemntStatusIcon.ok"
                defaultMessage="Assignment is successfully completed."
              />
              {isBestSolution && !accepted && (
                <FormattedMessage
                  id="app.assignemntStatusIcon.isBestSolution"
                  defaultMessage="This is the best solution of the author submitted so far."
                />
              )}
            </React.Fragment>
          }
        />
      );

    case 'work-in-progress':
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

    case 'failed':
      return (
        <StatusIcon
          id={id}
          accepted={accepted}
          icon={<Icon icon={isBestSolution ? 'thumbs-down' : ['far', 'thumbs-down']} className="text-red" />}
          message={
            <React.Fragment>
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
            </React.Fragment>
          }
        />
      );

    case 'evaluation-failed':
      return (
        <StatusIcon
          id={id}
          icon={<EvaluationFailedIcon className="text-danger" />}
          message={
            <FormattedMessage id="app.assignemntStatusIcon.evaluationFailed" defaultMessage="Evaluation failed." />
          }
        />
      );

    case 'missing-submission':
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

    default:
      return (
        <StatusIcon
          id={id}
          icon={<CodeIcon className="text-gray" />}
          message={
            <FormattedMessage
              id="app.assignemntStatusIcon.none"
              defaultMessage="No solutions were submmitted so far."
            />
          }
        />
      );
  }
};

AssignmentStatusIcon.propTypes = {
  id: PropTypes.string.isRequired,
  status: PropTypes.string,
  accepted: PropTypes.bool,
  isBestSolution: PropTypes.bool,
};

export default AssignmentStatusIcon;
