import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import StatusIcon from '../../../widgets/StatusIcon';
import Icon, { CodeIcon } from '../../../icons';

const AssignmentStatusIcon = ({ id, status, accepted = false }) => {
  switch (status) {
    case 'done':
      return (
        <StatusIcon
          id={id}
          accepted={accepted}
          icon={<Icon icon={['far', 'thumbs-up']} className="text-green" />}
          message={
            <FormattedMessage
              id="app.assignemntStatusIcon.ok"
              defaultMessage="Assignment is successfully completed."
            />
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
          icon={<Icon icon={['far', 'thumbs-down']} className="text-red" />}
          message={
            <FormattedMessage
              id="app.assignemntStatusIcon.failed"
              defaultMessage="No correct solution was submitted yet."
            />
          }
        />
      );

    case 'evaluation-failed':
      return (
        <StatusIcon
          id={id}
          icon={<Icon icon="exclamation-triangle" className="text-yellow" />}
          message={
            <FormattedMessage
              id="app.assignemntStatusIcon.evaluationFailed"
              defaultMessage="No solution was evaluated correctly by ReCodEx."
            />
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
  accepted: PropTypes.bool
};

export default AssignmentStatusIcon;
