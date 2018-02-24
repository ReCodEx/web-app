import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import DeleteExerciseButtonContainer from '../../../containers/DeleteExerciseButtonContainer';
import ExercisesSimpleList from '../../../components/Exercises/ExercisesSimpleList';
import Button from '../../../components/widgets/FlatButton';
import { AddIcon, EditIcon } from '../../../components/icons';
import AssignExerciseButton from '../../../components/buttons/AssignExerciseButton';

import ResourceRenderer from '../../helpers/ResourceRenderer';
import Box from '../../widgets/Box';
import AddStudent from '../AddStudent';
import SearchExercise from '../SearchExercise';
import AdminAssignmentsTable from '../../Assignments/AdminAssignmentsTable';
import { deleteExercise } from '../../../redux/modules/exercises';
import withLinks from '../../../helpers/withLinks';
import { getLocalizedName } from '../../../helpers/getLocalizedData';

const SupervisorsView = ({
  group,
  assignments,
  exercises,
  createGroupExercise,
  assignExercise,
  deleteExercise,
  users,
  publicAssignments,
  links: {
    EXERCISE_EDIT_URI_FACTORY,
    EXERCISE_EDIT_SIMPLE_CONFIG_URI_FACTORY,
    EXERCISE_EDIT_LIMITS_URI_FACTORY
  },
  intl: { locale }
}) =>
  <div>
    <Row>
      <Col lg={12}>
        <h3 className="page-header">
          <FormattedMessage
            id="app.group.supervisorsView.title"
            defaultMessage="Supervisor's controls of {groupName}"
            values={{ groupName: getLocalizedName(group, locale) }}
          />
        </h3>
      </Col>
    </Row>
    <Row>
      <Col lg={6}>
        <Box
          title={
            <FormattedMessage
              id="app.group.spervisorsView.assignments"
              defaultMessage="Assignments"
            />
          }
          noPadding
          unlimitedHeight
          isOpen
        >
          <AdminAssignmentsTable assignments={assignments} />
        </Box>
      </Col>
      <Col lg={6}>
        <Box
          title={
            <FormattedMessage
              id="app.group.spervisorsView.addStudent"
              defaultMessage="Add student"
            />
          }
          isOpen
        >
          <AddStudent
            instanceId={group.privateData.instanceId}
            groupId={group.id}
          />
        </Box>
        <Box
          title={
            <FormattedMessage
              id="app.group.spervisorsView.searchExercise"
              defaultMessage="Find an exercise"
            />
          }
          isOpen
        >
          <SearchExercise groupId={group.id} />
        </Box>
      </Col>
      <Col lg={12}>
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
                <AddIcon />{' '}
                <FormattedMessage
                  id="app.group.createExercise"
                  defaultMessage="Add group exercise"
                />
              </Button>
            </p>
          }
          isOpen
        >
          <ResourceRenderer resource={exercises.toArray()}>
            {(...exercises) =>
              <ExercisesSimpleList
                exercises={exercises}
                createActions={(exerciseId, isLocked, isBroken) =>
                  <div>
                    <AssignExerciseButton
                      isLocked={isLocked}
                      isBroken={isBroken}
                      assignExercise={() => assignExercise(exerciseId)}
                    />

                    <LinkContainer to={EXERCISE_EDIT_URI_FACTORY(exerciseId)}>
                      <Button bsSize="xs" bsStyle="warning">
                        <EditIcon />{' '}
                        <FormattedMessage
                          id="app.exercises.listEdit"
                          defaultMessage="Settings"
                        />
                      </Button>
                    </LinkContainer>
                    <LinkContainer
                      to={EXERCISE_EDIT_SIMPLE_CONFIG_URI_FACTORY(exerciseId)}
                    >
                      <Button bsSize="xs" bsStyle="warning">
                        <EditIcon />{' '}
                        <FormattedMessage
                          id="app.exercises.listEditConfig"
                          defaultMessage="Configuration"
                        />
                      </Button>
                    </LinkContainer>
                    <LinkContainer
                      to={EXERCISE_EDIT_LIMITS_URI_FACTORY(exerciseId)}
                    >
                      <Button bsSize="xs" bsStyle="warning">
                        <EditIcon />{' '}
                        <FormattedMessage
                          id="app.exercises.listEditLimits"
                          defaultMessage="Limits"
                        />
                      </Button>
                    </LinkContainer>

                    <DeleteExerciseButtonContainer
                      id={exerciseId}
                      bsSize="xs"
                    />
                  </div>}
              />}
          </ResourceRenderer>
        </Box>
      </Col>
    </Row>
  </div>;

SupervisorsView.propTypes = {
  group: PropTypes.object,
  assignments: ImmutablePropTypes.list.isRequired,
  exercises: ImmutablePropTypes.map.isRequired,
  createGroupExercise: PropTypes.func.isRequired,
  assignExercise: PropTypes.func.isRequired,
  deleteExercise: PropTypes.func.isRequired,
  users: PropTypes.array.isRequired,
  publicAssignments: ImmutablePropTypes.list.isRequired,
  links: PropTypes.object,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default withLinks(
  connect(
    state => ({}),
    dispatch => ({
      deleteExercise: id => dispatch(deleteExercise(id))
    })
  )(injectIntl(SupervisorsView))
);
