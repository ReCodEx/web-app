import React, { Component, useContext } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Table, Accordion, Card, OverlayTrigger, Popover } from 'react-bootstrap';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import AccordionContext from 'react-bootstrap/AccordionContext';
import { Link } from 'react-router-dom';

import Box from '../../components/widgets/Box';
import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import Callout from '../../components/widgets/Callout';
import UsersNameContainer from '../UsersNameContainer';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import SisCreateGroupForm from '../../components/forms/SisCreateGroupForm';
import SisBindGroupForm from '../../components/forms/SisBindGroupForm';
import Confirm from '../../components/forms/Confirm';
import CourseLabel, { getLocalizedData } from '../../components/SisIntegration/CourseLabel';
import DeleteGroupButtonContainer from '../../containers/DeleteGroupButtonContainer';
import Icon, {
  AddIcon,
  BindIcon,
  UnbindIcon,
  EditIcon,
  GroupIcon,
  AssignmentsIcon,
  LoadingIcon,
  StudentsIcon,
} from '../../components/icons';

import { fetchAllGroups, fetchGroupIfNeeded } from '../../redux/modules/groups.js';
import { fetchSisStatusIfNeeded } from '../../redux/modules/sisStatus.js';
import {
  fetchSisSupervisedCourses,
  sisCreateGroup,
  sisBindGroup,
  sisUnbindGroup,
} from '../../redux/modules/sisSupervisedCourses.js';
import { fetchSisPossibleParentsIfNeeded } from '../../redux/modules/sisPossibleParents.js';
import { sisPossibleParentsSelector } from '../../redux/selectors/sisPossibleParents.js';
import { sisStateSelector } from '../../redux/selectors/sisStatus.js';
import { sisSupervisedCoursesSelector } from '../../redux/selectors/sisSupervisedCourses.js';
import { loggedInUserIdSelector } from '../../redux/selectors/auth.js';
import { groupAccessorSelector, groupDataAccessorSelector } from '../../redux/selectors/groups.js';

import { getGroupCanonicalLocalizedName } from '../../helpers/localizedData.js';
import withLinks from '../../helpers/withLinks.js';
import { unique, arrayToObject, hasPermissions, safeGet } from '../../helpers/common.js';

const filterGroupsForBinding = (groups, alreadyBoundGroups) => {
  const bound = arrayToObject(alreadyBoundGroups);
  return groups.filter(group => !bound[group.id] && !group.organizational && !group.archived);
};

const MyAccordionButton = ({ children, eventKey }) => {
  const { activeEventKey } = useContext(AccordionContext);
  const decoratedOnClick = useAccordionButton(eventKey);
  const isCurrentEventKey = activeEventKey === eventKey;

  return (
    <div onClick={decoratedOnClick} className="clickable position-relative">
      <Icon
        className="float-end opacity-25 position-absolute end-0 top-50 translate-middle-y"
        icon={isCurrentEventKey ? 'circle-chevron-down' : 'circle-chevron-left'}
      />
      {children}
    </div>
  );
};

MyAccordionButton.propTypes = {
  children: PropTypes.any,
  eventKey: PropTypes.string.isRequired,
};

class SisSupervisorGroupsContainer extends Component {
  state = { createDialog: null, bindDialog: null, pendingUnbinds: {} };

  openCreateDialog = (possibleParents, course, term) => {
    this.setState({
      createDialog: {
        possibleParents,
        course: course.course,
        groupsCount: course.groups.length,
        term,
      },
    });
  };

  closeCreateDialog = () => {
    this.setState({ createDialog: null });
  };

  submitCreateDialog = data => {
    const { createGroup, currentUserId } = this.props;
    if (this.state.createDialog === null) {
      return;
    }

    const { course, term } = this.state.createDialog;
    return createGroup(course.code, data, currentUserId, term.year, term.term).then(res => {
      this.closeCreateDialog();
      return res;
    });
  };

  openBindDialog = (course, term) => {
    this.setState({
      bindDialog: {
        groups: filterGroupsForBinding(this.props.groups, course.groups),
        course: course.course,
        groupsCount: course.groups.length,
        term,
      },
    });
  };

  closeBindDialog = () => {
    this.setState({ bindDialog: null });
  };

