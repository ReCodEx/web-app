import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';

import Box from '../../widgets/Box';
import AddStudent from '../AddStudent';
import SearchExercise from '../SearchExercise';
import StudentsListContainer from '../../../containers/StudentsListContainer';
import AdminAssignmentsTable from '../../Assignments/AdminAssignmentsTable';
import LeaveJoinGroupButtonContainer from '../../../containers/LeaveJoinGroupButtonContainer';
import GroupExercisesList from '../../../components/Exercises/GroupExercisesList';
import Button from '../../../components/widgets/FlatButton';
import { AddIcon } from '../../../components/icons';

const SupervisorsView = ({
  group,
  assignments,
  exercises,
  createGroupExercise
}) =>
  <div>
    <Row>
      <Col lg={12}>
        <h3 className="page-header">
          <FormattedMessage
            id="app.group.supervisorsView.title"
            defaultMessage="Supervisor's controls of {groupName}"
            values={{ groupName: group.name }}
          />
        </h3>
      </Col>
    </Row>
    <Row>
      <Col lg={6}>
        <Box
          title={
            <FormattedMessage
              id="app.group.spervisorsView.students"
              defaultMessage="Students"
            />
          }
          collapsable
          unlimitedHeight
          noPadding
        >
          <StudentsListContainer
            groupId={group.id}
            renderActions={userId =>
              <LeaveJoinGroupButtonContainer
                userId={userId}
                groupId={group.id}
              />}
            fill
          />
        </Box>
        <Box
          title={
            <FormattedMessage
              id="app.group.spervisorsView.addStudent"
              defaultMessage="Add student"
            />
          }
          collapsable
          isOpen
        >
          <AddStudent instanceId={group.instanceId} groupId={group.id} />
        </Box>
      </Col>
      <Col lg={6}>
        <Box
          title={
            <FormattedMessage
              id="app.group.spervisorsView.groupExercises"
              defaultMessage="Group Exercises"
            />
          }
          footer={
            <p className="text-center">
              <Button
                bsStyle="success"
                className="btn-flat"
                bsSize="sm"
                onClick={() => {
                  createGroupExercise();
                }}
              >
                <AddIcon />
                {' '}
                <FormattedMessage
                  id="app.group.createExercise"
                  defaultMessage="Add group exercise"
                />
              </Button>
            </p>
          }
          collapsable
          noPadding
          isOpen
        >
          <GroupExercisesList exercises={exercises} />
        </Box>
      </Col>
      <Col lg={6}>
        <Box
          title={
            <FormattedMessage
              id="app.group.spervisorsView.assignments"
              defaultMessage="Assignments"
            />
          }
          collapsable
          noPadding
          unlimitedHeight
          isOpen
        >
          <AdminAssignmentsTable assignments={assignments} />
        </Box>
        <Box
          title={
            <FormattedMessage
              id="app.group.spervisorsView.searchExercise"
              defaultMessage="Find an exercise"
            />
          }
          collapsable
          isOpen
        >
          <SearchExercise groupId={group.id} />
        </Box>
      </Col>
    </Row>
  </div>;

SupervisorsView.propTypes = {
  group: PropTypes.object,
  assignments: ImmutablePropTypes.list.isRequired,
  exercises: ImmutablePropTypes.map.isRequired,
  createGroupExercise: PropTypes.func.isRequired
};

export default SupervisorsView;
