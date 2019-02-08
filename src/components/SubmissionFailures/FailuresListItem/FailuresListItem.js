import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router';

import DateTime from '../../widgets/DateTime';
import Icon from '../../icons';
import withLinks from '../../../helpers/withLinks';

const FailuresListItem = ({
  id,
  createActions,
  failure,
  links: {
    SOLUTION_DETAIL_URI_FACTORY,
    EXERCISE_REFERENCE_SOLUTION_URI_FACTORY,
  },
}) => (
  <tr className={failure.resolvedAt ? 'success' : 'danger'}>
    <td className="text-center">
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={id}>{failure.type}</Tooltip>}>
        <div>
          {failure.type === 'broker_reject' && <Icon icon="exchange-alt" />}
          {failure.type === 'evaluation_failure' && (
            <Icon icon="graduation-cap" />
          )}
          {failure.type === 'loading_failure' && <Icon icon="download" />}
        </div>
      </OverlayTrigger>
    </td>
    <td>{failure.description}</td>
    <td>
      {failure.assignmentSolutionId && (
        <Link
          to={SOLUTION_DETAIL_URI_FACTORY(
            failure.assignmentId,
            failure.assignmentSolutionId
          )}>
          <FormattedMessage
            id="app.failureListItem.studentAssignment"
            defaultMessage="Student assignment"
          />
        </Link>
      )}
      {failure.referenceSolutionId && (
        <Link
          to={EXERCISE_REFERENCE_SOLUTION_URI_FACTORY(
            failure.exerciseId,
            failure.referenceSolutionId
          )}>
          <FormattedMessage
            id="app.failureListItem.referenceAssignment"
            defaultMessage="Reference assignment"
          />
        </Link>
      )}
      {failure.assignmentSolutionId === null &&
        failure.referenceSolutionId === null && <span>&mdash;</span>}
    </td>
    <td>
      <DateTime unixts={failure.createdAt} />
    </td>
    <td>
      <DateTime unixts={failure.resolvedAt} />
    </td>
    <td>
      {failure.resolutionNote ? (
        <span>{failure.resolutionNote}</span>
      ) : (
        <span>&mdash;</span>
      )}
    </td>
    <td className="text-right">{createActions && createActions(id)}</td>
  </tr>
);

FailuresListItem.propTypes = {
  id: PropTypes.string.isRequired,
  failure: PropTypes.object.isRequired,
  createActions: PropTypes.func,
  links: PropTypes.object,
};

export default withLinks(FailuresListItem);
