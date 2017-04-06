import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, defineMessages, intlShape, injectIntl } from 'react-intl';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Page from '../../components/Page';

import { fetchReferenceSolutionsIfNeeded } from '../../redux/modules/referenceSolutions';
import { referenceSolutionsSelector } from '../../redux/selectors/referenceSolutions';


const messages = defineMessages({
  title: {
    id: 'app.exercise.referenceSolutionTitle',
    defaultMessage: 'Reference solution overview'
  }
});

class ReferenceSolution extends Component {

  static loadAsync = ({ exerciseId }, dispatch) => Promise.all([
    dispatch(fetchReferenceSolutionsIfNeeded(exerciseId))
  ]);

  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.referenceSolutionId !== newProps.params.referenceSolutionId) {
      newProps.loadAsync();
    }
  }

  render() {
    const {
      referenceSolutions,
      params: { exerciseId, referenceSolutionId },
      intl: { formatMessage }
    } = this.props;

    const {
      links: { EXERCISES_URI, EXERCISE_URI_FACTORY }
    } = this.context;

    return (
      <Page
        title={formatMessage(messages.title)}
        resource={referenceSolutions}
        description={<FormattedMessage id='app.exercise.description' defaultMessage='Exercise overview' />}
        breadcrumbs={[
          {
            text: <FormattedMessage id='app.exercises.title' defaultMessage="Exercises" />,
            iconName: 'puzzle-piece',
            link: EXERCISES_URI
          },
          {
            text: <FormattedMessage id='app.exercise.description' defaultMessage="Exercise overview" />,
            iconName: 'lightbulb-o',
            link: EXERCISE_URI_FACTORY(exerciseId)
          },
          {
            text: <FormattedMessage id='app.exercise.referenceSolutionDetail' defaultMessage="Reference solution detail" />,
            iconName: 'diamond'
          }
        ]}>
          {referenceSolutions => {
            const referenceSolution = referenceSolutions.find(solution => solution.id === referenceSolutionId);
            return (<div>{referenceSolution.description}</div>)
          }}
      </Page>
    );
  }

}

ReferenceSolution.contextTypes = {
  router: PropTypes.object,
  links: PropTypes.object,
  intl: intlShape.isRequired
};

ReferenceSolution.propTypes = {
  params: PropTypes.shape({
    exerciseId: PropTypes.string.isRequired,
    referenceSolutionId: PropTypes.string.isRequired
  }).isRequired,
  referenceSolutions: ImmutablePropTypes.map
};

export default injectIntl(connect(
  (state, { params: { exerciseId, referenceSolutionId } }) => ({
    referenceSolutions: referenceSolutionsSelector(exerciseId)(state)
  }),
  (dispatch, { params }) => ({
    loadAsync: () => ReferenceSolution.loadAsync(params, dispatch)
  })
)(ReferenceSolution));
