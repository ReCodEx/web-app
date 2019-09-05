import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import PageContent from '../../components/layout/PageContent';
import Box from '../../components/widgets/Box';
import ExercisesListContainer from '../../containers/ExercisesListContainer';
import withLinks from '../../helpers/withLinks';

class Exercises extends Component {
  render() {
    return (
      <PageContent
        title={<FormattedMessage id="app.exercises.title" defaultMessage="Exercise List" />}
        description={
          <FormattedMessage id="app.instance.description" defaultMessage="List and assign exercises to your groups." />
        }
        breadcrumbs={[
          {
            text: <FormattedMessage id="app.exercises.title" defaultMessage="Exercise List" />,
            iconName: 'puzzle-piece',
          },
        ]}>
        <Box title={<FormattedMessage id="app.exercises.listTitle" defaultMessage="Exercises" />} unlimitedHeight>
          <ExercisesListContainer id="exercises-all" showGroups />
        </Box>
      </PageContent>
    );
  }
}

Exercises.propTypes = {
  query: PropTypes.string,
  links: PropTypes.object.isRequired,
};

export default withLinks(Exercises);
