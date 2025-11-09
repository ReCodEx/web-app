import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Link } from 'react-router-dom';
import { Table, Badge } from 'react-bootstrap';
import { lruMemoize } from 'reselect';

import GroupsNameContainer from '../../../containers/GroupsNameContainer';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import AssignmentNameContainer from '../../../containers/AssignmentNameContainer';
import SolutionActionsContainer from '../../../containers/SolutionActionsContainer';
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
  WarningIcon,
} from '../../icons';
import { resourceStatus } from '../../../redux/helpers/resourceManager';
import { objectMap } from '../../../helpers/common.js';
import withLinks from '../../../helpers/withLinks.js';

const getGroupsCount = lruMemoize(
  groups => groups && objectMap(groups, g => Object.values(g).reduce((count, solutions) => count + solutions.length, 0))
);

class ReviewRequestsList extends Component {
  state = {};

  toggleGroupOpened = id => this.setState({ [`group-${id}`]: !this.state[`group-${id}`] });

  render() {
    const {
      solutionsState = resourceStatus.PENDING,
      solutions = {},
      runtimeEnvironments,
      refresh = null,
      links: { SOLUTION_DETAIL_URI_FACTORY, SOLUTION_SOURCE_CODES_URI_FACTORY, GROUP_USER_SOLUTIONS_URI_FACTORY },
    } = this.props;

    const groupCounts = getGroupsCount(solutions);

    return solutionsState === resourceStatus.FULFILLED && (!solutions || Object.keys(solutions).length === 0) ? null : (
      <Box
        title={
          <FormattedMessage id="app.reviewRequestsList.title" defaultMessage="Solutions with requested code reviews" />
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
                id="app.reviewRequestsList.failed"
                defaultMessage="Loading of the requested reviews failed. Please try refreshing this component later."
              />
            </div>
          )}

          {solutionsState === resourceStatus.FULFILLED && (
            <Table hover className="card-table">
              {Object.keys(solutions).map(groupId => (
                <tbody key={groupId}>
                  <tr className="bg-light">
                    <td className="shrink-col">
                      <GroupIcon className="text-body-secondary" />
                    </td>
                    <td colSpan={7}>
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

                              <td className="shrink-col text-end">
                                <TheButtonGroup>
                                  {solution.permissionHints &&
                                    (solution.permissionHints.setFlag || solution.permissionHints.review) && (
                                      <SolutionActionsContainer id={solution.id} knownActions={['open']} size="xs" />
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
                            <td colSpan={6}>
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

ReviewRequestsList.propTypes = {
  solutions: PropTypes.object,
  solutionsState: PropTypes.string,
  runtimeEnvironments: PropTypes.array.isRequired,
  refresh: PropTypes.func,
  links: PropTypes.object,
};

export default withLinks(ReviewRequestsList);
