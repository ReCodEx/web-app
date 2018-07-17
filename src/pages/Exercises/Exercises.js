import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { push } from 'react-router-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';

import PageContent from '../../components/layout/PageContent';
import Box from '../../components/widgets/Box';
import ExercisesListContainer from '../../containers/ExercisesListContainer';

import { searchExercises } from '../../redux/modules/search';
import { fetchInstanceGroups } from '../../redux/modules/groups';
import { selectedInstanceId } from '../../redux/selectors/auth';
import { selectedInstance } from '../../redux/selectors/instances';

import withLinks from '../../helpers/withLinks';

class Exercises extends Component {
  static loadAsync = (params, dispatch, { instanceId }) =>
    instanceId ? dispatch(fetchInstanceGroups(instanceId)) : Promise.resolve();

  componentWillMount() {
    this.props.loadAsync(this.props.instanceId);
  }

  render() {
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
          <ExercisesListContainer id="exercises-all" showGroups />
        </Box>
      </PageContent>
    );
  }
}

Exercises.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  instanceId: PropTypes.string.isRequired,
  instance: ImmutablePropTypes.map,
  query: PropTypes.string,
  push: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  search: PropTypes.func
};

export default withLinks(
  connect(
    state => {
      return {
        instanceId: selectedInstanceId(state),
        instance: selectedInstance(state)
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
