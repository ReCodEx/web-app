import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import classnames from 'classnames';
import Icon, {
  SuccessIcon,
  SuccessOrFailureIcon,
  VisibleIcon
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
  visibleFrom
}) =>
  <Box
    title={<FormattedMessage id="generic.details" defaultMessage="Details" />}
    noPadding
    collapsable
    isOpen={isOpen}
  >
    <Table responsive condensed>
      <tbody>
        <tr
          className={classnames({
            'text-danger': isAfterFirstDeadline
          })}
        >
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
            />:
          </th>
          <td>
            <DateTime unixts={firstDeadline} isDeadline showRelative />
          </td>
        </tr>

        {allowSecondDeadline &&
          <tr
            className={classnames({
              'text-danger': isAfterSecondDeadline
            })}
          >
            <td className="text-center shrink-col em-padding-left em-padding-right">
              <strong>
                {!isAfterSecondDeadline && <Icon icon="hourglass-half" />}
                {isAfterSecondDeadline && <Icon icon="hourglass-end" />}
              </strong>
            </td>
            <th>
              <FormattedMessage
                id="app.assignment.secondDeadline"
                defaultMessage="Second deadline:"
              />
            </th>
            <td>
              <DateTime unixts={secondDeadline} isDeadline showRelative />
            </td>
          </tr>}

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <Icon icon="cloud-upload-alt" />
          </td>
          <th>
            <FormattedMessage
              id="app.assignment.maxPoints"
              defaultMessage="Maximum number of points for a correct solution:"
            />
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
              defaultMessage="Submission count limit:"
            />
          </th>
          <td>
            {submissionsCountLimit === null ? '-' : submissionsCountLimit}
          </td>
        </tr>

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <Icon icon="coffee" />
          </td>
          <th>
            <FormattedMessage
              id="app.assignment.alreadySubmitted"
              defaultMessage="Already submitted:"
            />
          </th>
          <td>
            {canSubmit.submittedCount}
          </td>
        </tr>

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <Icon icon="unlock-alt" />
          </td>
          <th>
            <FormattedMessage
              id="app.assignment.canSubmit"
              defaultMessage="You can submit more solutions:"
            />
          </th>
          <td>
            <SuccessOrFailureIcon success={canSubmit.canSubmit} />
          </td>
        </tr>

        {visibleFrom &&
          <tr>
            <td className="text-center shrink-col em-padding-left em-padding-right">
              <VisibleIcon />
            </td>
            <th>
              <FormattedMessage
                id="app.assignment.visibleFrom"
                defaultMessage="Visible from"
              />:
            </th>
            <td>
              <DateTime unixts={visibleFrom} showRelative />
            </td>
          </tr>}

        {isBonus &&
          <tr>
            <td className="text-center shrink-col em-padding-left em-padding-right">
              <Icon icon="plus-circle" />
            </td>
            <th>
              <FormattedMessage
                id="app.assignment.isBonus"
                defaultMessage="Bonus assignment: "
              />
            </th>
            <td>
              <SuccessIcon />
            </td>
          </tr>}

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <Icon icon="percent" />
          </td>
          <th>
            <FormattedMessage
              id="app.assignment.pointsPercentualThreshold"
              defaultMessage="Points percentual threshold:"
            />
          </th>
          <td>
            {pointsPercentualThreshold * 100} %
          </td>
        </tr>

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <Icon icon="code" />
          </td>
          <th>
            <FormattedMessage
              id="app.assignment.runtimeEnvironmentsIds"
              defaultMessage="Allowed languages/frameworks/technologies: "
            />
          </th>
          <td>
            <EnvironmentsList runtimeEnvironments={runtimeEnvironments} />
          </td>
        </tr>
      </tbody>
    </Table>
  </Box>;

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
  visibleFrom: PropTypes.number.isRequired
};

export default AssignmentDetails;
