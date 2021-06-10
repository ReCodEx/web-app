import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ImmutablePropTypes from 'react-immutable-proptypes';

import Icon, { AbortIcon, LoadingIcon, WarningIcon, WorkingIcon } from '../../icons';
import Button from '../../widgets/FlatButton';
import OptionalPopoverWrapper from '../../widgets/OptionalPopoverWrapper';
import Confirm from '../../forms/Confirm';
import ResourceRenderer from '../../helpers/ResourceRenderer';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import DateTime from '../../widgets/DateTime';

const isFailedJobTooOld = failedJob => {
  const terminatedAt = (failedJob && failedJob.getIn(['data', 'terminatedAt'])) || Date.now() / 1000;
  return terminatedAt + 600 < Date.now() / 1000;
};

const ResubmitAllSolutions = ({
  assignmentId,
  resubmit,
  abort,
  isFetchPending = false,
  pendingJob = null,
  failedJob = null,
  question = (
    <FormattedMessage
      id="app.resubmitSolution.resubmitAllConfirm"
      defaultMessage="Are you sure you want to resubmit all solutions of all students for this assignment? This can take serious amount of time."
    />
  ),
}) => {
  if (isFailedJobTooOld(failedJob)) {
    failedJob = null;
  }

  return (
    <OptionalPopoverWrapper
      container={this}
      popoverId={`resubit-info-${assignmentId}`}
      placement="bottom"
      hide={!pendingJob && !failedJob}
      title={
        pendingJob ? (
          <FormattedMessage
            id="app.resubmitSolution.resubmitAll.pendingJobTitle"
            defaultMessage="Resubmitting in progress..."
          />
        ) : (
          <FormattedMessage
            id="app.resubmitSolution.resubmitAll.failedJobTitle"
            defaultMessage="An attempt for resubmit failed recently"
          />
        )
      }
      contents={
        <span>
          {(pendingJob || failedJob) && (
            <ResourceRenderer resource={pendingJob || failedJob}>
              {job =>
                job && (
                  <div className="small">
                    <p>
                      <FormattedMessage id="generic.createdAt" defaultMessage="Created at" />:{' '}
                      <DateTime unixts={job.createdAt} showRelative />
                    </p>

                    {pendingJob && (
                      <p>
                        <FormattedMessage id="generic.startedAt" defaultMessage="Started at" />:{' '}
                        <DateTime unixts={job.startedAt} emptyPlaceholder="-" showRelative />
                      </p>
                    )}

                    {!pendingJob && (
                      <p>
                        <FormattedMessage id="generic.terminatedAt" defaultMessage="Terminated at" />:{' '}
                        <DateTime unixts={job.terminatedAt} showRelative />
                      </p>
                    )}
                    {!pendingJob && (
                      <p>
                        <FormattedMessage id="generic.reason" defaultMessage="Reason" />: <code>{job.error}</code>
                      </p>
                    )}

                    <p>
                      <FormattedMessage
                        id="app.resubmitSolution.resubmitAll.jobCreatedBy"
                        defaultMessage="Initiated by"
                      />
                      : {job.createdBy ? <UsersNameContainer userId={job.createdBy} isSimple /> : '??'}
                    </p>

                    {pendingJob && (
                      <p className="text-center">
                        <Button bsSize="xs" bsStyle="danger" onClick={() => abort(job.id)}>
                          <AbortIcon gapRight />
                          <FormattedMessage id="app.asyncJobs.abort" defaultMessage="Abort background job" />
                        </Button>
                      </p>
                    )}
                  </div>
                )
              }
            </ResourceRenderer>
          )}
        </span>
      }>
      <span>
        <Confirm id={`confirm-${assignmentId}`} onConfirmed={resubmit} question={question}>
          <Button bsStyle="danger" disabled={isFetchPending || Boolean(pendingJob)}>
            {pendingJob ? (
              <WorkingIcon gapRight />
            ) : isFetchPending ? (
              <LoadingIcon gapRight />
            ) : failedJob ? (
              <WarningIcon gapRight />
            ) : (
              <Icon icon="redo" gapRight />
            )}
            <FormattedMessage id="app.resubmitSolution.resubmitAll" defaultMessage="Resubmit All" />
          </Button>
        </Confirm>
      </span>
    </OptionalPopoverWrapper>
  );
};

ResubmitAllSolutions.propTypes = {
  assignmentId: PropTypes.string.isRequired,
  resubmit: PropTypes.func.isRequired,
  abort: PropTypes.func.isRequired,
  isFetchPending: PropTypes.bool.isRequired,
  pendingJob: ImmutablePropTypes.map,
  failedJob: ImmutablePropTypes.map,
  question: PropTypes.any,
};

export default ResubmitAllSolutions;
