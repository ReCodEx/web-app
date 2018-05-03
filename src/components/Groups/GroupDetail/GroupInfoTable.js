import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Table } from 'react-bootstrap';
import ReactMarkdown from 'react-remarkable';

import Box from '../../widgets/Box';
import { SuccessOrFailureIcon } from '../../icons';
import { getLocalizedDescription } from '../../../helpers/getLocalizedData';

const GroupInfoTable = ({
  group: {
    id,
    externalId,
    name,
    localizedTexts,
    primaryAdminsIds,
    childGroups,
    public: isPublic = false,
    privateData: { threshold, parentGroupId, ...privateGroup }
  },
  groups,
  supervisors,
  isAdmin,
  locale
}) =>
  <div>
    <Box
      title={
        <FormattedMessage
          id="app.groupDetail.description"
          defaultMessage="Group description"
        />
      }
      description={
        <ReactMarkdown
          source={getLocalizedDescription({ localizedTexts }, locale)}
        />
      }
      type="primary"
      collapsable
      noPadding
      unlimitedHeight
    >
      <Table>
        <tbody>
          {Boolean(externalId) &&
            <tr>
              <th>
                <FormattedMessage
                  id="app.groupDetail.externalId"
                  defaultMessage="External identification of the group:"
                />
              </th>
              <td>
                <code>
                  {externalId}
                </code>
              </td>
            </tr>}
          <tr>
            <th>
              <FormattedMessage
                id="app.groupDetail.isPublic"
                defaultMessage="Students can join this group themselves:"
              />
            </th>
            <td>
              <SuccessOrFailureIcon success={isPublic} />
            </td>
          </tr>
          {threshold !== null &&
            <tr>
              <th>
                <FormattedMessage
                  id="app.groupDetail.threshold"
                  defaultMessage="Minimum percent of the total points count needed to complete the course:"
                />
              </th>
              <td>
                <FormattedNumber value={threshold} style="percent" />
              </td>
            </tr>}
        </tbody>
      </Table>
    </Box>
  </div>;

GroupInfoTable.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.string.isRequired,
    parentGroupId: PropTypes.string,
    childGroups: PropTypes.shape({
      all: PropTypes.array,
      public: PropTypes.array.isRequired
    }),
    threshold: PropTypes.number,
    primaryAdminsIds: PropTypes.array.isRequired,
    public: PropTypes.bool,
    privateData: PropTypes.shape({
      supervisors: PropTypes.array.isRequired
    })
  }),
  groups: PropTypes.object.isRequired,
  supervisors: PropTypes.array.isRequired,
  isAdmin: PropTypes.bool,
  locale: PropTypes.string.isRequired
};

export default GroupInfoTable;
