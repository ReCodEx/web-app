import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedTime, FormattedMessage } from 'react-intl';
import Icon from 'react-fontawesome';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router';
import withLinks from '../../../hoc/withLinks';

const FailuresListItem = ({
  id,
  createActions,
  failure,
  links: {
    SUBMISSION_DETAIL_URI_FACTORY,
    EXERCISE_REFERENCE_SOLUTION_URI_FACTORY
  }
}) =>
  <tr className={failure.resolvedAt ? 'success' : 'danger'}>
    <td className="text-center">
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id={id}>
            {failure.type}
          </Tooltip>
        }
      >
        <div>
          {failure.type === 'broker_reject' && <Icon name="exchange" />}
          {failure.type === 'evaluation_failure' &&
            <Icon name="graduation-cap" />}
          {failure.type === 'loading_failure' && <Icon name="download" />}
        </div>
      </OverlayTrigger>
    </td>
    <td>
      {failure.description}
    </td>
    <td>
      {failure.assignmentSolutionId &&
        <Link
          to={SUBMISSION_DETAIL_URI_FACTORY(
            failure.assignmentId,
            failure.assignmentSolutionId
          )}
        >
          <FormattedMessage
            id="app.failureListItem.studentAssignment"
            defaultMessage="Student assignment"
          />
        </Link>}
      {failure.referenceSolutionId &&
        <Link
          to={EXERCISE_REFERENCE_SOLUTION_URI_FACTORY(
            failure.exerciseId,
            failure.referenceSolutionId
          )}
        >
          <FormattedMessage
            id="app.failureListItem.referenceAssignment"
            defaultMessage="Reference assignment"
          />
        </Link>}
      {failure.assignmentSolutionId === null &&
        failure.referenceSolutionId === null &&
        <span>&mdash;</span>}
    </td>
    <td>
      <FormattedDate value={new Date(failure.createdAt * 1000)} />
      {', '}
      <FormattedTime value={new Date(failure.createdAt * 1000)} />
    </td>
    <td>
      {failure.resolvedAt
        ? <span>
            <FormattedDate value={new Date(failure.resolvedAt * 1000)} />
            {', '}
            <FormattedTime value={new Date(failure.resolvedAt * 1000)} />
          </span>
        : <span>&mdash;</span>}
    </td>
    <td>
      {failure.resolutionNote
        ? <span>
            {failure.resolutionNote}
          </span>
        : <span>&mdash;</span>}
    </td>
    <td className="text-right">
      {createActions && createActions(id)}
    </td>
  </tr>;

FailuresListItem.propTypes = {
  id: PropTypes.string.isRequired,
  failure: PropTypes.object.isRequired,
  createActions: PropTypes.func,
  links: PropTypes.object
};

export default withLinks(FailuresListItem);
