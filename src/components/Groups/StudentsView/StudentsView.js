import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';

import Box from '../../AdminLTE/Box';
import AssignmentsTable from '../../Assignments/Assignment/AssignmentsTable';
import StudentsList from '../../Users/StudentsList';

const StudentsView = ({
  group,
  students,
  stats,
  assignments
}) => (
  <Row>
    <Col lg={students && stats ? 6 : 12}>
      <Box
        title={<FormattedMessage id='app.studentsView.assignments' defaultMessage='Assignments' />}
        collapsable
        noPadding
        isOpen>
        <AssignmentsTable
          assignments={assignments}
          showGroup={false} />
      </Box>
    </Col>
    {students && stats && (
      <Col lg={6}>
        <Box
          title={<FormattedMessage id='app.studentsView.students' defaultMessage='Students' />}
          collapsable
          noPadding
          isOpen>
          <StudentsList
            users={students.toJS()}
            isLoaded={students.size === group.students.length}
            stats={stats}
            fill />
        </Box>
      </Col>
    )}
  </Row>
);

StudentsView.propTypes = {
  group: PropTypes.object.isRequired,
  assignments: ImmutablePropTypes.list.isRequired
};

export default StudentsView;
