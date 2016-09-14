import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';

import Box from '../../AdminLTE/Box';
import AddStudentContainer from '../../../containers/AddStudentContainer';
import StudentsList from '../../Users/StudentsList';

const SupervisorsView = ({
  group,
  students,
  stats
}) => (
  <Row>
    <Col lg={6}>
      <Box
        title={<FormattedMessage id='app.groupDetail.students' defaultMessage='Students' />}
        collapsable
        isOpen={false}>
        <StudentsList users={students} stats={stats} fill />
      </Box>
    </Col>
    <Col lg={6}>
      <Box
        title={<FormattedMessage id='app.groupDetail.addStudent' defaultMessage='Add student' />}
        collapsable
        isOpen>
        <AddStudentContainer instanceId={group.instanceId} groupId={group.id} />
      </Box>
    </Col>
  </Row>
);

SupervisorsView.propTypes = {
  group: PropTypes.object.isRequired,
  students: ImmutablePropTypes.list,
  stats: ImmutablePropTypes.map
};

export default SupervisorsView;
