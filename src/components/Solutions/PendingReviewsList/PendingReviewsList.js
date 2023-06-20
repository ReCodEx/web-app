import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import GroupsNameContainer from '../../../containers/GroupsNameContainer';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import AssignmentNameContainer from '../../../containers/AssignmentNameContainer';
import DateTime from '../../widgets/DateTime';
import Button from '../../widgets/TheButton';
import Box from '../../widgets/Box';
import Icon, { AssignmentIcon, GroupIcon, LoadingIcon, RefreshIcon, WarningIcon } from '../../icons';
import { resourceStatus } from '../../../redux/helpers/resourceManager';
import withLinks from '../../../helpers/withLinks';

class PendingReviewsList extends Component {
  state = { allPending: false };

  closeAll = () => {
    const { solutions, closeReview, refresh } = this.props;

    this.setState({ allPending: true });

    const params = [];
    Object.keys(solutions).forEach(groupId =>
      Object.keys(solutions[groupId]).forEach(assignmentId =>
        solutions[groupId][assignmentId].forEach(solution =>
          params.push({ groupId, assignmentId, solutionId: solution.id })
        )
      )
    );

    return Promise.all(params.map(closeReview)).then(() => {
      this.setState({ allPending: false });
      refresh && refresh();
    }, refresh);
  };

  render() {
    const {
      state = resourceStatus.PENDING,
      solutions = {},
      updatingSelector,
      closeReview = null,
      refresh = null,
      links: { SOLUTION_SOURCE_CODES_URI_FACTORY },
    } = this.props;

    return state === resourceStatus.FULFILLED && (!solutions || Object.keys(solutions).length === 0) ? null : (
      <Box
        title={<FormattedMessage id="app.pendingReviewsList.title" defaultMessage="All open reviews" />}
        footer={
          state === resourceStatus.FULFILLED ? (
            <div className="text-center">
              <Button variant="success" onClick={this.closeAll} disabled={this.state.allPending}>
                {this.state.allPending ? <LoadingIcon gapRight /> : <Icon icon="boxes-packing" gapRight />}
                <FormattedMessage id="app.reviewSolutionButtons.closeAll" defaultMessage="Close All Open Reviews" />
              </Button>
            </div>
          ) : null
        }
        noPadding
        isOpen
        customIcons={
          state !== resourceStatus.PENDING &&
          refresh && <RefreshIcon className="text-primary" timid onClick={refresh} gapRight />
        }>
        <>
          {state === resourceStatus.PENDING && (
            <div className="text-center my-3">
              <LoadingIcon />
            </div>
          )}

          {state === resourceStatus.FAILED && (
            <div className="text-center my-3">
              <WarningIcon className="text-danger" gapRight />
              <FormattedMessage
                id="app.pendingReviewsList.failed"
                defaultMessage="Loading of the open reviews failed. Please try refreshing this component later."
              />
            </div>
          )}

          {state === resourceStatus.FULFILLED &&
            Object.keys(solutions).map(groupId => (
              <div key={groupId} className="m-3">
                <GroupIcon className="text-muted" gapRight />
                <GroupsNameContainer groupId={groupId} fullName translations links />

                {Object.keys(solutions[groupId]).map(assignmentId => (
                  <div key={assignmentId} className="ml-4 my-1">
                    <AssignmentIcon className="text-muted" gapRight />
                    <AssignmentNameContainer assignmentId={assignmentId} />

                    {solutions[groupId][assignmentId].map((solution, idx) => (
                      <div key={solution ? solution.id : `loading-${idx}`} className="ml-4">
                        {solution ? (
                          <>
                            <Link to={SOLUTION_SOURCE_CODES_URI_FACTORY(assignmentId, solution.id)}>
                              <span>
                                <UsersNameContainer userId={solution.authorId} isSimple noAutoload />
                              </span>
                              #{solution.attemptIndex}{' '}
                              <span className="px-1 text-muted">
                                <FormattedMessage id="app.pendingReviewsList.submitted" defaultMessage="submitted" />
                              </span>{' '}
                              <DateTime unixts={solution.createdAt} showTime={false} /> (
                              <DateTime unixts={solution.createdAt} showDate={false} />){' '}
                            </Link>
                            <span className="px-1 text-muted">
                              <FormattedMessage
                                id="app.pendingReviewsList.reviewOpenedAt"
                                defaultMessage="review opened at"
                              />{' '}
                            </span>
                            <DateTime unixts={solution.review.startedAt} showTime={false} /> (
                            <DateTime unixts={solution.review.startedAt} showDate={false} />)
                            {closeReview && (
                              <Button
                                size="xs"
                                variant="success"
                                className="ml-3"
                                disabled={updatingSelector(solution.id)}
                                onClick={() => closeReview({ groupId, assignmentId, solutionId: solution.id })}>
                                {updatingSelector(solution.id) ? (
                                  <LoadingIcon gapRight />
                                ) : (
                                  <Icon icon="boxes-packing" gapRight />
                                )}
                                <FormattedMessage
                                  id="app.solution.actions.review.close"
                                  defaultMessage="Close Review"
                                />
                              </Button>
                            )}
                          </>
                        ) : (
                          <LoadingIcon />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
        </>
      </Box>
    );
  }
}

PendingReviewsList.propTypes = {
  solutions: PropTypes.object,
  state: PropTypes.string,
  updatingSelector: PropTypes.func.isRequired,
  closeReview: PropTypes.func,
  refresh: PropTypes.func,
  links: PropTypes.object,
};

export default withLinks(PendingReviewsList);
