import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedTime } from 'react-intl';
import Icon from 'react-fontawesome';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const FailuresListItem = ({ id, createActions, failure }) =>
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
  createActions: PropTypes.func
};

export default FailuresListItem;
