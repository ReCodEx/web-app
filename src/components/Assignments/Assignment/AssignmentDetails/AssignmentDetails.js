import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Icon from 'react-fontawesome';
import { Table, Label } from 'react-bootstrap';
import {
  FormattedDate,
  FormattedTime,
  FormattedMessage,
  FormattedRelative
} from 'react-intl';
import classnames from 'classnames';
import ResourceRenderer from '../../../helpers/ResourceRenderer';
import { SuccessIcon, MaybeSucceededIcon } from '../../../icons';
import Box from '../../../widgets/Box';

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
  canSubmit
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
              {!isAfterFirstDeadline && <Icon name="hourglass-start" />}
              {isAfterFirstDeadline && <Icon name="hourglass-end" />}
            </strong>
          </td>
          <td>
            <FormattedMessage
              id="app.assignment.deadline"
              defaultMessage="Deadline:"
            />
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
                {!isAfterSecondDeadline && <Icon name="hourglass-half" />}
                {isAfterSecondDeadline && <Icon name="hourglass-end" />}
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
            <Icon name="cloud-upload" />
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
            <Icon name="cloud-upload" />
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
            <Icon name="unlock-alt" />
          </td>
          <td>
            <FormattedMessage
              id="app.assignment.canSubmit"
              defaultMessage="You can submit more solutions:"
            />
          </td>
          <td>
            <ResourceRenderer resource={canSubmit}>
              {canSubmit => <MaybeSucceededIcon success={canSubmit} />}
            </ResourceRenderer>
          </td>
        </tr>
        {isBonus &&
          <tr>
            <td className="text-center">
              <Icon name="plus-circle" />
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
            <Icon name="code" />
          </td>
          <td>
            <FormattedMessage
              id="app.assignment.runtimeEnvironmentsIds"
              defaultMessage="Allowed languages/frameworks/technologies: "
            />
          </td>
          <td>
            {runtimeEnvironments.map(env =>
              <Label key={env.id} style={{ margin: '2px' }}>
                {env.name}
              </Label>
            )}
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
  canSubmit: ImmutablePropTypes.map
};

export default AssignmentDetails;
