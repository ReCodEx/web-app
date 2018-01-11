import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import Page from '../../components/layout/Page';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { fetchAllFailures } from '../../redux/modules/submissionFailures';

class SubmissionFailures extends Component {
  static loadAsync = ({}, dispatch) =>
    Promise.all([dispatch(fetchAllFailures)]);

  componentWillMount() {
    this.props.loadAsync();
  }

  render() {
    const { submissionFailures = [] } = this.props;

    return (
      <Page
        resource={submissionFailures}
        title={
          <FormattedMessage
            id="app.submissionFailures.title"
            defaultMessage="Submission Failures"
          />
        }
        description={
          <FormattedMessage
            id="app.submissionFailures.description"
            defaultMessage="Submission Failures"
          />
        }
        breadcrumbs={[
          {
            text: (
              <FormattedMessage
                id="app.submissionFailures.title"
                defaultMessage="Submission Failures"
              />
            ),
            iconName: 'fort-awesome'
          }
        ]}
      >
        <div />
      </Page>
    );
  }
}

SubmissionFailures.propTypes = {
  loadAsync: PropTypes.func.isRequired
};

export default connect(
  (state, { params: {} }) => ({}),
  (dispatch, { params }) => ({
    loadAsync: () => SubmissionFailures.loadAsync(params, dispatch)
  })
)(SubmissionFailures);
