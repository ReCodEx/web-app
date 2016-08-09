import React, { PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import UsersList from '../../Users/UsersList';
import Box from '../../AdminLTE/Box';

import AssignmentsTable from '../../Assignments/Assignment/AssignmentsTable';
import { isReady, isLoading, hasFailed } from '../../../redux/helpers/resourceManager';

const GroupDetail = ({
  group,
  assignments
}) => (
  <div>
    <ReactMarkdown source={group.data.description} />
    <Row>
      <Col lg={6}>
        <Box title='Cvičící' collapsable isOpen={true}>
          <UsersList users={group.data.supervisors} fill />
        </Box>
        <Box title='Studenti' collapsable isOpen={false}>
          <UsersList users={group.data.students} fill />
        </Box>
      </Col>

      <Col lg={6}>
        <Box title='Zadané úlohy' collapsable isOpen={true}>
          <AssignmentsTable
            assignments={assignments}
            showGroup={false} />
        </Box>
      </Col>
    </Row>
  </div>
);

export default GroupDetail;
