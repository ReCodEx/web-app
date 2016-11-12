import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';

import Box from '../../AdminLTE/Box';
import AddStudent from '../AddStudent';
import AddAssignment from '../AddAssignment';
import StudentsList from '../../Users/StudentsList';
import AdminAssignmentsTable from '../../Assignments/AdminAssignmentsTable';

const SupervisorsView = ({
  group,
  students,
  stats,
  assignments
}) => (
  <Row>
    <Col lg={6}>
      <h3>
        <FormattedMessage
          id='app.group.supervisorsView.title'
          defaultMessage="Supervisor's controls of {groupName}"
          values={{ groupName: group.name }} />
      </h3>
      <Box
        title={<FormattedMessage id='app.group.spervisorsView.students' defaultMessage='Students' />}
        collapsable
        noPadding>
        <StudentsList users={students.toJS()} stats={stats} fill />
      </Box>
      <Box
        title={<FormattedMessage id='app.group.spervisorsView.addStudent' defaultMessage='Add student' />}
        collapsable
        isOpen>
        <AddStudent instanceId={group.instanceId} groupId={group.id} />
      </Box>
    </Col>
    <Col lg={6}>
      <AdminAssignmentsTable
        assignments={assignments}
        showGroup={false} />
      <Box
        title={<FormattedMessage id='app.group.spervisorsView.addAssignment' defaultMessage='Add assignment' />}
        collapsable
        isOpen>
        <AddAssignment groupId={group.id} />
      </Box>
    </Col>
  </Row>
);

SupervisorsView.propTypes = {
  group: PropTypes.object.isRequired,
  students: ImmutablePropTypes.list,
  stats: ImmutablePropTypes.map,
  assignments: ImmutablePropTypes.list.isRequired
};

export default SupervisorsView;
