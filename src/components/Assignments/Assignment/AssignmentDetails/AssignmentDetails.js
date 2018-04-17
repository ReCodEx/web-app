import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { Table } from 'react-bootstrap';
import {
  FormattedDate,
  FormattedTime,
  FormattedMessage,
  FormattedRelative
} from 'react-intl';
import classnames from 'classnames';
import { SuccessIcon, SuccessOrFailureIcon } from '../../../icons';
import Box from '../../../widgets/Box';
import EnvironmentsList from '../../../helpers/EnvironmentsList';

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
  pointsPercentualThreshold
}) =>
  <Box
    title={
      <FormattedMessage id="app.assignment.title" defaultMessage="Details" />
    }
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
          <td className="text-center">
            <strong>
              {!isAfterFirstDeadline &&
                <FontAwesomeIcon icon="hourglass-start" />}
              {isAfterFirstDeadline && <FontAwesomeIcon icon="hourglass-end" />}
            </strong>
          </td>
          <td>
            <FormattedMessage
              id="app.assignment.deadline"
              defaultMessage="Deadline"
            />:
          </td>
          <td>
            <strong>
              <FormattedDate value={new Date(firstDeadline * 1000)} /> &nbsp;{' '}
              <FormattedTime value={new Date(firstDeadline * 1000)} />
            </strong>{' '}
            (<FormattedRelative value={new Date(firstDeadline * 1000)} />)
          </td>
        </tr>
        {allowSecondDeadline &&
          <tr
            className={classnames({
              'text-danger': isAfterSecondDeadline
            })}
          >
            <td className="text-center">
              <strong>
                {!isAfterSecondDeadline &&
                  <FontAwesomeIcon icon="hourglass-half" />}
                {isAfterSecondDeadline &&
                  <FontAwesomeIcon icon="hourglass-end" />}
              </strong>
            </td>
            <td>
              <FormattedMessage
                id="app.assignment.secondDeadline"
                defaultMessage="Second deadline:"
              />
            </td>
            <td>
              <strong>
                <FormattedDate value={new Date(secondDeadline * 1000)} /> &nbsp;{' '}
                <FormattedTime value={new Date(secondDeadline * 1000)} />
              </strong>{' '}
              (
              <FormattedRelative value={new Date(secondDeadline * 1000)} />
              )
            </td>
          </tr>}
        <tr>
          <td className="text-center">
            <FontAwesomeIcon icon="cloud-upload-alt" />
          </td>
          <td>
            <FormattedMessage
              id="app.assignment.maxPoints"
              defaultMessage="Maximum number of points for a correct solution:"
            />
          </td>
          <td>
            {!isAfterFirstDeadline
              ? maxPointsBeforeFirstDeadline
              : !isAfterSecondDeadline && allowSecondDeadline
                ? maxPointsBeforeSecondDeadline
                : 0}
          </td>
        </tr>
        <tr>
          <td className="text-center">
            <FontAwesomeIcon icon="ban" />
          </td>
          <td>
            <FormattedMessage
              id="app.assignment.submissionsCountLimit"
              defaultMessage="Submission count limit:"
            />
          </td>
          <td>
            {submissionsCountLimit === null ? '-' : submissionsCountLimit}
          </td>
        </tr>
        <tr>
          <td className="text-center">
            <FontAwesomeIcon icon="coffee" />
          </td>
          <td>
            <FormattedMessage
              id="app.assignment.alreadySubmitted"
              defaultMessage="Already submitted:"
            />
          </td>
          <td>
            {canSubmit.submittedCount}
          </td>
        </tr>
        <tr>
          <td className="text-center">
            <FontAwesomeIcon icon="unlock-alt" />
          </td>
          <td>
            <FormattedMessage
              id="app.assignment.canSubmit"
              defaultMessage="You can submit more solutions:"
            />
          </td>
          <td>
            <SuccessOrFailureIcon success={canSubmit.canSubmit} />
          </td>
        </tr>
        {isBonus &&
          <tr>
            <td className="text-center">
              <FontAwesomeIcon icon="plus-circle" />
            </td>
            <td>
              <FormattedMessage
                id="app.assignment.isBonus"
                defaultMessage="Bonus assignment: "
              />
            </td>
            <td>
              <SuccessIcon />
            </td>
          </tr>}
        <tr>
          <td className="text-center">
            <FontAwesomeIcon icon="percent" />
          </td>
          <td>
            <FormattedMessage
              id="app.assignment.pointsPercentualThreshold"
              defaultMessage="Points percentual threshold:"
            />
          </td>
          <td>
            {pointsPercentualThreshold * 100} %
          </td>
        </tr>
        <tr>
          <td className="text-center">
            <FontAwesomeIcon icon="code" />
          </td>
          <td>
            <FormattedMessage
              id="app.assignment.runtimeEnvironmentsIds"
              defaultMessage="Allowed languages/frameworks/technologies: "
            />
          </td>
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
  pointsPercentualThreshold: PropTypes.number
};

export default AssignmentDetails;
