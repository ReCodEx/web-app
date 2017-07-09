import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Row, Col, Table } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router';

import Box from '../../widgets/Box';
import GroupTree from '../GroupTree';
import SupervisorsList from '../../Users/SupervisorsList';
import { MaybeSucceededIcon } from '../../icons';

import withLinks from '../../../hoc/withLinks';

const GroupDetail = ({
  group: {
    id,
    externalId,
    name,
    description,
    threshold,
    parentGroupId,
    isPublic = false,
    childGroups,
    ...group
  },
  parentGroup,
  groups,
  supervisors,
  isAdmin,
  links: { GROUP_URI_FACTORY }
}) =>
  <div>
    <Row>
      <Col lg={6} sm={12}>
        <Box
          title={
            <FormattedMessage
              id="app.groupDetail.description"
              defaultMessage="Group description"
            />
          }
          description={<ReactMarkdown source={description} />}
          type="primary"
          collapsable
          noPadding
          unlimitedHeight
        >
          <Table>
            <tbody>
              {externalId &&
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
              {parentGroup &&
                <tr>
                  <th>
                    <FormattedMessage
                      id="app.groupDetail.externalId"
                      defaultMessage="External identification of the group:"
                    />
                  </th>
                  <td>
                    <Link to={GROUP_URI_FACTORY(parentGroupId)}>
                      {parentGroup.name}
                    </Link>
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
      <Col lg={6} sm={12}>
        <Box
          title={
            <FormattedMessage
              id="app.groupDetail.groupsTitle"
              defaultMessage="Groups hierarchy"
            />
          }
          /* No padding in the case when the hierarchy is not empty. */
          noPadding={
            (isAdmin && childGroups.all.length > 0) ||
            (!isAdmin && childGroups.public.length > 0)
          }
          unlimitedHeight
          collapsable
        >
          <div>
            {isAdmin &&
              childGroups.all.map(childId =>
                <GroupTree
                  key={childId}
                  id={childId}
                  currentGroupId={id}
                  groups={groups}
                  isOpen
                />
              )}

            {!isAdmin &&
              childGroups.public.map(childId =>
                <GroupTree
                  key={childId}
                  id={childId}
                  currentGroupId={id}
                  groups={groups}
                  isOpen
                />
              )}

            {((isAdmin && childGroups.all.length === 0) ||
              (!isAdmin && childGroups.public.length === 0)) &&
              <div className="text-center">
                <FormattedMessage
                  id="app.groupDetail.noSubgroups"
                  defaultMessage="This group has no subgroups."
                />
              </div>}
          </div>
        </Box>
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
              values={{ groupName: name }}
            />
          }
        >
          <SupervisorsList
            groupId={id}
            users={supervisors}
            isAdmin={isAdmin}
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
    supervisors: PropTypes.array.isRequired
  }),
  parentGroup: PropTypes.shape({
    name: PropTypes.string.isRequired
  }),
  groups: PropTypes.object.isRequired,
  supervisors: PropTypes.array.isRequired,
  isAdmin: PropTypes.bool,
  links: PropTypes.object
};

export default withLinks(GroupDetail);
