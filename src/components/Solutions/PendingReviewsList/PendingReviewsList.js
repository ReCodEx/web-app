import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Link } from 'react-router-dom';
import { Table, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { lruMemoize } from 'reselect';

import GroupsNameContainer from '../../../containers/GroupsNameContainer';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import AssignmentNameContainer from '../../../containers/AssignmentNameContainer';
import DateTime from '../../widgets/DateTime';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Box from '../../widgets/Box';
import EnvironmentsListItem from '../../helpers/EnvironmentsList/EnvironmentsListItem.js';
import Points from '../../Assignments/SolutionsTable/Points.js';
import Icon, {
  AssignmentIcon,
  CodeFileIcon,
  DetailIcon,
  GroupIcon,
  LoadingIcon,
  RefreshIcon,
  ReviewIcon,
  WarningIcon,
} from '../../icons';
import { resourceStatus } from '../../../redux/helpers/resourceManager';
import { objectMap } from '../../../helpers/common.js';
import withLinks from '../../../helpers/withLinks.js';

const getGroupsCount = lruMemoize(
  groups => groups && objectMap(groups, g => Object.values(g).reduce((count, solutions) => count + solutions.length, 0))
);

class PendingReviewsList extends Component {
  state = { allPending: false };

  toggleGroupOpened = id => this.setState({ [`group-${id}`]: !this.state[`group-${id}`] });

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
      solutionsState = resourceStatus.PENDING,
      solutions = {},
      runtimeEnvironments,
      updatingSelector,
      closeReview = null,
      refresh = null,
      links: { SOLUTION_DETAIL_URI_FACTORY, SOLUTION_SOURCE_CODES_URI_FACTORY, GROUP_USER_SOLUTIONS_URI_FACTORY },
    } = this.props;

    const groupCounts = getGroupsCount(solutions);

    return solutionsState === resourceStatus.FULFILLED && (!solutions || Object.keys(solutions).length === 0) ? null : (
      <Box
        title={<FormattedMessage id="app.pendingReviewsList.title" defaultMessage="All open reviews" />}
        footer={
          solutionsState === resourceStatus.FULFILLED ? (
            <div className="text-center">
              <Button variant="success" onClick={this.closeAll} disabled={this.state.allPending}>
                {this.state.allPending ? <LoadingIcon gapRight={2} /> : <Icon icon="boxes-packing" gapRight={2} />}
                <FormattedMessage id="app.reviewSolutionButtons.closeAll" defaultMessage="Close All Open Reviews" />
              </Button>
            </div>
          ) : null
        }
        noPadding
        isOpen
        customIcons={
          solutionsState !== resourceStatus.PENDING &&
          refresh && <RefreshIcon className="text-primary" timid onClick={refresh} gapRight={2} />
        }>
        <>
          {solutionsState === resourceStatus.PENDING && (
            <div className="text-center my-3">
              <LoadingIcon />
            </div>
          )}

          {solutionsState === resourceStatus.FAILED && (
            <div className="text-center my-3">
              <WarningIcon className="text-danger" gapRight={2} />
              <FormattedMessage
                id="app.pendingReviewsList.failed"
                defaultMessage="Loading of the open reviews failed. Please try refreshing this component later."
              />
            </div>
          )}

          {solutionsState === resourceStatus.FULFILLED && (
            <Table hover className="mb-0">
              {Object.keys(solutions).map(groupId => (
                <tbody key={groupId}>
                  <tr className="bg-light">
                    <td className="icon-col">
                      <GroupIcon />
                    </td>
                    <td colSpan={8}>
                      <GroupsNameContainer groupId={groupId} fullName translations links />
                    </td>
                    <td className="text-end text-body-secondary">
                      {this.state[`group-${groupId}`] && (
                        <Badge bg="primary" pill className="px-2 me-3">
                          {groupCounts?.[groupId]}
                        </Badge>
                      )}
                      <Icon
                        className="align-middle"
                        icon={!this.state[`group-${groupId}`] ? 'circle-chevron-down' : 'circle-chevron-left'}
                        gapRight={2}
                        timid
                        onClick={() => this.toggleGroupOpened(groupId)}
                      />
                    </td>
                  </tr>

                  {!this.state[`group-${groupId}`] &&
                    Object.keys(solutions[groupId]).map(assignmentId =>
                      solutions[groupId][assignmentId].map((solution, idx) => (
                        <tr key={solution ? solution.id : `loading-${idx}`} className="ms-4">
                          <td className="shrink-col"></td>
                          <td className="shrink-col">
                            <AssignmentIcon className="text-body-secondary" />
                          </td>
                          <td>
                            <AssignmentNameContainer assignmentId={assignmentId} solutionsLink />
                          </td>

                          {solution ? (
                            <>
                              <td>
                                <UsersNameContainer
                                  userId={solution.authorId}
                                  noAutoload
                                  link={GROUP_USER_SOLUTIONS_URI_FACTORY(groupId, solution.authorId)}
                                />
                              </td>

                              <td>
                                <strong>#{solution.attemptIndex} </strong>
                                <small className="ms-2 text-body-secondary">
                                  (<DateTime unixTs={solution.createdAt} />)
                                </small>
                              </td>

                              <td className="text-center text-nowrap align-middle">
                                {solution.lastSubmission.evaluation ? (
                                  <span className={`${solution.isBestSolution ? 'fw-bold' : ''}`}>
                                    <FormattedNumber style="percent" value={solution.lastSubmission.evaluation.score} />
                                  </span>
                                ) : (
                                  <span className="text-danger">-</span>
                                )}
                              </td>

                              <td className="text-center text-nowrap align-middle">
                                {solution.lastSubmission.evaluation ? (
                                  <span className={`${solution.isBestSolution ? 'fw-bold' : ''}`}>
                                    <Points
                                      points={solution.actualPoints}
                                      bonusPoints={solution.bonusPoints}
                                      maxPoints={solution.maxPoints}
                                    />
                                  </span>
                                ) : (
                                  <span className="text-danger">-</span>
                                )}
                              </td>

                              <td className="text-center text-nowrap align-middle">
                                <EnvironmentsListItem
                                  runtimeEnvironment={runtimeEnvironments.find(
                                    ({ id }) => id === solution.runtimeEnvironmentId
                                  )}
                                />
                              </td>

                              <td>
                                <OverlayTrigger
                                  placement="bottom"
                                  overlay={
                                    <Tooltip id={`review-tip-${solution.id}`}>
                                      <FormattedMessage
                                        id="app.pendingReviewsList.reviewOpenedAt"
                                        defaultMessage="Review opened at"
                                      />
                                    </Tooltip>
                                  }>
                                  <span>
                                    <ReviewIcon review={solution.review} className="text-danger me-2" />
                                    <small>
                                      <DateTime unixTs={solution.review.startedAt} />
                                    </small>
                                  </span>
                                </OverlayTrigger>
                              </td>

                              <td className="shrink-col text-end">
                                <TheButtonGroup>
                                  {closeReview && (
                                    <Button
                                      size="xs"
                                      variant="success"
                                      disabled={updatingSelector(solution.id)}
                                      onClick={() => closeReview({ groupId, assignmentId, solutionId: solution.id })}>
                                      {updatingSelector(solution.id) ? (
                                        <LoadingIcon gapRight={2} />
                                      ) : (
                                        <Icon icon="boxes-packing" gapRight={2} />
                                      )}
                                      <FormattedMessage
                                        id="app.solution.actions.review.close"
                                        defaultMessage="Close Review"
                                      />
                                    </Button>
                                  )}

                                  {solution.permissionHints && solution.permissionHints.viewDetail && (
                                    <>
                                      <Link to={SOLUTION_DETAIL_URI_FACTORY(assignmentId, solution.id)}>
                                        <Button size="xs" variant="secondary">
                                          <DetailIcon gapRight={2} />
                                          <FormattedMessage id="generic.detail" defaultMessage="Detail" />
                                        </Button>
                                      </Link>
                                      <Link to={SOLUTION_SOURCE_CODES_URI_FACTORY(assignmentId, solution.id)}>
                                        <Button size="xs" variant="primary">
                                          <CodeFileIcon fixedWidth gapRight={2} />
                                          <FormattedMessage id="generic.files" defaultMessage="Files" />
                                        </Button>
                                      </Link>
                                    </>
                                  )}
                                </TheButtonGroup>
                              </td>
                            </>
                          ) : (
                            <td colSpan={7}>
                              <LoadingIcon />
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                </tbody>
              ))}
            </Table>
          )}
        </>
      </Box>
    );
  }
}

PendingReviewsList.propTypes = {
  solutions: PropTypes.object,
  solutionsState: PropTypes.string,
  runtimeEnvironments: PropTypes.array.isRequired,
  updatingSelector: PropTypes.func.isRequired,
  closeReview: PropTypes.func,
  refresh: PropTypes.func,
  links: PropTypes.object,
};

export default withLinks(PendingReviewsList);
