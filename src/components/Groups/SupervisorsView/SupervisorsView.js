import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import ResourceRenderer from '../../helpers/ResourceRenderer';

import Box from '../../widgets/Box';
import AddStudent from '../AddStudent';
import SearchExercise from '../SearchExercise';
import StudentsListContainer from '../../../containers/StudentsListContainer';
import AdminAssignmentsTable from '../../Assignments/AdminAssignmentsTable';
import LeaveJoinGroupButtonContainer
  from '../../../containers/LeaveJoinGroupButtonContainer';
import ExercisesSimpleList
  from '../../../components/Exercises/ExercisesSimpleList';
import Button from '../../../components/widgets/FlatButton';
import {
  AddIcon,
  SendIcon,
  EditIcon,
  DeleteIcon
} from '../../../components/icons';
import { deleteExercise } from '../../../redux/modules/exercises';
import Confirm from '../../../components/forms/Confirm';
import withLinks from '../../../hoc/withLinks';

const SupervisorsView = ({
  group,
  assignments,
  exercises,
  createGroupExercise,
  assignExercise,
  deleteExercise,
  links: { EXERCISE_EDIT_URI_FACTORY }
}) => (
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
            renderActions={userId => (
              <LeaveJoinGroupButtonContainer
                userId={userId}
                groupId={group.id}
              />
            )}
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
          isOpen
        >
          <ResourceRenderer resource={exercises.toArray()}>
            {(...exercises) => (
              <ExercisesSimpleList
                exercises={exercises}
                createActions={exerciseId => (
                  <div>
                    <Button
                      onClick={() => assignExercise(exerciseId)}
                      bsSize="xs"
                      className="btn-flat"
                    >
                      <SendIcon />
                      {' '}
                      <FormattedMessage
                        id="app.exercise.assignButton"
                        defaultMessage="Assign"
                      />
                    </Button>
                    <LinkContainer to={EXERCISE_EDIT_URI_FACTORY(exerciseId)}>
                      <Button
                        bsSize="xs"
                        className="btn-flat"
                        bsStyle="warning"
                      >
                        <EditIcon />
                        {' '}
                        <FormattedMessage
                          id="app.exercise.editButton"
                          defaultMessage="Edit"
                        />
                      </Button>
                    </LinkContainer>
                    <Confirm
                      id={exerciseId}
                      onConfirmed={() => deleteExercise(exerciseId)}
                      question={
                        <FormattedMessage
                          id="app.exercise.deleteConfirm"
                          defaultMessage="Are you sure you want to delete the exercise? This cannot be undone."
                        />
                      }
                    >
                      <Button bsSize="xs" className="btn-flat" bsStyle="danger">
                        <DeleteIcon />
                        {' '}
                        <FormattedMessage
                          id="app.exercise.deleteButton"
                          defaultMessage="Delete"
                        />
                      </Button>
                    </Confirm>
                  </div>
                )}
              />
            )}
          </ResourceRenderer>
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
  </div>
);

SupervisorsView.propTypes = {
  group: PropTypes.object,
  assignments: ImmutablePropTypes.list.isRequired,
  exercises: ImmutablePropTypes.map.isRequired,
  createGroupExercise: PropTypes.func.isRequired,
  assignExercise: PropTypes.func.isRequired,
  deleteExercise: PropTypes.func.isRequired,
  links: PropTypes.object
};

export default withLinks(
  connect(
    state => ({}),
    dispatch => ({
      deleteExercise: id => dispatch(deleteExercise(id))
    })
  )(SupervisorsView)
);
