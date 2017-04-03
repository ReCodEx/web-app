import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { FormattedMessage, defineMessages, intlShape, injectIntl } from 'react-intl';
import { Row, Col, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import Page from '../../components/Page';
import ExerciseDetail from '../../components/Exercises/ExerciseDetail';
import LocalizedTexts from '../../components/LocalizedTexts';
import ResourceRenderer from '../../components/ResourceRenderer';
import GroupsList from '../../components/Groups/GroupsList';
import ReferenceSolutionsList from '../../components/Exercises/ReferenceSolutionsList';
import Box from '../../components/AdminLTE/Box';
import { EditIcon, SendIcon } from '../../components/Icons';

import { fetchExerciseIfNeeded } from '../../redux/modules/exercises';
import { fetchReferenceSolutionsIfNeeded } from '../../redux/modules/referenceSolutions';
import { create as assignExercise } from '../../redux/modules/assignments';
import { exerciseSelector } from '../../redux/selectors/exercises';
import { referenceSolutionsSelector } from '../../redux/selectors/referenceSolutions';
import { canEditExercise } from '../../redux/selectors/users';

import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { supervisorOfSelector } from '../../redux/selectors/groups';


const messages = defineMessages({
  groupsBox: {
    id: 'app.exercise.groupsBox',
    defaultMessage: 'Groups'
  },
  referenceSolutionsBox: {
    id: 'app.exercise.referenceSolutionsBox',
    defaultMessage: 'Reference solutions'
  }
});

class Exercise extends Component {

  static loadAsync = ({ exerciseId }, dispatch) => Promise.all([
    dispatch(fetchExerciseIfNeeded(exerciseId)),
    dispatch(fetchReferenceSolutionsIfNeeded(exerciseId))
  ]);

  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.exerciseId !== newProps.params.exerciseId) {
      newProps.loadAsync();
    }
  }

  createExercise = (groupId) => {
    const { assignExercise, push } = this.props;
    const { links: { ASSIGNMENT_EDIT_URI_FACTORY } } = this.context;

    assignExercise(groupId)
      .then(({ value: assigment }) => push(ASSIGNMENT_EDIT_URI_FACTORY(assigment.id)));
  };

  render() {
    const {
      exercise,
      supervisedGroups,
      isAuthorOfExercise,
      referenceSolutions,
      intl: { formatMessage }
    } = this.props;

    const {
      links: { EXERCISES_URI, EXERCISE_EDIT_URI_FACTORY }
    } = this.context;

    return (
      <Page
        title={(exercise) => exercise.name}
        resource={exercise}
        description={<FormattedMessage id='app.exercise.description' defaultMessage='Exercise overview' />}
        breadcrumbs={[
          {
            text: <FormattedMessage id='app.exercises.title' defaultMessage="Exercises" />,
            iconName: 'puzzle-piece',
            link: EXERCISES_URI
          },
          {
            text: <FormattedMessage id='app.exercise.description' defaultMessage="Exercise overview" />,
            iconName: 'lightbulb-o'
          }
        ]}>
        {exercise => (
          <div>
            <Row>
              <Col sm={12}>
                {isAuthorOfExercise(exercise.id) && (
                  <p>
                    <LinkContainer to={EXERCISE_EDIT_URI_FACTORY(exercise.id)}>
                      <Button bsStyle='warning' className='btn-flat' bsSize='sm'>
                        <EditIcon />&nbsp;<FormattedMessage id='app.exercise.editSettings' defaultMessage='Edit exercise settings' />
                      </Button>
                    </LinkContainer>
                  </p>
                )}
              </Col>
            </Row>
            <Row>
              <Col lg={6}>
                <div>
                  {exercise.localizedTexts.length > 0 && <LocalizedTexts locales={exercise.localizedTexts} />}
                </div>
              </Col>
              <Col lg={6}>
                <ExerciseDetail {...exercise} />
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Box title={formatMessage(messages.groupsBox)}>
                  <ResourceRenderer
                    forceLoading={supervisedGroups.length === 0}
                    resource={supervisedGroups}>
                    {() =>
                      <div>
                        <p>
                          <FormattedMessage id='app.exercise.assignToGroup' defaultMessage='You can assign this exercise to one of the groups you supervise.' />
                        </p>
                        <GroupsList
                          groups={supervisedGroups}
                          renderButtons={groupId => (
                            <Button bsSize='xs' className='btn-flat' onClick={() => this.createExercise(groupId)}>
                              <SendIcon /> <FormattedMessage id='app.exercise.assign' defaultMessage='Assign' />
                            </Button>
                          )} />
                      </div>}
                    </ResourceRenderer>
                  </Box>
                </Col>
                <Col md={6}>
                  <ResourceRenderer resource={referenceSolutions}>
                    {referenceSolutions => (
                      <Box title={formatMessage(messages.referenceSolutionsBox)}>
                        <ReferenceSolutionsList
                          referenceSolutions={referenceSolutions}
                          renderButtons={referenceSolutionId => (
                            <Button bsSize='xs' className='btn-flat' onClick={() => {}}>
                              <SendIcon /> <FormattedMessage id='app.exercise.evaluateReferenceSolution' defaultMessage='Evaluate' />
                            </Button>
                          )} />
                      </Box>
                    )}
                  </ResourceRenderer>
                </Col>
              </Row>
            </div>
          )}
        </Page>
    );
  }

}

Exercise.contextTypes = {
  links: PropTypes.object
};

Exercise.propTypes = {
  params: PropTypes.shape({ exerciseId: PropTypes.string.isRequired }).isRequired,
  loadAsync: PropTypes.func.isRequired,
  assignExercise: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  exercise: ImmutablePropTypes.map,
  supervisedGroups: PropTypes.object,
  isAuthorOfExercise: PropTypes.func.isRequired,
  referenceSolutions: ImmutablePropTypes.map,
  intl: intlShape.isRequired
};

export default injectIntl(connect(
  (state, { params: { exerciseId } }) => {
    const userId = loggedInUserIdSelector(state);
    return {
      exercise: exerciseSelector(exerciseId)(state),
      supervisedGroups: supervisorOfSelector(userId)(state),
      isAuthorOfExercise: (exerciseId) => canEditExercise(userId, exerciseId)(state),
      referenceSolutions: referenceSolutionsSelector(exerciseId)(state)
    };
  },
  (dispatch, { params: { exerciseId } }) => ({
    loadAsync: () => Exercise.loadAsync({ exerciseId }, dispatch),
    assignExercise: (groupId) => dispatch(assignExercise(groupId, exerciseId)),
    push: (url) => dispatch(push(url))
  })
)(Exercise));
