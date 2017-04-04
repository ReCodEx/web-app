import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, defineMessages, intlShape, injectIntl } from 'react-intl';
import PageContent from '../../components/PageContent';


const messages = defineMessages({
  title: {
    id: 'app.exercise.referenceSolutionTitle',
    defaultMessage: 'Reference solution overview'
  }
});

class ReferenceSolution extends Component {

  static loadAsync = ({  }, dispatch) => {

  }

  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    //if (this.props.params.submissionId !== newProps.params.submissionId) {
      newProps.loadAsync();
    //}
  }

  render() {
    const {
      params: { exerciseId },
      intl: { formatMessage }
    } = this.props;

    const {
      links: { EXERCISES_URI, EXERCISE_URI_FACTORY }
    } = this.context;

    return (
      <PageContent
        title={formatMessage(messages.title)}
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

      </PageContent>
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
  }).isRequired
};

export default injectIntl(connect(
  (state, { params: { exerciseId, referenceSolutionId } }) => ({
  }),
  (dispatch, { params }) => ({
    loadAsync: () => ReferenceSolution.loadAsync(params, dispatch)
  })
)(ReferenceSolution));
