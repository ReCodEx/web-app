import React, { PropTypes } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Row, Col, Table } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';

import Box from '../../AdminLTE/Box';
import GroupTree from '../GroupTree';
import { MaybeSucceededIcon } from '../../Icons';

const GroupDetail = ({
  id,
  description,
  threshold,
  isPublic,
  childGroups,
  groups
}) => (
  <Row>
    <Col md={childGroups.length === 0 ? 12 : 8}>
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
              <tr>
                <th><FormattedMessage id='app.groupDetail.threshold' defaultMessage='Minimum percent of the total points count needed to complete the course:' /></th>
                <td><FormattedNumber value={threshold} style='percent' /></td>
              </tr>
            </tbody>
          </Table>
        </div>
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
);

GroupDetail.propTypes = {
  id: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  childGroups: PropTypes.array,
  groups: PropTypes.object.isRequired,
  threshold: PropTypes.number,
  isPublic: PropTypes.bool
};

export default GroupDetail;
