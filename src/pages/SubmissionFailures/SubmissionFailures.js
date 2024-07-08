import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import PageContent from '../../components/layout/PageContent';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import { fetchAllFailures, resolveFailure } from '../../redux/modules/submissionFailures.js';
import { fetchManyStatus, readySubmissionFailuresSelector } from '../../redux/selectors/submissionFailures.js';
import FailuresList from '../../components/SubmissionFailures/FailuresList/FailuresList.js';
import Box from '../../components/widgets/Box/Box.js';
import ResolveFailure from '../../components/SubmissionFailures/ResolveFailure/ResolveFailure.js';
import Button from '../../components/widgets/TheButton';
import { EvaluationFailedIcon, LoadingIcon, WarningIcon } from '../../components/icons';

class SubmissionFailures extends Component {
  state = { isOpen: false, activeId: null };

  static loadAsync = (params, dispatch) => dispatch(fetchAllFailures());

  componentDidMount() {
    this.props.loadAsync();
  }

  render() {
    const { submissionFailures, fetchStatus, resolveFailure } = this.props;

    return (
      <FetchManyResourceRenderer
        fetchManyStatus={fetchStatus}
        loading={
          <PageContent
            icon={<LoadingIcon />}
            title={
              <FormattedMessage id="app.submissionFailures.loading" defaultMessage="Loading list of failures..." />
            }
          />
        }
        failed={
          <PageContent
            icon={<WarningIcon />}
            title={
              <FormattedMessage id="app.submissionFailures.failed" defaultMessage="Cannot load the list of failures" />
            }
            description={
              <FormattedMessage
                id="app.submissionFailures.failedDescription"
                defaultMessage="We are sorry for the inconvenience, please try again later."
              />
            }
          />
        }>
        {() => (
          <PageContent
            icon={<EvaluationFailedIcon />}
            title={<FormattedMessage id="app.submissionFailures.title" defaultMessage="Submission Failures" />}>
            <Box
              title={
                <FormattedMessage id="app.submissionFailures.listTitle" defaultMessage="List of submission failures" />
              }
              unlimitedHeight
              noPadding>
              <div>
                <FailuresList
                  failures={submissionFailures}
                  createActions={id => (
                    <Button variant="warning" size="xs" onClick={() => this.setState({ isOpen: true, activeId: id })}>
                      <FormattedMessage id="app.submissionFailures.resolve" defaultMessage="Resolve" />
                    </Button>
                  )}
                />
                <ResolveFailure
                  isOpen={this.state.isOpen}
                  onClose={() => this.setState({ isOpen: false, activeId: null })}
                  onSubmit={data =>
                    resolveFailure(this.state.activeId, data).then(() =>
                      this.setState({ isOpen: false, activeId: null })
                    )
                  }
                  initialValues={{ sendEmail: true }}
                />
              </div>
            </Box>
          </PageContent>
        )}
      </FetchManyResourceRenderer>
    );
  }
}

SubmissionFailures.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  fetchStatus: PropTypes.string,
  submissionFailures: PropTypes.array,
  resolveFailure: PropTypes.func,
};

export default connect(
  state => ({
    fetchStatus: fetchManyStatus(state),
    submissionFailures: readySubmissionFailuresSelector(state),
  }),
  dispatch => ({
    loadAsync: () => SubmissionFailures.loadAsync({}, dispatch),
    resolveFailure: (id, data) => dispatch(resolveFailure(id, data)),
  })
)(SubmissionFailures);
