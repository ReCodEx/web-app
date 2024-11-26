import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Table, Modal } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import Icon, {
  BonusIcon,
  DeadlineIcon,
  PointsGraphIcon,
  SendIcon,
  SuccessIcon,
  SuccessOrFailureIcon,
  CodeIcon,
  VisibleIcon,
} from '../../../icons';
import Box from '../../../widgets/Box';
import EnvironmentsList from '../../../helpers/EnvironmentsList';
import DateTime from '../../../widgets/DateTime';
import Explanation from '../../../widgets/Explanation';
import Button from '../../../widgets/TheButton';
import AssignmentDeadlinesGraph from '../AssignmentDeadlinesGraph';
import AssignmentMaxPoints from '../AssignmentMaxPoints';
import { getPointsAtTime } from '../AssignmentDeadlinesGraph/helpers.js';

const AssignmentDetails = ({
  isOpen = true,
  submissionsCountLimit,
  createdAt,
  firstDeadline,
  secondDeadline,
  allowSecondDeadline,
  maxPointsDeadlineInterpolation = false,
  maxPointsBeforeFirstDeadline,
  maxPointsBeforeSecondDeadline,
  isBonus,
  runtimeEnvironments,
  assignmentSolver = null,
  canSubmit,
  pointsPercentualThreshold,
  isPublic,
  visibleFrom,
  solutionFilesLimit,
  solutionSizeLimit,
  permissionHints,
  isStudent,
  className = '',
}) => {
  const [open, setOpen] = useState(false);

  const currentTime = Math.floor(Date.now() / 1000);
  const currentPointsLimit = getPointsAtTime(currentTime, {
    firstDeadline,
    secondDeadline,
    allowSecondDeadline,
    maxPointsDeadlineInterpolation,
    maxPointsBeforeFirstDeadline,
    maxPointsBeforeSecondDeadline,
  });

  const lastAttemptIndex = assignmentSolver && assignmentSolver.get('lastAttemptIndex');

  return (
    <Box
      title={<FormattedMessage id="generic.details" defaultMessage="Details" />}
      noPadding
      collapsable
      isOpen={isOpen}
      className={className}>
      <>
        <Table size="sm" className="card-table">
          <tbody>
            {permissionHints.update && (
              <tr>
                <td className="icon-col">
                  <VisibleIcon />
                </td>
                <th>
                  <FormattedMessage id="app.assignment.visible" defaultMessage="Visible to students" />:
                </th>
                <td>
                  <SuccessOrFailureIcon success={isPublic && (!visibleFrom || visibleFrom <= currentTime)} />
                </td>
              </tr>
            )}

            {permissionHints.update && (
              <tr>
                <td className="icon-col">
                  <Icon icon="plane-departure" />
                </td>
                <th>
                  <FormattedMessage id="generic.assignedAt" defaultMessage="Assigned at" />:
                  <Explanation id="assigned-at">
                    <FormattedMessage
                      id="app.assignment.assignedAtExplanation"
                      defaultMessage="The time of assignment creation. Note that the assignment may have been made visible to students at different time."
                    />
                  </Explanation>
                </th>
                <td>
                  <DateTime unixts={createdAt} showRelative />
                </td>
              </tr>
            )}

            {permissionHints.update && isPublic && visibleFrom && visibleFrom * 1000 > Date.now() && (
              <tr>
                <td className="icon-col">
                  <Icon icon={['far', 'clock']} />
                </td>
                <th>
                  <FormattedMessage id="app.assignment.visibleFrom" defaultMessage="Visible from" />:
                </th>
                <td>
                  <DateTime unixts={visibleFrom} showRelative />
                </td>
              </tr>
            )}

            <tr>
              <td className="icon-col">
                <DeadlineIcon />
              </td>
              <th>
                {allowSecondDeadline ? (
                  <>
                    <FormattedMessage id="app.assignment.deadlines" defaultMessage="Deadlines" />:
                    <Explanation id="deadlines">
                      <FormattedMessage
                        id="app.assignment.deadlinesExplanation"
                        defaultMessage="Solutions submitted before the first deadline are considered to be on time and graded with full points. Submissions made between the deadlines are considered to be late but still worth some points. Submissions made after the second deadline are evaluated, but awarded no points. Open the graph to see in detail how the deadlines affect the awarded points."
                      />
                    </Explanation>
                    {(maxPointsBeforeFirstDeadline !== 0 || maxPointsBeforeSecondDeadline !== 0) && (
                      <>
                        <br />
                        <Button variant="primary" onClick={() => setOpen(true)} size="xs" noShadow>
                          <PointsGraphIcon gapRight={2} />
                          <FormattedMessage id="app.assignment.deadlinesGraphButton" defaultMessage="Show Graph" />
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <FormattedMessage id="app.assignment.deadline" defaultMessage="Deadline" />:
                    <Explanation id="deadline">
                      <FormattedMessage
                        id="app.assignment.deadlineExplanation"
                        defaultMessage="Student submissions made after the deadline are evaluated, but awarded no points."
                      />
                    </Explanation>
                  </>
                )}
              </th>
              <td>
                <DateTime unixts={firstDeadline} isDeadline showRelative />
                {allowSecondDeadline && (
                  <>
                    <br />
                    <DateTime unixts={secondDeadline} isDeadline showRelative />
                  </>
                )}
              </td>
            </tr>

            <tr>
              <td className="icon-col">
                <Icon icon="trophy" />
              </td>
              <th>
                {allowSecondDeadline ? (
                  <>
                    <FormattedMessage id="app.assignment.maxPointsTwoLimits" defaultMessage="Points limits" />:
                    <Explanation id="maxPointsTwoLimits">
                      <FormattedMessage
                        id="app.assignment.maxPointsTwoLimitsExplanation"
                        defaultMessage="The actual limit is determined by the time of submission (i.e., whether it was before the first deadline or between the deadlines). The points limit applies to completely correct solutions, solutions with lower correctness are granted relative portion of these points."
                      />
                    </Explanation>
                  </>
                ) : (
                  <>
                    <FormattedMessage id="app.assignment.maxPoints" defaultMessage="Points limit" />:
                    <Explanation id="maxPoints">
                      <FormattedMessage
                        id="app.assignment.maxPointsExplanation"
                        defaultMessage="The amount of points awarded to completely correct solutions submitted before deadline. Solutions with lower correctness are granted relative portion of these points."
                      />
                    </Explanation>
                  </>
                )}
              </th>
              <td>
                <AssignmentMaxPoints
                  allowSecondDeadline={allowSecondDeadline}
                  maxPointsDeadlineInterpolation={maxPointsDeadlineInterpolation}
                  maxPointsBeforeFirstDeadline={maxPointsBeforeFirstDeadline}
                  maxPointsBeforeSecondDeadline={maxPointsBeforeSecondDeadline}
                  currentPointsLimit={currentPointsLimit}
                />
              </td>
            </tr>

            {isBonus && (
              <tr>
                <td className="icon-col">
                  <BonusIcon />
                </td>
                <th>
                  <FormattedMessage id="app.assignment.isBonus" defaultMessage="Bonus assignment" />:
                </th>
                <td>
                  <SuccessIcon className="text-success" />
                </td>
              </tr>
            )}

            <tr>
              <td className="icon-col">
                <Icon icon="percent" />
              </td>
              <th>
                <FormattedMessage id="app.assignment.corectnessThreshold" defaultMessage="Correctness threshold" />:
                <Explanation id="corectnessThreshold">
                  <FormattedMessage
                    id="app.assignment.corectnessThresholdExplanation"
                    defaultMessage="Minimal correctness of solutions required for awardnig any points. Solutions below this threshold are granted no points."
                  />
                </Explanation>
              </th>
              <td>{pointsPercentualThreshold} %</td>
            </tr>

            <tr>
              <td className="icon-col">
                <CodeIcon />
              </td>
              <th>
                <FormattedMessage id="app.assignment.runtimeEnvironmentsIds" defaultMessage="Allowed environments" />:
                <Explanation id="runtimeEnvironments">
                  <FormattedMessage
                    id="app.assignment.runtimeEnvironmentsExplanation"
                    defaultMessage="Allowed runtime environments (i.e., programming languages) that can be used for creating solutions. If multiple environments are allowed, the solution must choose only one (it is not possible to create crossover solutions)."
                  />
                </Explanation>
              </th>
              <td>
                <EnvironmentsList runtimeEnvironments={runtimeEnvironments} />
              </td>
            </tr>

            <tr>
              <td className="icon-col">{isStudent && canSubmit.canSubmit ? <SendIcon /> : <Icon icon="hashtag" />}</td>
              <th>
                <FormattedMessage id="app.assignment.submissionsCountLimit" defaultMessage="Submission attempts" />:
                <Explanation id="submissionsCountLimit">
                  <FormattedMessage
                    id="app.assignment.submissionsCountLimitExplanation"
                    defaultMessage="Maximal number of solutions logged by one student for this assignment. The teacher may choose to grant additional attempts by deleting old solutions."
                  />
                </Explanation>
              </th>
              <td>
                {isStudent ? (
                  <>
                    {lastAttemptIndex || canSubmit.total}
                    {canSubmit.total > canSubmit.evaluated && (
                      <span className="text-body-secondary">
                        {' '}
                        {canSubmit.evaluated - canSubmit.total}
                        <Explanation id="submissionsCountDecreased">
                          <FormattedMessage
                            id="app.assignment.submissionCounterDecreasedByNotEvaluated"
                            defaultMessage="Failed and not evaluated submissions are not counted when restricting submission attempts."
                            values={{ count: lastAttemptIndex - canSubmit.total }}
                          />
                        </Explanation>
                      </span>
                    )}
                    {submissionsCountLimit !== null && ` / ${submissionsCountLimit}`}
                    {lastAttemptIndex && lastAttemptIndex > canSubmit.total && (
                      <small className="ps-2 text-body-secondary">
                        (
                        <FormattedMessage
                          id="app.assignment.submissionCountLimitIncreasedByDeletion"
                          defaultMessage="+{count} {count, plural, one {attempt} other {attempts}} added by deleted solutions"
                          values={{ count: lastAttemptIndex - canSubmit.total }}
                        />
                        )
                      </small>
                    )}
                  </>
                ) : (
                  <>{submissionsCountLimit === null ? '-' : submissionsCountLimit}</>
                )}
              </td>
            </tr>

            <tr>
              <td className="icon-col">
                <Icon icon={['far', 'file-code']} />
              </td>
              <th>
                <FormattedMessage id="app.assignment.solutionFilesLimit" defaultMessage="Solution file restrictions" />:
                <Explanation id="solutionFilesLimit">
                  <FormattedMessage
                    id="app.assignment.solutionFilesLimitExplanation"
                    defaultMessage="The restrictions may limit maximal number of submitted files and their total size."
                  />
                </Explanation>
              </th>
              <td>
                {solutionFilesLimit !== null && (
                  <FormattedMessage
                    id="app.assignment.solutionFilesLimitCount"
                    defaultMessage="{count} {count, plural, one {file} other {files}}"
                    values={{ count: solutionFilesLimit }}
                  />
                )}
                {solutionFilesLimit !== null && solutionSizeLimit !== null && ', '}
                {solutionSizeLimit !== null && (
                  <FormattedMessage
                    id="app.assignment.solutionFilesLimitSize"
                    defaultMessage="{size} KiB {count, plural, one {} other {total}}"
                    values={{ size: Math.ceil(solutionSizeLimit / 1024), count: solutionFilesLimit || 0 }}
                  />
                )}
                {solutionFilesLimit === null && solutionSizeLimit === null && '-'}
              </td>
            </tr>
          </tbody>
        </Table>

        {(maxPointsBeforeFirstDeadline !== 0 || (allowSecondDeadline && maxPointsBeforeSecondDeadline !== 0)) && (
          <Modal show={open} backdrop="static" onHide={() => setOpen(false)} size="xl">
            <Modal.Header closeButton>
              <Modal.Title>
                <FormattedMessage
                  id="app.assignment.deadlinesGraphDialog.title"
                  defaultMessage="Visualization of points limits and corresponding deadlines"
                />
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <AssignmentDeadlinesGraph
                firstDeadline={firstDeadline}
                secondDeadline={secondDeadline}
                maxPointsBeforeFirstDeadline={maxPointsBeforeFirstDeadline}
                maxPointsBeforeSecondDeadline={maxPointsBeforeSecondDeadline}
                allowSecondDeadline={allowSecondDeadline}
                maxPointsDeadlineInterpolation={maxPointsDeadlineInterpolation}
                markerTime={currentTime}
                markerPoints={currentPointsLimit}
              />
            </Modal.Body>
          </Modal>
        )}
      </>
    </Box>
  );
};

AssignmentDetails.propTypes = {
  isOpen: PropTypes.bool,
  submissionsCountLimit: PropTypes.any.isRequired,
  createdAt: PropTypes.number.isRequired,
  firstDeadline: PropTypes.number.isRequired,
  secondDeadline: PropTypes.number,
  allowSecondDeadline: PropTypes.bool.isRequired,
  maxPointsDeadlineInterpolation: PropTypes.bool,
  maxPointsBeforeFirstDeadline: PropTypes.number.isRequired,
  maxPointsBeforeSecondDeadline: PropTypes.number,
  isBonus: PropTypes.bool,
  runtimeEnvironments: PropTypes.array,
  canSubmit: PropTypes.object,
  pointsPercentualThreshold: PropTypes.number,
  visibleFrom: PropTypes.number,
  solutionFilesLimit: PropTypes.number,
  solutionSizeLimit: PropTypes.number,
  isPublic: PropTypes.bool.isRequired,
  permissionHints: PropTypes.object.isRequired,
  isStudent: PropTypes.bool.isRequired,
  className: PropTypes.string,
  assignmentSolver: ImmutablePropTypes.map,
};

export default AssignmentDetails;
