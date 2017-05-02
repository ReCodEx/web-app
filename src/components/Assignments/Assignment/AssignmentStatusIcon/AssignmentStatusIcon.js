import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from 'react-fontawesome';
import Staus from './Status';

const AssignmentStatusIcon = ({
  id,
  status
}) => {
  switch (status) {
    case 'done':
      return (
        <Staus
          id={id}
          icon={<Icon name="thumbs-o-up" className="text-green" />}
          message={<FormattedMessage id="app.assignemntStatusIcon.ok" defaultMessage="Assignment is successfully completed." />} />
      );

    case 'work-in-progress':
      return (
        <Staus
          id={id}
          icon={<Icon name="cogs" className="text-yellow" />}
          message={<FormattedMessage id="app.assignemntStatusIcon.inProgress" defaultMessage="Assignment solution is being evaluated." />} />
      );

    case 'failed':
      return (
        <Staus
          id={id}
          icon={<Icon name="thumbs-o-down" className="text-red" />}
          message={<FormattedMessage id="app.assignemntStatusIcon.failed" defaultMessage="No correct solution was submitted yet." />} />
      );

    case 'evaluation-failed':
      return (
        <Staus
          id={id}
          icon={<Icon name="exclamation-triangle" className="text-yellow" />}
          message={<FormattedMessage id="app.assignemntStatusIcon.evaluationFailed" defaultMessage="No solution was evaluated correctly by ReCodEx." />} />
      );

    default:
      return (
        <Staus
          id={id}
          icon={<Icon name="code" className="text-gray" />}
          message={<FormattedMessage id="app.assignemntStatusIcon.none" defaultMessage="No solutions were submmitted so far." />} />
      );
  }
};

AssignmentStatusIcon.propTypes = {
  id: PropTypes.string.isRequired,
  status: PropTypes.string
};

export default AssignmentStatusIcon;
