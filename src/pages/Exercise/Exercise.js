import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { List } from 'immutable';
import { Row, Col } from 'react-bootstrap';

import PageContent from '../../components/PageContent';
import ExerciseDetail, { LoadingExerciseDetail, FailedExerciseDetail } from '../../components/Exercises/ExerciseDetail';
import ResourceRenderer from '../../components/ResourceRenderer';
import GroupsList from '../../components/Groups/GroupsList';
import Box from '../../components/AdminLTE/Box';

import { isReady, isLoading, hasFailed, getJsData } from '../../redux/helpers/resourceManager';
import { fetchExerciseIfNeeded } from '../../redux/modules/exercises';
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
      ? exercise.getIn(['data', 'name'])
      : <FormattedMessage id='app.exercise.loading' defaultMessage="Loading exercise's detail ..." />;

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
            <Box title={'Groups'} noPadding>
              <GroupsList groups={supervisedGroups} />
            </Box>
          </Col>
        </Row>
      </PageContent>
    );
  }

}

export default connect(
  (state, { params: { exerciseId } }) => {
    const userId = loggedInUserIdSelector(state);
    return {
      exercise: exerciseSelector(exerciseId)(state),
      supervisedGroups: supervisorOfSelector(userId)(state)
    };
  },
  (dispatch, { params: { exerciseId: id } }) => ({
    fetchExerciseIfNeeded: () => dispatch(fetchExerciseIfNeeded(id))
  })
)(Exercise);
