import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import classnames from 'classnames';
import Icon, {
  SuccessIcon,
  SuccessOrFailureIcon,
  CodeIcon,
  VisibleIcon,
} from '../../../icons';
import Box from '../../../widgets/Box';
import EnvironmentsList from '../../../helpers/EnvironmentsList';
import DateTime from '../../../widgets/DateTime';

const AssignmentDetails = ({
  isOpen = true,
  submissionsCountLimit,
  firstDeadline,
  secondDeadline,
  allowSecondDeadline,
  maxPointsBeforeFirstDeadline,
  maxPointsBeforeSecondDeadline,
  isAfterFirstDeadline,
  isAfterSecondDeadline,
  isBonus,
  runtimeEnvironments,
  canSubmit,
  pointsPercentualThreshold,
  isPublic,
  visibleFrom,
  permissionHints,
  isStudent,
}) => (
  <Box
    title={<FormattedMessage id="generic.details" defaultMessage="Details" />}
    noPadding
    collapsable
    isOpen={isOpen}>
    <Table responsive condensed>
      <tbody>
        {permissionHints.update && (
          <tr>
            <td className="text-center shrink-col em-padding-left em-padding-right">
              <VisibleIcon />
            </td>
            <th>
              <FormattedMessage
                id="app.assignment.visible"
                defaultMessage="Visible"
              />
              :
            </th>
            <td>
              <SuccessOrFailureIcon
                success={
                  isPublic && (!visibleFrom || visibleFrom * 1000 <= Date.now())
                }
              />
            </td>
          </tr>
        )}

        {permissionHints.update &&
          isPublic &&
          visibleFrom &&
          visibleFrom * 1000 > Date.now() && (
            <tr>
              <td className="text-center shrink-col em-padding-left em-padding-right">
                <Icon icon={['far', 'clock']} />
              </td>
              <th>
                <FormattedMessage
                  id="app.assignment.visibleFrom"
                  defaultMessage="Visible from"
                />
                :
              </th>
              <td>
                <DateTime unixts={visibleFrom} showRelative />
              </td>
            </tr>
          )}

        <tr
          className={classnames({
            'text-danger': isAfterFirstDeadline,
          })}>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <strong>
              {!isAfterFirstDeadline && <Icon icon="hourglass-start" />}
              {isAfterFirstDeadline && <Icon icon="hourglass-end" />}
            </strong>
          </td>
          <th>
            <FormattedMessage
              id="app.assignment.deadline"
              defaultMessage="Deadline"
            />
            :
          </th>
          <td>
            <DateTime unixts={firstDeadline} isDeadline showRelative />
          </td>
        </tr>

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <Icon icon="cloud-upload-alt" />
          </td>
          <th>
            <FormattedMessage
              id="app.assignment.maxPointsFirst"
              defaultMessage="Max. points before 1st deadline"
            />
            :
          </th>
          <td>{maxPointsBeforeFirstDeadline}</td>
        </tr>

        {allowSecondDeadline && (
          <React.Fragment>
            <tr
              className={classnames({
                'text-danger': isAfterSecondDeadline,
              })}>
              <td className="text-center shrink-col em-padding-left em-padding-right">
                <strong>
                  {!isAfterSecondDeadline && <Icon icon="hourglass-half" />}
                  {isAfterSecondDeadline && <Icon icon="hourglass-end" />}
                </strong>
              </td>
              <th>
                <FormattedMessage
                  id="app.assignment.secondDeadline"
                  defaultMessage="Second deadline"
                />
                :
              </th>
              <td>
                <DateTime unixts={secondDeadline} isDeadline showRelative />
              </td>
            </tr>

            <tr>
              <td className="text-center shrink-col em-padding-left em-padding-right">
                <Icon icon="cloud-upload-alt" />
              </td>
              <th>
                <FormattedMessage
                  id="app.assignment.maxPointsSecond"
                  defaultMessage="Max. points before 2nd deadline"
                />
                :
              </th>
              <td>{maxPointsBeforeSecondDeadline}</td>
            </tr>
          </React.Fragment>
        )}

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <Icon icon="cloud-upload-alt" />
          </td>
          <th>
            <FormattedMessage
              id="app.assignment.maxPointsCurrent"
              defaultMessage="Max. points (at present time)"
            />
            :
          </th>
          <td>
            {!isAfterFirstDeadline
              ? maxPointsBeforeFirstDeadline
              : !isAfterSecondDeadline && allowSecondDeadline
              ? maxPointsBeforeSecondDeadline
              : 0}
          </td>
        </tr>

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <Icon icon="ban" />
          </td>
          <th>
            <FormattedMessage
              id="app.assignment.submissionsCountLimit"
              defaultMessage="Submission count limit"
            />
            :
          </th>
          <td>
            {submissionsCountLimit === null ? '-' : submissionsCountLimit}
          </td>
        </tr>

        {isStudent && (
          <tr>
            <td className="text-center shrink-col em-padding-left em-padding-right">
              <Icon icon="coffee" />
            </td>
            <th>
              <FormattedMessage
                id="app.assignment.alreadySubmitted"
                defaultMessage="Already submitted"
              />
              :
            </th>
            <td>{canSubmit.submittedCount}</td>
          </tr>
        )}

        {isStudent && (
          <tr>
            <td className="text-center shrink-col em-padding-left em-padding-right">
              <Icon icon="unlock-alt" />
            </td>
            <th>
              <FormattedMessage
                id="app.assignment.canSubmit"
                defaultMessage="Can submit more solutions"
              />
              :
            </th>
            <td>
              <SuccessOrFailureIcon success={canSubmit.canSubmit} />
            </td>
          </tr>
        )}

        {isBonus && (
          <tr>
            <td className="text-center shrink-col em-padding-left em-padding-right">
              <Icon icon="plus-circle" />
            </td>
            <th>
              <FormattedMessage
                id="app.assignment.isBonus"
                defaultMessage="Bonus assignment"
              />
              :
            </th>
            <td>
              <SuccessIcon />
            </td>
          </tr>
        )}

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <Icon icon="percent" />
          </td>
          <th>
            <FormattedMessage
              id="app.assignment.pointsPercentualThreshold"
              defaultMessage="Points percentual threshold"
            />
            :
          </th>
          <td>{pointsPercentualThreshold} %</td>
        </tr>

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <CodeIcon />
          </td>
          <th>
            <FormattedMessage
              id="app.assignment.runtimeEnvironmentsIds"
              defaultMessage="Allowed languages/frameworks/technologies"
            />
            :
          </th>
          <td>
            <EnvironmentsList runtimeEnvironments={runtimeEnvironments} />
          </td>
        </tr>
      </tbody>
    </Table>
  </Box>
);

AssignmentDetails.propTypes = {
  isOpen: PropTypes.bool,
  submissionsCountLimit: PropTypes.any.isRequired,
  firstDeadline: PropTypes.number.isRequired,
  secondDeadline: PropTypes.number,
  allowSecondDeadline: PropTypes.bool.isRequired,
  maxPointsBeforeFirstDeadline: PropTypes.number.isRequired,
  maxPointsBeforeSecondDeadline: PropTypes.number,
  isAfterFirstDeadline: PropTypes.bool.isRequired,
  isAfterSecondDeadline: PropTypes.bool.isRequired,
  isBonus: PropTypes.bool,
  runtimeEnvironments: PropTypes.array,
  canSubmit: PropTypes.object,
  pointsPercentualThreshold: PropTypes.number,
  visibleFrom: PropTypes.number,
  isPublic: PropTypes.bool.isRequired,
  permissionHints: PropTypes.object.isRequired,
  isStudent: PropTypes.bool.isRequired,
};

export default AssignmentDetails;
