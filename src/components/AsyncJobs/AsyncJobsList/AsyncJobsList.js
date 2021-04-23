import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table, Popover, OverlayTrigger } from 'react-bootstrap';

import Box from '../../widgets/Box';
import DateTime from '../../widgets/DateTime';
import Confirm from '../../forms/Confirm';
import Icon from '../../icons';

const formatArgs = args =>
  args && typeof args === 'object'
    ? Object.keys(args)
        .map(key => `${key}=${typeof args[key] === 'object' ? JSON.stringify(args[key]) : args[key]}`)
        .join(', ')
    : args;

const AsyncJobsList = ({ asyncJobs, abort = null }) => (
  <Box title={<FormattedMessage id="app.asyncJobs.list.title" defaultMessage="Recent Jobs" />} noPadding>
    {asyncJobs && asyncJobs.length > 0 ? (
      <Table responsive condensed hover>
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
                        <Popover
                          id={`start-${job.id}`}
                          title={
                            <FormattedMessage id="app.asyncJobs.list.processInfo" defaultMessage="Processing info" />
                          }>
                          <small>
                            <FormattedMessage id="app.asyncJobs.list.worker" defaultMessage="Worker" />:
                            <code>{job.workerId}</code>
                            <br />
                            <FormattedMessage id="app.asyncJobs.list.retries" defaultMessage="Retries" />: {job.retries}
                          </small>
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
                        <Popover
                          id={`pop-${job.id}`}
                          title={<FormattedMessage id="app.asyncJobs.list.args" defaultMessage="Command arguments" />}>
                          <code>{formatArgs(job.arguments)}</code>
                        </Popover>
                      }>
                      <code>{job.command}</code>
                    </OverlayTrigger>
                  ) : (
                    <code>{job.command}</code>
                  )}
                </td>
                <td className="small text-nowrap">{job.error}</td>
                <td>{job.associatedAssignment}</td>
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
                      <Icon icon="car-crash" className="text-danger" gapRight />
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
};

export default AsyncJobsList;
