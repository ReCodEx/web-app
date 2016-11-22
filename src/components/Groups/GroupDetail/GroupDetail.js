import React, { PropTypes } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Row, Col, Table } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';

import Box from '../../AdminLTE/Box';
import GroupTree from '../GroupTree';
import SupervisorsList from '../../Users/SupervisorsList';
import { MaybeSucceededIcon } from '../../Icons';

const GroupDetail = ({
  group: {
    id,
    name,
    description,
    threshold,
    isPublic = false,
    childGroups,
    ...group
  },
  groups,
  supervisors,
  isAdmin
}) => (
  <div>
    <Row>
      <Col sm={12}>
        <Box
          title={<FormattedMessage id='app.groupDetail.description' defaultMessage='Group description' />}
          type='primary'
          collapsable
          noPadding={false}>
          <div>
            <ReactMarkdown source={description} />
            <Table>
              <tbody>
                <tr>
                  <th><FormattedMessage id='app.groupDetail.isPublic' defaultMessage='Is public:' /></th>
                  <td><MaybeSucceededIcon success={isPublic} /></td>
                </tr>
                {threshold !== null && (
                  <tr>
                    <th><FormattedMessage id='app.groupDetail.threshold' defaultMessage='Minimum percent of the total points count needed to complete the course:' /></th>
                    <td><FormattedNumber value={threshold} style='percent' /></td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Box>
      </Col>
    </Row>
    <Row>
      <Col md={childGroups.length === 0 ? 12 : 8}>
        <Box
          noPadding
          collapsable
          title={<FormattedMessage id='app.groupDetail.supervisors' defaultMessage='Supervisors of {groupName}' values={{ groupName: name }} />}>
          <SupervisorsList
            groupId={id}
            users={supervisors}
            isAdmin={isAdmin}
            isLoaded={supervisors.length === group.supervisors.length} />
        </Box>
      </Col>
      {childGroups.length > 0 && (
        <Col md={4}>
          <Box title={<FormattedMessage id='app.groupDetail.groupsTitle' defaultMessage='Groups hierarchy' />} noPadding>
            <GroupTree id={id} groups={groups} />
          </Box>
        </Col>
      )}
    </Row>
  </div>
);

GroupDetail.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    childGroups: PropTypes.array,
    threshold: PropTypes.number,
    isPublic: PropTypes.bool,
    supervisors: PropTypes.array.isRequired
  }),
  groups: PropTypes.object.isRequired,
  supervisors: PropTypes.array.isRequired,
  isAdmin: PropTypes.bool
};

export default GroupDetail;
