import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { FormattedMessage, FormattedNumber } from 'react-intl';

import Icon, { BonusIcon, VisibleIcon, SuccessOrFailureIcon, DeadlineIcon } from '../../../icons';
import Box from '../../../widgets/Box';
import Explanation from '../../../widgets/Explanation';
import DateTime from '../../../widgets/DateTime';
import Version from '../../../widgets/Version/Version.js';

const ShadowAssignmentDetail = ({
  maxPoints,
  isBonus,
  isPublic,
  createdAt,
  deadline,
  updatedAt,
  version,
  permissionHints,
}) => (
  <Box title={<FormattedMessage id="generic.details" defaultMessage="Details" />} noPadding>
    <Table size="sm" className="card-table">
      <tbody>
        <tr>
          <td className="icon-col">
            <Icon icon="cloud-upload-alt" />
          </td>
          <th>
            <FormattedMessage id="app.shadowAssignment.maxPoints" defaultMessage="Points limit" />:
            <Explanation id="pointsExplanation">
              <FormattedMessage
                id="app.editShadowAssignmentForm.pointsExplanation"
                defaultMessage="The maximal amount of points has only informative value for the students. The supervisor may choose to exceed this limit when awarding points."
              />
            </Explanation>
          </th>
          <td>
            <FormattedNumber value={maxPoints} />
          </td>
        </tr>

        <tr>
          <td className="icon-col">
            <Icon icon={['far', 'clock']} />
          </td>
          <th>
            <FormattedMessage id="generic.createdAt" defaultMessage="Created at" />:
          </th>
          <td>
            <DateTime unixts={createdAt} />
          </td>
        </tr>

        <tr>
          <td className="icon-col">
            <DeadlineIcon />
          </td>
          <th>
            <FormattedMessage id="app.assignment.deadline" defaultMessage="Deadline" />:
            <Explanation id="deadlineExplanation">
              <FormattedMessage
                id="app.shadowAssignment.deadlineExplanation"
                defaultMessage="The deadline has only informative value for the students. The points are awarded manually, so the supervisor ultimately decides whether a deadline was breached or not."
              />
            </Explanation>
          </th>
          <td>
            <DateTime unixts={deadline} isDeadline />
          </td>
        </tr>

        <tr>
          <td className="icon-col">
            <Icon icon={['far', 'copy']} />
          </td>
          <th>
            <FormattedMessage id="generic.version" defaultMessage="Version" />:
          </th>
          <td>
            <Version version={version} createdAt={createdAt} updatedAt={updatedAt} />
          </td>
        </tr>

        <tr>
          <td className="icon-col">
            <BonusIcon />
          </td>
          <th>
            <FormattedMessage id="app.shadowAssignment.isBonus" defaultMessage="Is bonus" />:
          </th>
          <td>
            <SuccessOrFailureIcon success={isBonus} />
          </td>
        </tr>

        {permissionHints.update && (
          <tr>
            <td className="icon-col">
              <VisibleIcon />
            </td>
            <th>
              <FormattedMessage id="app.shadowAssignment.isPublic" defaultMessage="Is visible to students" />:
            </th>
            <td>
              <SuccessOrFailureIcon success={isPublic} />
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  </Box>
);

ShadowAssignmentDetail.propTypes = {
  maxPoints: PropTypes.number.isRequired,
  isBonus: PropTypes.bool,
  isPublic: PropTypes.bool,
  createdAt: PropTypes.number.isRequired,
  deadline: PropTypes.number,
  updatedAt: PropTypes.number.isRequired,
  version: PropTypes.number.isRequired,
  permissionHints: PropTypes.object,
};

export default ShadowAssignmentDetail;
