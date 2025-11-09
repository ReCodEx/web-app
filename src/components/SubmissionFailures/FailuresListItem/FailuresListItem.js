import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import classnames from 'classnames';

import DateTime from '../../widgets/DateTime';
import Icon from '../../icons';
import withLinks from '../../../helpers/withLinks.js';

const ERROR_ICONS = {
  broker_reject: 'exchange-alt',
  evaluation_failure: 'graduation-cap',
  loading_failure: 'download',
  soft_config_error: 'feather',
};

const FailuresListItem = ({
  id,
  createActions,
  failure,
  links: { SOLUTION_DETAIL_URI_FACTORY, REFERENCE_SOLUTION_URI_FACTORY },
}) => (
  <tr>
    <td
      className={classnames({
        'text-center': true,
        'vertical-align': true,
        'bg-success': failure.resolvedAt,
        'bg-danger': !failure.resolvedAt,
      })}>
      <Icon
        icon={ERROR_ICONS[failure.type] || 'exclamation-circle'}
        tooltipId={id}
        tooltipPlacement="top"
        tooltip={failure.type}
      />
    </td>
    <td>{failure.description}</td>
    <td>
      {failure.assignmentSolutionId && (
        <Link to={SOLUTION_DETAIL_URI_FACTORY(failure.assignmentId, failure.assignmentSolutionId)}>
          <FormattedMessage id="app.failureListItem.studentAssignment" defaultMessage="Student assignment" />
        </Link>
      )}
      {failure.referenceSolutionId && (
        <Link to={REFERENCE_SOLUTION_URI_FACTORY(failure.exerciseId, failure.referenceSolutionId)}>
          <FormattedMessage id="app.failureListItem.referenceAssignment" defaultMessage="Reference assignment" />
        </Link>
      )}
      {failure.assignmentSolutionId === null && failure.referenceSolutionId === null && <span>&mdash;</span>}
    </td>
    <td>
      <DateTime unixTs={failure.createdAt} />
    </td>
    <td>
      <DateTime unixTs={failure.resolvedAt} />
    </td>
    <td>{failure.resolutionNote ? <span>{failure.resolutionNote}</span> : <span>&mdash;</span>}</td>
    <td className="text-end">{createActions && createActions(id)}</td>
  </tr>
);

FailuresListItem.propTypes = {
  id: PropTypes.string.isRequired,
  failure: PropTypes.object.isRequired,
  createActions: PropTypes.func,
  links: PropTypes.object,
};

export default withLinks(FailuresListItem);