  submitBindDialog = data => {
    const { bindGroup, currentUserId } = this.props;
    if (this.state.bindDialog === null) {
      return;
    }

    const { course, term } = this.state.bindDialog;
    return bindGroup(course.code, data, currentUserId, term.year, term.term).then(res => {
      this.closeBindDialog();
      return res;
    });
  };

  isUnbindPending = (courseId, groupId) => {
    const key = `${courseId}:${groupId}`;
    return Boolean(this.state.pendingUnbinds[key]);
  };

  unbindGroup = (courseId, groupId, userId, year, term) => {
    const key = `${courseId}:${groupId}`;
    this.setState({ pendingUnbinds: { ...this.state.pendingUnbinds, [key]: true } });
    this.props.unbindGroup(courseId, groupId, userId, year, term).finally(() => {
      this.setState({ pendingUnbinds: { ...this.state.pendingUnbinds, [key]: false } });
    });
  };

  componentDidMount() {
    this.props.loadData(this.props.currentUserId);
  }

  static loadData = (dispatch, loggedInUserId) => {
    dispatch(fetchSisStatusIfNeeded())
      .then(res => res.value)
      .then(
        ({ accessible, terms }) =>
          accessible &&
          terms
            .filter(({ isAdvertised }) => isAdvertised)
            .map(({ year, term }) =>
              dispatch(fetchSisSupervisedCourses(loggedInUserId, year, term))
                .then(res => res.value)
                .then(({ courses }) =>
                  courses.map(course =>
                    dispatch(fetchSisPossibleParentsIfNeeded(course.course.code))
                      .then(res => res.value)
                      .then(groups =>
                        unique(groups.reduce((acc, group) => acc.concat(group.parentGroupsIds), [])).map(groupId =>
                          dispatch(fetchGroupIfNeeded(groupId))
                        )
                      )
                  )
                )
            )
      );
  };

