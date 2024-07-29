import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Link } from 'react-router-dom';
import { Table } from 'react-bootstrap';

import GroupsNameContainer from '../../../containers/GroupsNameContainer';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import AssignmentNameContainer from '../../../containers/AssignmentNameContainer';
import SolutionActionsContainer from '../../../containers/SolutionActionsContainer';
import DeleteSolutionButtonContainer from '../../../containers/DeleteSolutionButtonContainer';
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
import withLinks from '../../../helpers/withLinks.js';

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

    return solutionsState === resourceStatus.FULFILLED && (!solutions || Object.keys(solutions).length === 0) ? null : (
      <Box
        title={
          <FormattedMessage id="app.reviewRequestsList.title" defaultMessage="Solutions with requested code reviews" />
        }
        noPadding
        isOpen
        customIcons={
          solutionsState !== resourceStatus.PENDING &&
          refresh && <RefreshIcon className="text-primary" timid onClick={refresh} gapRight />
        }>
        <>
          {solutionsState === resourceStatus.PENDING && (
            <div className="text-center my-3">
              <LoadingIcon />
            </div>
          )}

          {solutionsState === resourceStatus.FAILED && (
            <div className="text-center my-3">
              <WarningIcon className="text-danger" gapRight />
              <FormattedMessage
                id="app.reviewRequestsList.failed"
                defaultMessage="Loading of the requested reviews failed. Please try refreshing this component later."
              />
            </div>
          )}

          {solutionsState === resourceStatus.FULFILLED && (
            <Table hover className="mb-0">
              {Object.keys(solutions).map(groupId => (
                <tbody key={groupId}>
                  <tr className="bg-light">
                    <td className="shrink-col">
                      <GroupIcon className="text-muted" />
                    </td>
                    <td colSpan={7}>
                      <GroupsNameContainer groupId={groupId} fullName translations links />
                    </td>
                    <td className="text-right text-muted">
                      <Icon
                        icon={!this.state[`group-${groupId}`] ? 'circle-chevron-down' : 'circle-chevron-left'}
                        gapRight
                        timid
                        onClick={() => this.toggleGroupOpened(groupId)}
                      />
                    </td>
                  </tr>

                  {!this.state[`group-${groupId}`] &&
                    Object.keys(solutions[groupId]).map(assignmentId =>
                      solutions[groupId][assignmentId].map((solution, idx) => (
                        <tr key={solution ? solution.id : `loading-${idx}`} className="ml-4">
                          <td className="shrink-col"></td>
                          <td className="shrink-col">
                            <AssignmentIcon className="text-muted" />
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
                                <small className="ml-2 text-muted">
                                  (<DateTime unixts={solution.createdAt} />)
                                </small>
                              </td>

                              <td className="text-center text-nowrap valign-middle">
                                {solution.lastSubmission.evaluation ? (
                                  <strong className="text-success">
                                    <FormattedNumber style="percent" value={solution.lastSubmission.evaluation.score} />
                                  </strong>
                                ) : (
                                  <span className="text-danger">-</span>
                                )}
                              </td>

                              <td className="text-center text-nowrap valign-middle">
                                {solution.lastSubmission.evaluation ? (
                                  <strong className="text-success">
                                    <Points
                                      points={solution.actualPoints}
                                      bonusPoints={solution.bonusPoints}
                                      maxPoints={solution.maxPoints}
                                    />
                                  </strong>
                                ) : (
                                  <span className="text-danger">-</span>
                                )}
                              </td>

                              <td className="text-center text-nowrap valign-middle">
                                <EnvironmentsListItem
                                  runtimeEnvironment={runtimeEnvironments.find(
                                    ({ id }) => id === solution.runtimeEnvironmentId
                                  )}
                                />
                              </td>

                              <td className="shrink-col text-right">
                                <TheButtonGroup>
                                  {solution.permissionHints && solution.permissionHints.viewDetail && (
                                    <>
                                      <Link to={SOLUTION_DETAIL_URI_FACTORY(assignmentId, solution.id)}>
                                        <Button size="xs" variant="secondary">
                                          <DetailIcon gapRight />
                                          <FormattedMessage id="generic.detail" defaultMessage="Detail" />
                                        </Button>
                                      </Link>
                                      <Link to={SOLUTION_SOURCE_CODES_URI_FACTORY(assignmentId, solution.id)}>
                                        <Button size="xs" variant="primary">
                                          <CodeFileIcon fixedWidth gapRight />
                                          <FormattedMessage id="generic.files" defaultMessage="Files" />
                                        </Button>
                                      </Link>
                                    </>
                                  )}

                                  {solution.permissionHints &&
                                    (solution.permissionHints.setFlag || solution.permissionHints.review) && (
                                      <SolutionActionsContainer id={solution.id} showAllButtons dropdown />
                                    )}

                                  {solution.permissionHints && solution.permissionHints.delete && (
                                    <DeleteSolutionButtonContainer id={solution.id} groupId={groupId} size="xs" />
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
