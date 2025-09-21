import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Table } from 'react-bootstrap';

import Box from '../../widgets/Box';
import Callout from '../../widgets/Callout';
import Markdown from '../../widgets/Markdown';
import { InstanceIcon, SuccessOrFailureIcon } from '../../icons';
import { getLocalizedDescription } from '../../../helpers/localizedData.js';
import ResourceRenderer from '../../helpers/ResourceRenderer/ResourceRenderer.js';

import { getConfigVar } from '../../../helpers/config.js';
import InsetPanel from '../../widgets/InsetPanel/InsetPanel.js';

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

const EXTERNAL_ATTRIBUTES = getConfigVar('EXTERNAL_ATTRIBUTES', {});

const getLocalizedLabel = (label, locale) => {
  if (typeof label === 'object') {
    if (locale in label) {
      return label[locale];
    }
    if ('en' in label) {
      return label.en;
    }
    const keys = Object.keys(label);
    if (keys.length > 0) {
      return label[keys[0]];
    }
  }
  return typeof label === 'string' ? label : null;
};

const translateAttributeService = (service, locale) => {
  const name = EXTERNAL_ATTRIBUTES[service]?.NAME;
  return (name && getLocalizedLabel(name, locale)) || null;
};

const translateAttributeKey = (service, key, locale) => {
  const name = EXTERNAL_ATTRIBUTES[service]?.KEYS[key];
  return (name && getLocalizedLabel(name, locale)) || null;
};

const GroupInfoTable = ({
  group: { organizational, localizedTexts, public: isPublic = false, privateData },
  externalAttributes,
  isAdmin,
  locale,
}) => (
  <div>
    <Box
      title={<FormattedMessage id="app.groupDetail.description" defaultMessage="Group Description" />}
      type="primary"
      collapsable
      noPadding
      unlimitedHeight>
      <>
        <InsetPanel className="m-3">{getDescription(localizedTexts, locale)}</InsetPanel>
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
                  <FormattedMessage
                    id="app.groupDetail.isPublic"
                    defaultMessage="Everyone can see and join this group"
                  />
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

        {externalAttributes && (
          <ResourceRenderer resource={externalAttributes}>
            {attributes => (
              <Table borderless size="sm">
                <thead>
                  <tr>
                    <th colSpan={5}>
                      <FormattedMessage id="app.groupDetail.externalAttributes" defaultMessage="External Attributes:" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attributes.map(({ id, service, key, value }) => (
                    <tr key={id}>
                      <td className="shrink-col text-nowrap">
                        <InstanceIcon gapLeft gapRight className="text-muted" />
                        {translateAttributeService(service, locale) || <code>{service}</code>}
                      </td>
                      <td className="text-center shrink-col opacity-50 small">❭</td>
                      <td className="shrink-col text-nowrap">
                        {translateAttributeKey(service, key, locale) || <code>{key}</code>}
                      </td>
                      <td className="text-center shrink-col opacity-50 small">❭</td>
                      <td>
                        <code>{value}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </ResourceRenderer>
        )}
      </>
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
  externalAttributes: ImmutablePropTypes.map,
  isAdmin: PropTypes.bool,
  locale: PropTypes.string.isRequired,
};

export default GroupInfoTable;