  render() {
    const {
      sisStatus,
      sisCourses,
      currentUserId,
      sisPossibleParents,
      groupsAccessor,
      groupsResourcesAccessor,
      links: {
        GROUP_EDIT_URI_FACTORY,
        GROUP_INFO_URI_FACTORY,
        GROUP_ASSIGNMENTS_URI_FACTORY,
        GROUP_STUDENTS_URI_FACTORY,
      },
      intl: { locale },
    } = this.props;

    return (
      <Box
        title={
          <FormattedMessage
            id="app.sisSupervisor.sisGroupsCreate"
            defaultMessage="Create Groups Associated with UK SIS Courses"
          />
        }
        unlimitedHeight>
        <div>
          <p className="text-body-secondary">
            <FormattedMessage
              id="app.sisSupervisor.sisGroupsCreateExplain"
              defaultMessage="SIS courses you teach in particular semesters and which have mapping to ReCodEx. You may create new groups with binding or bind existing groups to these courses."
            />
          </p>
          <Callout variant="warning">
            <FormattedMessage
              id="app.sisSupervisor.noUsersInNewGroupsWarning"
              defaultMessage="Please note that when a group is created from or bound to a SIS course, no students are added to this group. The binding process only ensures that the group is visible to the students and they are allowed to join it."
            />
          </Callout>

          <ResourceRenderer resource={sisStatus}>
            {sisStatus => (
              <div>
                {!sisStatus.accessible && (
                  <p className="text-center">
                    <FormattedMessage
                      id="app.sisSupervisor.noAccessible"
                      defaultMessage="Your account does not support SIS integration. Please, log in using CAS-UK."
                    />
                  </p>
                )}
                {sisStatus.accessible &&
                  sisStatus.terms
                    .filter(({ isAdvertised }) => isAdvertised)
                    .map((term, i) => (
                      <div key={i}>
                        <h4>
                          <FormattedMessage id="app.sisSupervisor.yearTerm" defaultMessage="Year and term:" />{' '}
                          {`${term.year}-${term.term}`}
                        </h4>
                        <ResourceRenderer resource={sisCourses.get(`${term.year}-${term.term}`)}>
                          {courses => (
                            <div>
                              {courses && Object.keys(courses).length > 0 ? (
                                <Accordion>
                                  {Object.values(courses)
                                    .sort(
                                      (a, b) =>
                                        getLocalizedData(a.course.captions, locale).localeCompare(
                                          getLocalizedData(b.course.captions, locale),
                                          locale
                                        ) || a.course.code.localeCompare(b.course.code, locale)
                                    )
                                    .map(course => (
                                      <Card key={course.course.code} className="card-light mb-3">
                                        <Card.Header>
                                          <MyAccordionButton eventKey={course.course.code}>
                                            {course && (
                                              <small>
                                                <CourseLabel {...course.course} groupsCount={course.groups.length} />
                                              </small>
                                            )}
                                          </MyAccordionButton>
                                        </Card.Header>

                                        <Accordion.Collapse eventKey={course.course.code}>
                                          <>
                                            <Card.Body>
                                              {course.groups.length > 0 ? (
                                                <Table hover className="m-0">
                                                  <thead>
                                                    <tr>
                                                      <th className="shrink-col" />
                                                      <th>
                                                        <FormattedMessage id="generic.name" defaultMessage="Name" />
                                                      </th>
                                                      <th>
                                                        <FormattedMessage
                                                          id="app.sisSupervisor.groupAdmins"
                                                          defaultMessage="Group Administrators"
                                                        />
                                                      </th>
                                                      <th />
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {course.groups.map(groupId => (
                                                      <ResourceRenderer
                                                        key={groupId}
                                                        resource={groupsResourcesAccessor(groupId)}
                                                        loading={
                                                          <tr>
                                                            <td colSpan="4">
                                                              <LoadingIcon />
                                                            </td>
                                                          </tr>
                                                        }>
                                                        {group =>
                                                          group ? (
                                                            <tr>
                                                              <td className="shrink-col">
                                                                {group.organizational && (
                                                                  <GroupIcon
                                                                    organizational
                                                                    gapRight={2}
                                                                    tooltipId={`hint:${course.course.code}:${group.id}`}
                                                                    tooltipPlacement="bottom"
                                                                    tooltip={
                                                                      <FormattedMessage
                                                                        id="app.sisSupervisor.organizationalGroupWarning"
                                                                        defaultMessage="Students cannot join organizational groups."
                                                                      />
                                                                    }
                                                                  />
                                                                )}
                                                              </td>
                                                              <td>
                                                                {getGroupCanonicalLocalizedName(
                                                                  group,
                                                                  groupsAccessor,
                                                                  locale
                                                                )}
                                                                {(
                                                                  safeGet(group, ['privateData', 'bindings', 'sis']) ||
                                                                  []
                                                                ).length > 1 && (
                                                                  <OverlayTrigger
                                                                    placement="right"
                                                                    overlay={
                                                                      <Popover id={`grp-pop-${group.id}`}>
                                                                        <Popover.Header>
                                                                          <FormattedMessage
                                                                            id="app.sisSupervisor.multiGroupPopover.title"
                                                                            defaultMessage="The group has multiple bindings:"
                                                                          />
                                                                        </Popover.Header>
                                                                        <Popover.Body>
                                                                          <ul className="ps-3">
                                                                            {group.privateData.bindings.sis
                                                                              .sort()
                                                                              .map(code => (
                                                                                <li key={code}>
                                                                                  <code>{code}</code>
                                                                                  {code === course.course.code && (
                                                                                    <Icon
                                                                                      icon={['far', 'star']}
                                                                                      className="text-body-secondary"
                                                                                      gapLeft={2}
                                                                                    />
                                                                                  )}
                                                                                </li>
                                                                              ))}
                                                                          </ul>
                                                                        </Popover.Body>
                                                                      </Popover>
                                                                    }>
                                                                    <span>
                                                                      <Icon
                                                                        icon="people-carry"
                                                                        gapLeft={3}
                                                                        className="text-warning"
                                                                      />
                                                                    </span>
                                                                  </OverlayTrigger>
                                                                )}
                                                              </td>
                                                              <td>
                                                                {group.primaryAdminsIds.map(id => (
                                                                  <UsersNameContainer key={id} userId={id} isSimple />
                                                                ))}
                                                              </td>
                                                              <td className="text-end">
                                                                <TheButtonGroup className="text-nowrap">
                                                                  {hasPermissions(group, 'update') && (
                                                                    <Link to={GROUP_EDIT_URI_FACTORY(group.id)}>
                                                                      <Button variant="warning" size="xs">
                                                                        <EditIcon
                                                                          gapLeft={1}
                                                                          gapRight={1}
                                                                          tooltipId={`edit/${course.course.code}/${group.id}`}
                                                                          tooltipPlacement="bottom"
                                                                          tooltip={
                                                                            <FormattedMessage
                                                                              id="app.editGroup.titleShort"
                                                                              defaultMessage="Edit Group"
                                                                            />
                                                                          }
                                                                        />
                                                                      </Button>
                                                                    </Link>
                                                                  )}

                                                                  <Link to={GROUP_INFO_URI_FACTORY(group.id)}>
                                                                    <Button variant="primary" size="xs">
                                                                      <GroupIcon
                                                                        gapLeft={1}
                                                                        gapRight={1}
                                                                        tooltipId={`info/${course.course.code}/${group.id}`}
                                                                        tooltipPlacement="bottom"
                                                                        tooltip={
                                                                          <FormattedMessage
                                                                            id="app.group.info"
                                                                            defaultMessage="Group Info"
                                                                          />
                                                                        }
                                                                      />
                                                                    </Button>
                                                                  </Link>

                                                                  {hasPermissions(group, 'viewDetail') && (
                                                                    <Link to={GROUP_ASSIGNMENTS_URI_FACTORY(group.id)}>
                                                                      <Button variant="primary" size="xs">
                                                                        <AssignmentsIcon
                                                                          gapLeft={1}
                                                                          gapRight={1}
                                                                          tooltipId={`assignments/${course.course.code}/${group.id}`}
                                                                          tooltipPlacement="bottom"
                                                                          tooltip={
                                                                            <FormattedMessage
                                                                              id="app.group.assignments"
                                                                              defaultMessage="Assignments"
                                                                            />
                                                                          }
                                                                        />
                                                                      </Button>
                                                                    </Link>
                                                                  )}

                                                                  {!group.organizational &&
                                                                    hasPermissions(group, 'viewAssignments') && (
                                                                      <Link to={GROUP_STUDENTS_URI_FACTORY(group.id)}>
                                                                        <Button variant="primary" size="xs">
                                                                          <StudentsIcon
                                                                            gapLeft={1}
                                                                            gapRight={1}
                                                                            tooltipId={`students/${course.course.code}/${group.id}`}
                                                                            tooltipPlacement="bottom"
                                                                            tooltip={
                                                                              <FormattedMessage
                                                                                id="app.group.students"
                                                                                defaultMessage="Students"
                                                                              />
                                                                            }
                                                                          />
                                                                        </Button>
                                                                      </Link>
                                                                    )}

                                                                  <Confirm
                                                                    id={`${course.course.code}:${group.id}`}
                                                                    onConfirmed={() =>
                                                                      this.unbindGroup(
                                                                        course.course.code,
                                                                        group.id,
                                                                        currentUserId,
                                                                        term.year,
                                                                        term.term
                                                                      )
                                                                    }
                                                                    question={
                                                                      <FormattedMessage
                                                                        id="app.group.unbind.confirmQuestion"
                                                                        defaultMessage="Do you really wish to unbind the group? The group will linger on, but it will be detached from the SIS so the students will not see it."
                                                                      />
                                                                    }
                                                                    disabled={this.isUnbindPending(
                                                                      course.course.code,
                                                                      group.id
                                                                    )}>
                                                                    <Button
                                                                      variant="danger"
                                                                      size="xs"
                                                                      disabled={this.isUnbindPending(
                                                                        course.course.code,
                                                                        group.id
                                                                      )}>
                                                                      {this.isUnbindPending(
                                                                        course.course.code,
                                                                        group.id
                                                                      ) ? (
                                                                        <LoadingIcon gapRight={2} />
                                                                      ) : (
                                                                        <UnbindIcon gapRight={2} />
                                                                      )}
                                                                      <FormattedMessage
                                                                        id="app.group.unbind"
                                                                        defaultMessage="Unbind"
                                                                      />
                                                                    </Button>
                                                                  </Confirm>

                                                                  {hasPermissions(group, 'remove') &&
                                                                    group.parentGroupId !== null &&
                                                                    group.childGroups.length === 0 && (
                                                                      <DeleteGroupButtonContainer
                                                                        id={group.id}
                                                                        size="xs"
                                                                      />
                                                                    )}
                                                                </TheButtonGroup>
                                                              </td>
                                                            </tr>
                                                          ) : null
                                                        }
                                                      </ResourceRenderer>
                                                    ))}
                                                  </tbody>
                                                </Table>
                                              ) : (
                                                <p className="text-center text-body-secondary">
                                                  <FormattedMessage
                                                    id="app.sisSupervisor.noSisGroups"
                                                    defaultMessage="Currently there are no ReCodEx groups matching this SIS course."
                                                  />
                                                </p>
                                              )}
                                            </Card.Body>

                                            <Card.Footer>
                                              <ResourceRenderer resource={sisPossibleParents.get(course.course.code)}>
                                                {possibleParents => (
                                                  <div className="text-center">
                                                    <TheButtonGroup>
                                                      <Button
                                                        variant="success"
                                                        onClick={() =>
                                                          this.openCreateDialog(possibleParents, course, term)
                                                        }>
                                                        <AddIcon gapRight={2} />
                                                        <FormattedMessage
                                                          id="app.sisSupervisor.createGroupButton"
                                                          defaultMessage="Create New Group"
                                                        />
                                                      </Button>

                                                      <Button
                                                        variant="success"
                                                        onClick={() => this.openBindDialog(course, term)}>
                                                        <BindIcon gapRight={2} />
                                                        <FormattedMessage
                                                          id="app.sisSupervisor.bindGroupButton"
                                                          defaultMessage="Bind Existing Group"
                                                        />
                                                      </Button>
                                                    </TheButtonGroup>
                                                  </div>
                                                )}
                                              </ResourceRenderer>
                                            </Card.Footer>
                                          </>
                                        </Accordion.Collapse>
                                      </Card>
                                    ))}
                                </Accordion>
                              ) : (
                                <p className="text-center">
                                  <FormattedMessage
                                    id="app.sisIntegration.noSisGroups"
                                    defaultMessage="Currently you have no courses in SIS for this semester."
                                  />
                                </p>
                              )}
                            </div>
                          )}
                        </ResourceRenderer>
                      </div>
                    ))}
              </div>
            )}
          </ResourceRenderer>

          <SisCreateGroupForm
            isOpen={this.state.createDialog !== null}
            onClose={this.closeCreateDialog}
            onSubmit={this.submitCreateDialog}
            groupIds={this.state.createDialog && this.state.createDialog.possibleParents}
            groupsAccessor={groupsAccessor}
            course={this.state.createDialog && this.state.createDialog.course}
            courseGroupsCount={this.state.createDialog && this.state.createDialog.groupsCount}
          />

          <SisBindGroupForm
            isOpen={this.state.bindDialog !== null}
            onClose={this.closeBindDialog}
            onSubmit={this.submitBindDialog}
            groups={this.state.bindDialog && this.state.bindDialog.groups}
            groupsAccessor={groupsAccessor}
            course={this.state.bindDialog && this.state.bindDialog.course}
            courseGroupsCount={this.state.bindDialog && this.state.bindDialog.groupsCount}
          />
        </div>
      </Box>
    );
  }
}

