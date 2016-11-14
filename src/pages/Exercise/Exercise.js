import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { FormattedMessage } from 'react-intl';
import { List } from 'immutable';
import { Row, Col, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import PageContent from '../../components/PageContent';
import ExerciseDetail, { LoadingExerciseDetail, FailedExerciseDetail } from '../../components/Exercises/ExerciseDetail';
import LocalizedAssignments from '../../components/Assignments/Assignment/LocalizedAssignments';
import ResourceRenderer from '../../components/ResourceRenderer';
import GroupsList from '../../components/Groups/GroupsList';
import Box from '../../components/AdminLTE/Box';
import { SendIcon } from '../../components/Icons';
import { EditIcon } from '../../components/Icons';

import { isReady, isLoading, hasFailed, getJsData } from '../../redux/helpers/resourceManager';
import { fetchExerciseIfNeeded } from '../../redux/modules/exercises';
import { create as assignExercise } from '../../redux/modules/assignments';
import { exerciseSelector } from '../../redux/selectors/exercises';
import { isAuthorOfExercise } from '../../redux/selectors/users';

import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { supervisorOfSelector } from '../../redux/selectors/groups';

class Exercise extends Component {

  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.instanceId !== newProps.params.instanceId) {
      newProps.loadAsync();
    }
  }

  getTitle = (exercise) =>
    isReady(exercise)
      ? getJsData(exercise).name
      : <FormattedMessage id='app.exercise.loading' defaultMessage="Loading exercise's detail ..." />;

  createExercise = (groupId) => {
    const { assignExercise, push } = this.props;

    const { links: { ASSIGNMENT_EDIT_URI_FACTORY } } = this.context;

    assignExercise(groupId)
      .then(({ value: assigment }) => push(ASSIGNMENT_EDIT_URI_FACTORY(assigment.id)));
  };

  render() {
    const {
      params: { instanceId },
      exercise,
      supervisedGroups,
      isAuthorOfExercise
    } = this.props;

    const {
      links: { EXERCISE_EDIT_URI_FACTORY }
    } = this.context;

    return (
      <PageContent
        title={this.getTitle(exercise)}
        description={<FormattedMessage id='app.exercise.description' defaultMessage='Exercise overview' />}
        breadcrumbs={[
          {
            text: <FormattedMessage id='app.exercise.description' defaultMessage="Exercise overview" />,
            iconName: 'lightbulb-o'
          }
        ]}>

        <ResourceRenderer
          loading={<LoadingExerciseDetail />}
          failed={<FailedExerciseDetail />}
          resource={exercise}>
          {exercise =>
            <Row>
              <Col md={6}>
                <div>
                  {exercise.localizedAssignments.length > 0 && <LocalizedAssignments locales={exercise.localizedAssignments} />}
                </div>
              </Col>

              <Col sm={6}>
                    <ExerciseDetail {...exercise} />
              </Col>

              <Col>
                {isAuthorOfExercise(exercise.id) && (
                  <p className='text-center'>
                    <LinkContainer to={EXERCISE_EDIT_URI_FACTORY(exercise.id)}>
                      <Button bsStyle='warning' className='btn-flat'>
                        <EditIcon /> <FormattedMessage id='app.exercise.editSettings' defaultMessage='Edit exercise settings' />
                      </Button>
                    </LinkContainer>
                  </p>
                )}
              </Col>

              <Col sm={6}>
                <Box title={'Groups'}>
                  <ResourceRenderer
                    forceLoading={supervisedGroups.length === 0}
                    resource={supervisedGroups}>
                    {() =>
                      <div>
                        <p>
                          <FormattedMessage id='app.exercise.assignToGroup' defaultMessage='You can assign this exercise to one of the groups you supervise.' />
                        </p>
                        <GroupsList
                          fill
                          groups={supervisedGroups}
                          renderButtons={groupId => (
                            <Button bsSize='xs' onClick={() => this.createExercise(groupId)}>
                              <SendIcon /> <FormattedMessage id='app.exercise.assign' defaultMessage='Assign' />
                            </Button>
                          )} />
                      </div>}
                    </ResourceRenderer>
                  </Box>
                </Col>
              </Row>
            }
          </ResourceRenderer>
        </PageContent>
    );
  }

}

Exercise.contextTypes = {
  links: PropTypes.object
};

Exercise.propTypes = {
  params: PropTypes.shape({
    exerciseId: PropTypes.string.isRequired
  }),
  loadAsync: PropTypes.func.isRequired,
  isAuthorOfExercise: PropTypes.func.isRequired,
};

export default connect(
  (state, { params: { exerciseId } }) => {
    const userId = loggedInUserIdSelector(state);
    return {
      exercise: exerciseSelector(exerciseId)(state),
      supervisedGroups: supervisorOfSelector(userId)(state),
      isAuthorOfExercise: (exerciseId) => isAuthorOfExercise(userId, exerciseId)(state)
    };
  },
  (dispatch, { params: { exerciseId: id } }) => ({
    loadAsync: () => Promise.all([
      dispatch(fetchExerciseIfNeeded(id))
    ]),
    assignExercise: (groupId) => dispatch(assignExercise(groupId, id)),
    push: (url) => dispatch(push(url))
  })
)(Exercise);
