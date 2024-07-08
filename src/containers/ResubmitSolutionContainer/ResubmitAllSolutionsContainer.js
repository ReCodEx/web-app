import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';

import { ResubmitAllSolutions } from '../../components/buttons/ResubmitSolution';
import { fetchResubmitAllStatus, resubmitAllSolutions } from '../../redux/modules/assignments.js';
import { abort } from '../../redux/modules/asyncJobs.js';
import {
  isResubmitAllFetchPending,
  getResubmitAllPendingJob,
  getResubmitAllFailedJob,
} from '../../redux/selectors/assignments.js';

const POLLING_INTERVAL = 5000; // 5s, when async job is pending
const LONG_POLLING_INTERVAL = 60000; // 1 minute, when failed job is pending

const ResubmitAllSolutionsContainer = ({
  assignmentId,
  isFetchPending,
  pendingJob,
  failedJob,
  fetchStatus,
  ...props
}) => {
  const [lastTimeFetchStarted, setLastTimeFetchStarted] = useState(null);

  useEffect(() => {
    if (!isFetchPending) {
      if (
        lastTimeFetchStarted === null ||
        (pendingJob && Date.now() - lastTimeFetchStarted.getTime() > POLLING_INTERVAL)
      ) {
        // start fetch right away
        fetchStatus();
        setLastTimeFetchStarted(new Date());
      } else if (pendingJob || failedJob) {
        // postpone next fetch
        setLastTimeFetchStarted(new Date());
        const timerId = window.setTimeout(fetchStatus, pendingJob ? POLLING_INTERVAL : LONG_POLLING_INTERVAL);
        return () => {
          window.clearTimeout(timerId);
        };
      }
    }
  }, [assignmentId, isFetchPending]);

  return (
    <ResubmitAllSolutions
      assignmentId={assignmentId}
      isFetchPending={isFetchPending}
      pendingJob={pendingJob}
      failedJob={failedJob}
      {...props}
    />
  );
};

ResubmitAllSolutionsContainer.propTypes = {
  assignmentId: PropTypes.string.isRequired,
  isFetchPending: PropTypes.bool.isRequired,
  pendingJob: ImmutablePropTypes.map,
  failedJob: ImmutablePropTypes.map,
  resubmit: PropTypes.func.isRequired,
  fetchStatus: PropTypes.func.isRequired,
  abort: PropTypes.func.isRequired,
};

const mapStateToProps = (state, { assignmentId }) => ({
  isFetchPending: isResubmitAllFetchPending(state, assignmentId),
  pendingJob: getResubmitAllPendingJob(state, assignmentId),
  failedJob: getResubmitAllFailedJob(state, assignmentId),
});

const mapDispatchToProps = (dispatch, { assignmentId }) => ({
  fetchStatus: () => dispatch(fetchResubmitAllStatus(assignmentId)),
  resubmit: () => dispatch(resubmitAllSolutions(assignmentId)),
  abort: jobId => dispatch(abort(jobId)).then(() => dispatch(fetchResubmitAllStatus(assignmentId))),
});

export default connect(mapStateToProps, mapDispatchToProps)(ResubmitAllSolutionsContainer);
