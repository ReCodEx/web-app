import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table, Popover, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import Box from '../../widgets/Box';
import DateTime from '../../widgets/DateTime';
import Confirm from '../../forms/Confirm';
import { AbortIcon, AssignmentIcon } from '../../icons';
import withLinks from '../../../helpers/withLinks';

const formatArgs = args =>
  args && typeof args === 'object'
    ? Object.keys(args)
        .map(key => `${key}=${typeof args[key] === 'object' ? JSON.stringify(args[key]) : args[key]}`)
        .join(', ')
    : args;

const AsyncJobsList = ({ asyncJobs, abort = null, links: { ASSIGNMENT_DETAIL_URI_FACTORY } }) => (
  <Box title={<FormattedMessage id="app.asyncJobs.list.title" defaultMessage="Recent Jobs" />} noPadding>
    {asyncJobs && asyncJobs.length > 0 ? (
      <Table responsive size="sm" hover>
        <thead>
          <tr>
            <th>
              <FormattedMessage id="generic.createdAt" defaultMessage="Created at" />
            </th>
            <th>
              <FormattedMessage id="generic.scheduledAt" defaultMessage="Scheduled at" />
            </th>
            <th>
              <FormattedMessage id="generic.startedAt" defaultMessage="Started at" />
            </th>
            <th>
              <FormattedMessage id="generic.terminatedAt" defaultMessage="Terminated at" />
            </th>
            <th>
              <FormattedMessage id="app.asyncJobs.list.command" defaultMessage="Command" />
            </th>
            <th>
              <FormattedMessage id="generic.errorMessage" defaultMessage="Error message" />
            </th>
            <th />
            <th />
          </tr>
        </thead>
        <tbody>
          {asyncJobs
            .sort((a, b) => b.createdAt - a.createdAt)
            .map(job => (
              <tr key={job.id} className={job.terminatedAt ? 'text-muted' : ''}>
                <td className="small text-nowrap">
                  <DateTime unixts={job.createdAt} />
                </td>
                <td className="small text-nowrap">
                  <DateTime unixts={job.scheduledAt} emptyPlaceholder="-" />
                </td>
                <td className="small text-nowrap">
                  {job.startedAt ? (
                    <OverlayTrigger
                      overlay={
                        <Popover id={`start-${job.id}`}>
                          <Popover.Title>
                            <FormattedMessage id="app.asyncJobs.list.processInfo" defaultMessage="Processing info" />
                          </Popover.Title>
                          <Popover.Content className="small">
                            <FormattedMessage id="app.asyncJobs.list.worker" defaultMessage="Worker" />:
                            <code>{job.workerId}</code>
                            <br />
                            <FormattedMessage id="app.asyncJobs.list.retries" defaultMessage="Retries" />: {job.retries}
                          </Popover.Content>
                        </Popover>
                      }>
                      {
                        <span>
                          <DateTime unixts={job.startedAt} />
                        </span>
                      }
                    </OverlayTrigger>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="small text-nowrap">
                  <DateTime unixts={job.terminatedAt} emptyPlaceholder="-" />
                </td>
                <td>
                  {job.arguments && Object.keys(job.arguments).length > 0 ? (
                    <OverlayTrigger
                      overlay={
                        <Popover id={`pop-${job.id}`}>
                          <Popover.Title>
                            <FormattedMessage id="app.asyncJobs.list.args" defaultMessage="Command arguments" />
                          </Popover.Title>
                          <Popover.Content>
                            <code>{formatArgs(job.arguments)}</code>
                          </Popover.Content>
                        </Popover>
                      }>
                      <code>{job.command}</code>
                    </OverlayTrigger>
                  ) : (
                    <code>{job.command}</code>
                  )}
                </td>
                <td className="small text-nowrap">{job.error}</td>
                <td>
                  {job.associatedAssignment && (
                    <OverlayTrigger
                      overlay={
                        <Tooltip id={`assignment-${job.id}`}>
                          <FormattedMessage
                            id="app.asyncJobs.list.associatedAssignment"
                            defaultMessage="Associated assignment"
                          />
                        </Tooltip>
                      }>
                      <Link to={ASSIGNMENT_DETAIL_URI_FACTORY(job.associatedAssignment)}>
                        <AssignmentIcon />
                      </Link>
                    </OverlayTrigger>
                  )}
                </td>
                <td>
                  {abort && !job.startedAt && !job.terminatedAt && (
                    <Confirm
                      id={`confirm-${job.id}`}
                      onConfirmed={() => abort(job.id)}
                      question={
                        <FormattedMessage
                          id="app.asyncJobs.list.abortConfirm"
                          defaultMessage="Do you really wish to abort selected background job?"
                        />
                      }>
                      <AbortIcon className="text-danger" gapRight />
                    </Confirm>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
    ) : (
      <div className="small text-center text-muted em-padding">
        <FormattedMessage
          id="app.asyncJobs.list.noJobs"
          defaultMessage="No background jobs have been enqueued recently..."
        />
      </div>
    )}
  </Box>
);

AsyncJobsList.propTypes = {
  asyncJobs: PropTypes.array.isRequired,
  abort: PropTypes.func,
  links: PropTypes.object,
};

export default withLinks(AsyncJobsList);
