import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { FormattedMessage } from 'react-intl';
import { List } from 'immutable';
import { Row, Col, Button } from 'react-bootstrap';

import PageContent from '../../components/PageContent';
import ExerciseDetail, { LoadingExerciseDetail, FailedExerciseDetail } from '../../components/Exercises/ExerciseDetail';
import ResourceRenderer from '../../components/ResourceRenderer';
import GroupsList from '../../components/Groups/GroupsList';
import Box from '../../components/AdminLTE/Box';
import { SendIcon } from '../../components/Icons';

import { isReady, isLoading, hasFailed, getJsData } from '../../redux/helpers/resourceManager';
import { fetchExerciseIfNeeded } from '../../redux/modules/exercises';
import { create as assignExercise } from '../../redux/modules/assignments';
import { exerciseSelector } from '../../redux/selectors/exercises';

import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { supervisorOfSelector } from '../../redux/selectors/groups';

class Exercise extends Component {

  componentWillMount() {
    this.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.instanceId !== newProps.params.instanceId) {
      this.loadData(newProps);
    }
  }

  loadData = ({
    fetchExerciseIfNeeded
  }) => {
    fetchExerciseIfNeeded();
  };

  getTitle = (exercise) =>
    isReady(exercise)
      ? getJsData(exercise).name
      : <FormattedMessage id='app.exercise.loading' defaultMessage="Loading exercise's detail ..." />;

  createExercise = (groupId) => {
    const { assignExercise, push } = this.props;

    const {
      links: { ASSIGNMENT_EDIT_URI_FACTORY }
    } = this.context;

    assignExercise(groupId)
      .then(({ value: assigment }) => push(ASSIGNMENT_EDIT_URI_FACTORY(assigment.id)));
  };

  render() {
    const {
      params: { instanceId },
      exercise,
      supervisedGroups
    } = this.props;
    return (
      <PageContent
        title={this.getTitle(exercise)}
        description={<FormattedMessage id='app.exercise.description' defaultMessage='Exercise overview' />}>
        <Row>
          <Col sm={6}>
            <ResourceRenderer
              loading={<LoadingExerciseDetail />}
              failed={<FailedExerciseDetail />}
              resource={exercise}>
              {(data) =>
                <ExerciseDetail {...data} />}
            </ResourceRenderer>
          </Col>

          <Col sm={6}>
            <Box title={'Groups'}>
              <ResourceRenderer
                forceLoading={supervisedGroups.length === 0}
                resource={exercise}>
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
      </PageContent>
    );
  }

}

Exercise.contextTypes = {
  links: PropTypes.object
};

export default connect(
  (state, { params: { exerciseId } }) => {
    const userId = loggedInUserIdSelector(state);
    return {
      exercise: exerciseSelector(exerciseId)(state),
      supervisedGroups: supervisorOfSelector(userId)(state)
    };
  },
  (dispatch, { params: { exerciseId: id } }) => ({
    fetchExerciseIfNeeded: () => dispatch(fetchExerciseIfNeeded(id)),
    assignExercise: (groupId) => dispatch(assignExercise(groupId, id)),
    push: (url) => dispatch(push(url))
  })
)(Exercise);
