import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import Icon, {
  BonusIcon,
  VisibleIcon,
  SuccessOrFailureIcon
} from '../../../icons';
import Box from '../../../widgets/Box';
import DateTime from '../../../widgets/DateTime';

const ShadowAssignmentDetails = ({
  maxPoints,
  isBonus,
  isPublic,
  createdAt,
  updatedAt,
  version,
  permissionHints
}) =>
  <Box
    title={<FormattedMessage id="generic.details" defaultMessage="Details" />}
    noPadding
  >
    <Table responsive condensed>
      <tbody>
        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <Icon icon="cloud-upload-alt" />
          </td>
          <th>
            <FormattedMessage
              id="app.shadowAssignment.maxPoints"
              defaultMessage="Points limit"
            />:
          </th>
          <td>
            <FormattedNumber value={maxPoints} />
          </td>
        </tr>

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <Icon icon={['far', 'clock']} />
          </td>
          <th>
            <FormattedMessage
              id="generic.createdAt"
              defaultMessage="Created at"
            />:
          </th>
          <td>
            <DateTime unixts={createdAt} />
          </td>
        </tr>

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <Icon icon={['far', 'copy']} />
          </td>
          <th>
            <FormattedMessage id="generic.version" defaultMessage="Version" />:
          </th>
          <td>
            <span className="em-padding-right">
              v<FormattedNumber value={version} />
            </span>
            {updatedAt !== createdAt &&
              <small className="text-muted">
                <FormattedMessage
                  id="generic.lastUpdatedAt"
                  defaultMessage="updated"
                />{' '}
                <DateTime unixts={updatedAt} showRelative />
              </small>}
          </td>
        </tr>

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <BonusIcon />
          </td>
          <th>
            <FormattedMessage
              id="app.shadowAssignment.isBonus"
              defaultMessage="Is bonus"
            />:
          </th>
          <td>
            <SuccessOrFailureIcon success={isBonus} />
          </td>
        </tr>

        {permissionHints.update &&
          <tr>
            <td className="text-center shrink-col em-padding-left em-padding-right">
              <VisibleIcon />
            </td>
            <th>
              <FormattedMessage
                id="app.shadowAssignment.isPublic"
                defaultMessage="Is visible to students"
              />:
            </th>
            <td>
              <SuccessOrFailureIcon success={isPublic} />
            </td>
          </tr>}
      </tbody>
    </Table>
  </Box>;

ShadowAssignmentDetails.propTypes = {
  maxPoints: PropTypes.number.isRequired,
  isBonus: PropTypes.bool,
  isPublic: PropTypes.bool,
  createdAt: PropTypes.number.isRequired,
  updatedAt: PropTypes.number.isRequired,
  version: PropTypes.number.isRequired,
  permissionHints: PropTypes.object
};

export default ShadowAssignmentDetails;