SisSupervisorGroupsContainer.propTypes = {
  sisStatus: PropTypes.object,
  currentUserId: PropTypes.string,
  groups: PropTypes.array,
  loadData: PropTypes.func.isRequired,
  sisCourses: ImmutablePropTypes.map,
  createGroup: PropTypes.func.isRequired,
  bindGroup: PropTypes.func.isRequired,
  unbindGroup: PropTypes.func.isRequired,
  links: PropTypes.object,
  sisPossibleParents: ImmutablePropTypes.map,
  groupsAccessor: PropTypes.func.isRequired,
  groupsResourcesAccessor: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(
  withLinks(
    connect(
      state => {
        const currentUserId = loggedInUserIdSelector(state);
        return {
          sisStatus: sisStateSelector(state),
          currentUserId,
          sisCourses: sisSupervisedCoursesSelector(state),
          sisPossibleParents: sisPossibleParentsSelector(state),
          groupsAccessor: groupDataAccessorSelector(state),
          groupsResourcesAccessor: groupAccessorSelector(state),
        };
      },
      dispatch => ({
        loadData: loggedInUserId => SisSupervisorGroupsContainer.loadData(dispatch, loggedInUserId),
        createGroup: (courseId, data, userId, year, term) =>
          dispatch(sisCreateGroup(courseId, data, userId, year, term)).then(() => dispatch(fetchAllGroups())),
        bindGroup: (courseId, data, userId, year, term) => dispatch(sisBindGroup(courseId, data, userId, year, term)),
        unbindGroup: (courseId, groupId, userId, year, term) =>
          dispatch(sisUnbindGroup(courseId, groupId, userId, year, term)),
      })
    )(SisSupervisorGroupsContainer)
  )
);
