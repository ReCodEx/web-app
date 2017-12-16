import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, FormattedNumber, injectIntl } from 'react-intl';
import { Row, Col, Table } from 'react-bootstrap';
import ReactMarkdown from 'react-remarkable';

import Box from '../../widgets/Box';
import SupervisorsList from '../../Users/SupervisorsList';
import { MaybeSucceededIcon } from '../../icons';
import GroupTree from '../GroupTree';
import {
  getLocalizedName,
  getLocalizedDescription
} from '../../../helpers/getLocalizedData';

const GroupDetail = ({
  group: {
    id,
    externalId,
    name,
    localizedTexts,
    description,
    threshold,
    parentGroupId,
    isPublic = false,
    childGroups,
    primaryAdminsIds,
    ...group
  },
  groups,
  publicGroups,
  supervisors,
  isAdmin,
  intl: { locale }
}) =>
  <div>
    <Row>
      <Col lg={6} sm={12}>
        <Row>
          <Col sm={12}>
            <Box
              title={
                <FormattedMessage
                  id="app.groupDetail.description"
                  defaultMessage="Group description"
                />
              }
              description={
                <ReactMarkdown
                  source={getLocalizedDescription(
                    { description, localizedTexts },
                    locale
                  )}
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
                      <MaybeSucceededIcon success={isPublic} />
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
          </Col>
        </Row>
        {childGroups.all.length > 0 &&
          <Row>
            <Col sm={12}>
              <Box
                title={
                  <FormattedMessage
                    id="app.groupDetail.subgroups"
                    defaultMessage="Subgroups hierarchy"
                  />
                }
                unlimitedHeight
              >
                <GroupTree
                  id={id}
                  deletable={false}
                  isAdmin={isAdmin}
                  isOpen
                  groups={publicGroups}
                  level={1}
                />
              </Box>
            </Col>
          </Row>}
      </Col>
      <Col lg={6} sm={12}>
        <Box
          noPadding
          collapsable
          unlimitedHeight
          title={
            <FormattedMessage
              id="app.groupDetail.supervisors"
              defaultMessage="Supervisors of {groupName}"
              values={{
                groupName: getLocalizedName({ name, localizedTexts }, locale)
              }}
            />
          }
        >
          <SupervisorsList
            groupId={id}
            users={supervisors}
            isAdmin={isAdmin}
            primaryAdminsIds={primaryAdminsIds}
            isLoaded={supervisors.length === group.supervisors.length}
          />
        </Box>
      </Col>
    </Row>
  </div>;

GroupDetail.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    parentGroupId: PropTypes.string,
    childGroups: PropTypes.shape({
      all: PropTypes.array,
      public: PropTypes.array.isRequired
    }),
    threshold: PropTypes.number,
    isPublic: PropTypes.bool,
    supervisors: PropTypes.array.isRequired,
    primaryAdminsIds: PropTypes.array.isRequired
  }),
  groups: PropTypes.object.isRequired,
  publicGroups: ImmutablePropTypes.map.isRequired,
  supervisors: PropTypes.array.isRequired,
  isAdmin: PropTypes.bool,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(GroupDetail);
