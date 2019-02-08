import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { push } from 'react-router-redux';

import PageContent from '../../components/layout/PageContent';
import Box from '../../components/widgets/Box';
import ExercisesListContainer from '../../containers/ExercisesListContainer';
import { EMPTY_OBJ } from '../../helpers/common';
import withLinks from '../../helpers/withLinks';

class Exercises extends Component {
  render() {
    return (
      <PageContent
        title={
          <FormattedMessage
            id="app.exercises.title"
            defaultMessage="Exercise List"
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
                defaultMessage="Exercise List"
              />
            ),
            iconName: 'puzzle-piece',
          },
        ]}>
        <Box
          title={
            <FormattedMessage
              id="app.exercises.listTitle"
              defaultMessage="Exercises"
            />
          }
          unlimitedHeight>
          <ExercisesListContainer id="exercises-all" showGroups />
        </Box>
      </PageContent>
    );
  }
}

Exercises.propTypes = {
  query: PropTypes.string,
  push: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
};

export default withLinks(
  connect(
    state => EMPTY_OBJ,
    dispatch => ({
      push: url => dispatch(push(url)),
    })
  )(Exercises)
);
