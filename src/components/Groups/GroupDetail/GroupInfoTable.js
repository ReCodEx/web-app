import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Table } from 'react-bootstrap';

import Box from '../../widgets/Box';
import Callout from '../../widgets/Callout';
import Markdown from '../../widgets/Markdown';
import { SuccessOrFailureIcon } from '../../icons';
import { getLocalizedDescription } from '../../../helpers/localizedData';
import { objectMap, identity } from '../../../helpers/common';

const knownBindingProviderLabels = {
  sis: <FormattedMessage id="app.groupDetail.bindings.sis" defaultMessage="SIS UK scheduling event codes" />,
};

const getDescription = (localizedTexts, locale) => {
  const description = getLocalizedDescription({ localizedTexts }, locale);
  return description ? (
    <Markdown source={description} />
  ) : (
    <p className="small text-muted text-center well well-sm">
      <FormattedMessage
        id="app.groupDetail.noDescription"
        defaultMessage="The group has no description in any language."
      />
    </p>
  );
};

const GroupInfoTable = ({
  group: {
    id,
    externalId,
    organizational,
    localizedTexts,
    primaryAdminsIds,
    public: isPublic = false,
    privateData: { threshold, publicStats, bindings },
  },
  groups,
  supervisors,
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
          {!organizational && (
            <tr>
              <th>
                <FormattedMessage
                  id="app.groupDetail.hasPublicStats"
                  defaultMessage="Students can see progress of other students"
                />
                :
              </th>
              <td>
                <SuccessOrFailureIcon success={publicStats} />
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
          {threshold !== null && !organizational && (
            <tr>
              <th>
                <FormattedMessage
                  id="app.groupDetail.threshold"
                  defaultMessage="Minimum percent of the total points count needed to complete the course"
                />
                :
              </th>
              <td>
                <FormattedNumber value={threshold} style="percent" />
              </td>
            </tr>
          )}
          {Boolean(externalId) && (
            <tr>
              <th>
                <FormattedMessage
                  id="app.groupDetail.externalId"
                  defaultMessage="External identification of the group"
                />
                :
              </th>
              <td>
                <code>{externalId}</code>
              </td>
            </tr>
          )}

          {bindings &&
            Object.values(
              objectMap(bindings, (codes, provider) =>
                codes && codes.length > 0 ? (
                  <tr key={`bindings-${provider}`}>
                    <th>
                      {knownBindingProviderLabels[provider] || (
                        <FormattedMessage
                          id="app.groupDetail.bindings.genericProvider"
                          defaultMessage='External binding to "{provider}"'
                        />
                      )}
                      :
                    </th>
                    <td>
                      {codes.map(code => (
                        <div key={`bindings-${provider}-${code}`}>
                          <code>{code}</code>
                        </div>
                      ))}
                    </td>
                  </tr>
                ) : null
              )
            ).filter(identity)}
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
    id: PropTypes.string.isRequired,
    externalId: PropTypes.string,
    parentGroupId: PropTypes.string,
    threshold: PropTypes.number,
    primaryAdminsIds: PropTypes.array.isRequired,
    public: PropTypes.bool.isRequired,
    organizational: PropTypes.bool.isRequired,
    localizedTexts: PropTypes.array,
    privateData: PropTypes.shape({
      threshold: PropTypes.number,
      publicStats: PropTypes.bool.isRequired,
      bindings: PropTypes.object,
    }),
  }),
  groups: PropTypes.object.isRequired,
  supervisors: PropTypes.array.isRequired,
  isAdmin: PropTypes.bool,
  locale: PropTypes.string.isRequired,
};

export default GroupInfoTable;
