import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';

import Box from '../../AdminLTE/Box';
import AddStudent from '../AddStudent';
import SearchExercise from '../SearchExercise';
import StudentsListContainer from '../../../containers/StudentsListContainer';
import AdminAssignmentsTable from '../../Assignments/AdminAssignmentsTable';
import LeaveJoinGroupButtonContainer from '../../../containers/LeaveJoinGroupButtonContainer';

const SupervisorsView = ({
  group,
  assignments,
  assignExercise
}) => (
  <div>
    <Row>
      <Col lg={12}>
        <h3 className='page-header'>
          <FormattedMessage
            id='app.group.supervisorsView.title'
            defaultMessage="Supervisor's controls of {groupName}"
            values={{ groupName: group.name }} />
        </h3>
      </Col>
    </Row>
    <Row>
      <Col lg={6}>
        <Box
          title={<FormattedMessage id='app.group.spervisorsView.students' defaultMessage='Students' />}
          collapsable
          noPadding>
          <StudentsListContainer
            groupId={group.id}
            renderActions={userId => <LeaveJoinGroupButtonContainer userId={userId} groupId={group.id} />}
            fill />
        </Box>
        <Box
          title={<FormattedMessage id='app.group.spervisorsView.addStudent' defaultMessage='Add student' />}
          collapsable
          isOpen>
          <AddStudent instanceId={group.instanceId} groupId={group.id} />
        </Box>
      </Col>
      <Col lg={6}>
        <Box
          title={<FormattedMessage id='app.group.spervisorsView.assignments' defaultMessage='Assignments' />}
          collapsable
          noPadding
          isOpen>
          <AdminAssignmentsTable assignments={assignments} />
        </Box>
        <Box
          title={<FormattedMessage id='app.group.spervisorsView.searchExercise' defaultMessage='Find an exercise' />}
          collapsable
          isOpen>
          <SearchExercise groupId={group.id} />
        </Box>
      </Col>
    </Row>
  </div>
);

SupervisorsView.propTypes = {
  group: PropTypes.object,
  assignments: ImmutablePropTypes.list.isRequired,
  assignExercise: PropTypes.func.isRequired
};

export default SupervisorsView;
