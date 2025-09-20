import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Table } from 'react-bootstrap';

import Box from '../../widgets/Box';
import Callout from '../../widgets/Callout';
import Markdown from '../../widgets/Markdown';
import { SuccessOrFailureIcon } from '../../icons';
import { getLocalizedDescription } from '../../../helpers/localizedData.js';

const getDescription = (localizedTexts, locale) => {
  const description = getLocalizedDescription({ localizedTexts }, locale);
  return description ? (
    <Markdown source={description} />
  ) : (
    <p className="small text-body-secondary text-center well well-sm">
      <FormattedMessage
        id="app.groupDetail.noDescription"
        defaultMessage="The group has no description in any language."
      />
    </p>
  );
};

const GroupInfoTable = ({
  group: { organizational, localizedTexts, public: isPublic = false, privateData },
  isAdmin,
  locale,
}) => (
  <div>
    <Box
      title={<FormattedMessage id="app.groupDetail.description" defaultMessage="Group Description" />}
      description={getDescription(localizedTexts, locale)}
      type="primary"
      collapsable
      noPadding
      unlimitedHeight>
      <Table>
        <tbody>
          {!organizational && privateData && (
            <tr>
              <th>
                <FormattedMessage
                  id="app.groupDetail.hasPublicStats"
                  defaultMessage="Students can see progress of other students"
                />
                :
              </th>
              <td>
                <SuccessOrFailureIcon success={privateData.publicStats} />
              </td>
            </tr>
          )}
          {!organizational && (
            <tr>
              <th>
                <FormattedMessage id="app.groupDetail.isPublic" defaultMessage="Everyone can see and join this group" />
                :
              </th>
              <td>
                <SuccessOrFailureIcon success={isPublic} />
              </td>
            </tr>
          )}
          {privateData && Boolean(privateData.threshold) && !organizational && (
            <tr>
              <th>
                <FormattedMessage
                  id="app.groupDetail.threshold"
                  defaultMessage="Minimum percent of the total points count needed to complete the course"
                />
                :
              </th>
              <td>
                <FormattedNumber value={privateData.threshold} style="percent" />
              </td>
            </tr>
          )}
          {privateData && Boolean(privateData.pointsLimit) && !organizational && (
            <tr>
              <th>
                <FormattedMessage
                  id="app.groupDetail.pointsLimit"
                  defaultMessage="Minimal amount of points needed to complete the course"
                />
                :
              </th>
              <td>
                <FormattedNumber value={privateData.pointsLimit} />
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Box>
    {isPublic && isAdmin && (
      <Callout variant="warning">
        <FormattedMessage
          id="app.group.isPublicWarning"
          defaultMessage="The group is public, which means that everyone can see this group and join it."
        />
      </Callout>
    )}
  </div>
);

GroupInfoTable.propTypes = {
  group: PropTypes.shape({
    parentGroupId: PropTypes.string,
    threshold: PropTypes.number,
    public: PropTypes.bool.isRequired,
    organizational: PropTypes.bool.isRequired,
    localizedTexts: PropTypes.array,
    privateData: PropTypes.shape({
      threshold: PropTypes.number,
      pointsLimit: PropTypes.number,
      publicStats: PropTypes.bool.isRequired,
    }),
  }),
  isAdmin: PropTypes.bool,
  locale: PropTypes.string.isRequired,
};

export default GroupInfoTable;
