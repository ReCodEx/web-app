import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import Icon, { SupervisorIcon } from '../../icons';
import UsersNameContainer from '../../../containers/UsersNameContainer';

import Box from '../../widgets/Box';
import DateTime from '../../widgets/DateTime';

const ShadowAssignmentPointsDetail = ({ points = null, awardedAt = null, authorId = null, note = '' }) => (
  <Box
    title={<FormattedMessage id="app.shadowAssignmentPointsDetail.title" defaultMessage="Awarded Points" />}
    noPadding>
    <Table responsive size="sm">
      <tbody>
        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <Icon icon={['far', 'star']} />
          </td>
          <th>
            <FormattedMessage id="app.shadowAssignmentPointsDetail.points" defaultMessage="Points" />:
          </th>
          <td>
            {points !== null ? (
              <FormattedNumber value={points} />
            ) : (
              <small className="text-muted">
                <FormattedMessage
                  id="app.shadowAssignmentPointsDetail.noPoints"
                  defaultMessage="no awarded points yet"
                />
              </small>
            )}
          </td>
        </tr>

        {points !== null && (
          <tr>
            <td className="text-center shrink-col em-padding-left em-padding-right">
              <Icon icon={['far', 'clock']} />
            </td>
            <th>
              <FormattedMessage id="app.shadowAssignmentPointsDetail.awardedAt" defaultMessage="Awarded at" />:
            </th>
            <td>{awardedAt !== null ? <DateTime unixts={awardedAt} showRelative /> : <span>&mdash;</span>}</td>
          </tr>
        )}

        {Boolean(authorId) && (
          <tr>
            <td className="text-center shrink-col em-padding-left em-padding-right">
              <SupervisorIcon />
            </td>
            <th>
              <FormattedMessage id="app.shadowAssignmentPointsDetail.awardedBy" defaultMessage="Awarded by" />:
            </th>
            <td>
              <UsersNameContainer userId={authorId} showEmail="icon" />
            </td>
          </tr>
        )}

        {Boolean(note) && (
          <tr>
            <td className="text-center shrink-col em-padding-left em-padding-right">
              <Icon icon={['far', 'sticky-note']} />
            </td>
            <th>
              <FormattedMessage id="app.shadowAssignmentPointsDetail.note" defaultMessage="Note" />:
            </th>
            <td>{note}</td>
          </tr>
        )}
      </tbody>
    </Table>
  </Box>
);

ShadowAssignmentPointsDetail.propTypes = {
  points: PropTypes.number,
  awardedAt: PropTypes.number,
  authorId: PropTypes.string,
  note: PropTypes.string,
};

export default ShadowAssignmentPointsDetail;
