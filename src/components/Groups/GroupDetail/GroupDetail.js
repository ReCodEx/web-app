import React, { PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import UsersList from '../../Users/UsersList';
import UsersListItem from '../../Users/UsersListItem';
import Box from '../../AdminLTE/Box';

import LeaveJoinGroupButtonContainer from '../../../containers/LeaveJoinGroupButtonContainer';
import MakeRemoveSupervisorButtonContainer from '../../../containers/MakeRemoveSupervisorButtonContainer';
import AssignmentsTable from '../../Assignments/Assignment/AssignmentsTable';
import { isReady, isLoading, hasFailed } from '../../../redux/helpers/resourceManager';

const GroupDetail = ({
  group,
  admin,
  assignments
}) => (
  <div>
    <ReactMarkdown source={group.data.description} />
    <Row>
      <Col sm={6}>
        <LeaveJoinGroupButtonContainer groupId={group.data.id} />
        <MakeRemoveSupervisorButtonContainer groupId={group.data.id} />
      </Col>
    </Row>
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
