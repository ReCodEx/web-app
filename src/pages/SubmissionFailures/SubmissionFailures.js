import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import PageContent from '../../components/layout/PageContent';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import {
  fetchAllFailures,
  resolveFailure
} from '../../redux/modules/submissionFailures';
import {
  fetchManyStatus,
  readySubmissionFailuresSelector
} from '../../redux/selectors/submissionFailures';
import FailuresList from '../../components/SubmissionFailures/FailuresList/FailuresList';
import Box from '../../components/widgets/Box/Box';
import ResolveFailure from '../../components/SubmissionFailures/ResolveFailure/ResolveFailure';
import { Button } from 'react-bootstrap';

class SubmissionFailures extends Component {
  state = { isOpen: false, activeId: null };

  static loadAsync = (params, dispatch) =>
    Promise.all([dispatch(fetchAllFailures)]);

  componentWillMount() {
    this.props.loadAsync();
  }

  render() {
    const { submissionFailures, fetchStatus, resolveFailure } = this.props;

    return (
      <FetchManyResourceRenderer
        fetchManyStatus={fetchStatus}
        loading={
          <PageContent
            title={
              <FormattedMessage
                id="app.submissionFailures.loading"
                defaultMessage="Loading list of failures ..."
              />
            }
            description={
              <FormattedMessage
                id="app.submissionFailures.loadingDescription"
                defaultMessage="Please wait while we are getting the list of failures ready."
              />
            }
          />
        }
        failed={
          <PageContent
            title={
              <FormattedMessage
                id="app.submissionFailures.failed"
                defaultMessage="Cannot load the list of failures"
              />
            }
            description={
              <FormattedMessage
                id="app.submissionFailures.failedDescription"
                defaultMessage="We are sorry for the inconvenience, please try again later."
              />
            }
          />
        }
      >
        {() =>
          <PageContent
            title={
              <FormattedMessage
                id="app.submissionFailures.title"
                defaultMessage="Submission Failures"
              />
            }
            description={
              <FormattedMessage
                id="app.submissionFailures.description"
                defaultMessage="Browse all submission failures"
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
            <Box
              title={
                <FormattedMessage
                  id="app.submissionFailures.listTitle"
                  defaultMessage="Submission Failures"
                />
              }
              unlimitedHeight
              noPadding
            >
              <div>
                <FailuresList
                  failures={submissionFailures}
                  createActions={id =>
                    <Button
                      bsStyle="warning"
                      className="btn-flat"
                      bsSize="sm"
                      onClick={() =>
                        this.setState({ isOpen: true, activeId: id })}
                    >
                      <FormattedMessage
                        id="app.submissionFailures.resolve"
                        defaultMessage="Resolve"
                      />
                    </Button>}
                />
                <ResolveFailure
                  isOpen={this.state.isOpen}
                  onClose={() =>
                    this.setState({ isOpen: false, activeId: null })}
                  onSubmit={data =>
                    resolveFailure(this.state.activeId, data.note).then(() =>
                      this.setState({ isOpen: false, activeId: null })
                    )}
                />
              </div>
            </Box>
          </PageContent>}
      </FetchManyResourceRenderer>
    );
  }
}

SubmissionFailures.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  fetchStatus: PropTypes.string,
  submissionFailures: PropTypes.array,
  resolveFailure: PropTypes.func
};

export default connect(
  state => ({
    fetchStatus: fetchManyStatus(state),
    submissionFailures: readySubmissionFailuresSelector(state)
  }),
  dispatch => ({
    loadAsync: () => SubmissionFailures.loadAsync({}, dispatch),
    resolveFailure: (id, note) => dispatch(resolveFailure(id, note))
  })
)(SubmissionFailures);
