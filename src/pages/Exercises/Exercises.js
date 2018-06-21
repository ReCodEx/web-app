import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { push } from 'react-router-redux';
import { LinkContainer } from 'react-router-bootstrap';

import PageContent from '../../components/layout/PageContent';
import Box from '../../components/widgets/Box';
import DeleteExerciseButtonContainer from '../../containers/DeleteExerciseButtonContainer';
import SearchContainer from '../../containers/SearchContainer';
import ExercisesList from '../../components/Exercises/ExercisesList';
import Button from '../../components/widgets/FlatButton';
import { EditIcon } from '../../components/icons';

import { searchExercises } from '../../redux/modules/search';
import { fetchInstanceGroups } from '../../redux/modules/groups';
import { selectedInstanceId } from '../../redux/selectors/auth';
import {
  canLoggedUserEditExercise,
  isLoggedAsSuperAdmin
} from '../../redux/selectors/users';
import { getSearchQuery } from '../../redux/selectors/search';

import withLinks from '../../helpers/withLinks';

class Exercises extends Component {
  static loadAsync = (params, dispatch, { instanceId }) =>
    instanceId ? dispatch(fetchInstanceGroups(instanceId)) : Promise.resolve();

  componentWillMount() {
    this.props.loadAsync(this.props.instanceId);
  }

  render() {
    const {
      query,
      isAuthorOfExercise,
      search,
      links: {
        EXERCISE_EDIT_URI_FACTORY,
        EXERCISE_EDIT_SIMPLE_CONFIG_URI_FACTORY,
        EXERCISE_EDIT_LIMITS_URI_FACTORY
      }
    } = this.props;

    return (
      <PageContent
        title={
          <FormattedMessage
            id="app.exercises.title"
            defaultMessage="Exercise list"
          />
        }
        description={
          <FormattedMessage
            id="app.instance.description"
            defaultMessage="List and assign exercises to your groups."
          />
        }
        breadcrumbs={[
          {
            text: (
              <FormattedMessage
                id="app.exercises.title"
                defaultMessage="Exercise list"
              />
            ),
            iconName: 'puzzle-piece'
          }
        ]}
      >
        <Box
          title={
            <FormattedMessage
              id="app.exercises.listTitle"
              defaultMessage="Exercises"
            />
          }
          unlimitedHeight
        >
          <SearchContainer
            type="exercises"
            id="exercises-page"
            search={search}
            showAllOnEmptyQuery={true}
            renderList={exercises =>
              <ExercisesList
                exercises={exercises}
                createActions={id =>
                  isAuthorOfExercise(id) &&
                  <div>
                    <LinkContainer to={EXERCISE_EDIT_URI_FACTORY(id)}>
                      <Button bsSize="xs" bsStyle="warning">
                        <EditIcon gapRight />
                        <FormattedMessage
                          id="app.exercises.listEdit"
                          defaultMessage="Settings"
                        />
                      </Button>
                    </LinkContainer>
                    <LinkContainer
                      to={EXERCISE_EDIT_SIMPLE_CONFIG_URI_FACTORY(id)}
                    >
                      <Button bsSize="xs" bsStyle="warning">
                        <EditIcon gapRight />
                        <FormattedMessage
                          id="app.exercises.listEditConfig"
                          defaultMessage="Tests"
                        />
                      </Button>
                    </LinkContainer>
                    <LinkContainer to={EXERCISE_EDIT_LIMITS_URI_FACTORY(id)}>
                      <Button bsSize="xs" bsStyle="warning">
                        <EditIcon gapRight />
                        <FormattedMessage
                          id="app.exercises.listEditLimits"
                          defaultMessage="Limits"
                        />
                      </Button>
                    </LinkContainer>

                    <DeleteExerciseButtonContainer
                      id={id}
                      bsSize="xs"
                      resourceless={true}
                      onDeleted={() => search(query)}
                    />
                  </div>}
              />}
          />
        </Box>
      </PageContent>
    );
  }
}

Exercises.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  instanceId: PropTypes.string.isRequired,
  query: PropTypes.string,
  isAuthorOfExercise: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  search: PropTypes.func
};

export default withLinks(
  connect(
    state => {
      return {
        instanceId: selectedInstanceId(state),
        query: getSearchQuery('exercises-page')(state),
        isSuperAdmin: isLoggedAsSuperAdmin(state),
        isAuthorOfExercise: exerciseId =>
          canLoggedUserEditExercise(exerciseId)(state)
      };
    },
    dispatch => ({
      loadAsync: instanceId =>
        Exercises.loadAsync({}, dispatch, { instanceId }),
      push: url => dispatch(push(url)),
      search: query => dispatch(searchExercises()('exercises-page', query))
    })
  )(Exercises)
);
