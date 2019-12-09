import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import Box from '../../components/widgets/Box';
import { Table, Accordion, Panel, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';

import Button from '../../components/widgets/FlatButton';
import { LinkContainer } from 'react-router-bootstrap';

import { fetchAllGroups, fetchGroupIfNeeded } from '../../redux/modules/groups';
import { fetchSisStatusIfNeeded } from '../../redux/modules/sisStatus';
import {
  fetchSisSupervisedCourses,
  sisCreateGroup,
  sisBindGroup,
  sisUnbindGroup,
} from '../../redux/modules/sisSupervisedCourses';
import { fetchSisPossibleParentsIfNeeded } from '../../redux/modules/sisPossibleParents';
import { sisPossibleParentsSelector } from '../../redux/selectors/sisPossibleParents';
import { sisStateSelector } from '../../redux/selectors/sisStatus';
import { sisSupervisedCoursesSelector } from '../../redux/selectors/sisSupervisedCourses';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { groupDataAccessorSelector } from '../../redux/selectors/groups';

import UsersNameContainer from '../UsersNameContainer';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import SisCreateGroupForm from '../../components/forms/SisCreateGroupForm';
import SisBindGroupForm from '../../components/forms/SisBindGroupForm';
import Confirm from '../../components/forms/Confirm';
import { getGroupCanonicalLocalizedName } from '../../helpers/localizedData';
import DeleteGroupButtonContainer from '../../containers/DeleteGroupButtonContainer';

import Icon, { EditIcon, GroupIcon, AssignmentsIcon } from '../../components/icons';
import withLinks from '../../helpers/withLinks';
import { unique, arrayToObject, hasPermissions } from '../../helpers/common';

const days = {
  cs: ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'],
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
};

const oddEven = {
  cs: ['lichý', 'sudý'],
  en: ['odd', 'even'],
};

const getLocalizedData = (obj, locale) => {
  if (obj && obj[locale]) {
    return obj[locale];
  } else if (obj && Object.keys(obj).length > 0) {
    return Object.keys(obj)[0];
  } else {
    return null;
  }
};

const filterGroupsForBinding = (groups, alreadyBoundGroups) => {
  const bound = arrayToObject(alreadyBoundGroups);
  return groups.filter(group => !bound[group.id] && !group.organizational && !group.archived);
};

class SisSupervisorGroupsContainer extends Component {
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
                .then(courses =>
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
      groups,
      currentUserId,
      createGroup,
      bindGroup,
      unbindGroup,
      sisPossibleParents,
      groupsAccessor,
      links: { GROUP_EDIT_URI_FACTORY, GROUP_INFO_URI_FACTORY, GROUP_DETAIL_URI_FACTORY },
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
          <p className="text-muted">
            <FormattedMessage
              id="app.sisSupervisor.sisGroupsCreateExplain"
              defaultMessage="SIS courses you teach in particular semesters and which have mapping to ReCodEx. You may create new groups with binding or bind existing groups to these courses."
            />
          </p>
          <p className="callout callout-warning">
            <FormattedMessage
              id="app.sisSupervisor.noUsersInNewGroupsWarning"
              defaultMessage="Please note that when a group is created from or bound to a SIS course, no students are added to this group. The binding process only ensures that the group is visible to the students and they are allowed to join it."
            />
          </p>

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
                                    .sort((a, b) =>
                                      getLocalizedData(a.course.captions, locale).localeCompare(
                                        getLocalizedData(b.course.captions, locale),
                                        locale
                                      )
                                    )
                                    .map((course, i) => (
                                      <Panel
                                        key={i}
                                        header={
                                          <div>
                                            <table className="small full-width">
                                              <tbody>
                                                <tr>
                                                  <td>
                                                    <OverlayTrigger
                                                      placement="bottom"
                                                      overlay={
                                                        <Tooltip id={`course-tooltip-${i}`}>
                                                          {course.course.type === 'lecture' ? (
                                                            <FormattedMessage
                                                              id="app.sisSupervisor.lecture"
                                                              defaultMessage="Lecture"
                                                            />
                                                          ) : (
                                                            <FormattedMessage
                                                              id="app.sisSupervisor.lab"
                                                              defaultMessage="Lab (seminar)"
                                                            />
                                                          )}
                                                        </Tooltip>
                                                      }>
                                                      {course.course.type === 'lecture' ? (
                                                        <Icon icon="chalkboard-teacher" gapRight fixedWidth />
                                                      ) : (
                                                        <Icon icon="laptop" gapRight fixedWidth />
                                                      )}
                                                    </OverlayTrigger>
                                                  </td>
                                                  <td className="full-width">
                                                    {getLocalizedData(course.course.captions, locale)} (
                                                    <code>{course.course.code}</code>)
                                                    {course.groups.length > 0 && <GroupIcon gapLeft />}
                                                  </td>
                                                  <td className="text-nowrap">
                                                    {getLocalizedData(days, locale)[course.course.dayOfWeek]}{' '}
                                                    {course.course.time}{' '}
                                                    {course.course.fortnightly
                                                      ? getLocalizedData(oddEven, locale)[
                                                          course.course.oddWeeks ? 0 : 1
                                                        ]
                                                      : ''}
                                                  </td>
                                                  <td className="text-nowrap em-padding-left">{course.course.room}</td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </div>
                                        }
                                        eventKey={i}
                                        bsStyle={course.course.type === 'lecture' ? 'info' : 'success'}>
                                        {course.groups.length > 0 ? (
                                          <Table hover>
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
                                              {course.groups.map((group, i) => (
                                                <tr key={i}>
                                                  <td className="shrink-col">
                                                    {group.organizational && (
                                                      <OverlayTrigger
                                                        placement="bottom"
                                                        overlay={
                                                          <Tooltip id={`hint:${course.course.code}:${group.id}`}>
                                                            <FormattedMessage
                                                              id="app.sisSupervisor.organizationalGroupWarning"
                                                              defaultMessage="Students cannot join organizational groups."
                                                            />
                                                          </Tooltip>
                                                        }>
                                                        <GroupIcon organizational gapRight />
                                                      </OverlayTrigger>
                                                    )}
                                                  </td>
                                                  <td>
                                                    {getGroupCanonicalLocalizedName(group, groupsAccessor, locale)}
                                                  </td>
                                                  <td>
                                                    {group.primaryAdminsIds.map(id => (
                                                      <UsersNameContainer key={id} userId={id} />
                                                    ))}
                                                  </td>
                                                  <td className="text-right">
                                                    {hasPermissions(group, 'update') && (
                                                      <LinkContainer to={GROUP_EDIT_URI_FACTORY(group.id)}>
                                                        <Button bsStyle="warning" bsSize="xs">
                                                          <EditIcon gapRight />
                                                          <FormattedMessage
                                                            id="app.editGroup.title"
                                                            defaultMessage="Edit Group"
                                                          />
                                                        </Button>
                                                      </LinkContainer>
                                                    )}

                                                    <LinkContainer to={GROUP_INFO_URI_FACTORY(group.id)}>
                                                      <Button bsStyle="primary" bsSize="xs">
                                                        <GroupIcon gapRight />
                                                        <FormattedMessage
                                                          id="app.group.info"
                                                          defaultMessage="Group Info"
                                                        />
                                                      </Button>
                                                    </LinkContainer>

                                                    {hasPermissions(group, 'viewDetail') && (
                                                      <LinkContainer to={GROUP_DETAIL_URI_FACTORY(group.id)}>
                                                        <Button bsStyle="primary" bsSize="xs">
                                                          <AssignmentsIcon gapRight />
                                                          <FormattedMessage
                                                            id="app.group.assignments"
                                                            defaultMessage="Assignments"
                                                          />
                                                        </Button>
                                                      </LinkContainer>
                                                    )}

                                                    <Confirm
                                                      id={`${course.course.code}:${group.id}`}
                                                      onConfirmed={() =>
                                                        unbindGroup(
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
                                                      }>
                                                      <Button bsStyle="danger" bsSize="xs">
                                                        <Icon icon={['far', 'hand-scissors']} gapRight />
                                                        <FormattedMessage
                                                          id="app.group.unbind"
                                                          defaultMessage="Unbind"
                                                        />
                                                      </Button>
                                                    </Confirm>

                                                    {hasPermissions(group, 'remove') &&
                                                      group.parentGroupId !== null &&
                                                      group.childGroups.length === 0 && (
                                                        <DeleteGroupButtonContainer id={group.id} bsSize="xs" />
                                                      )}
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </Table>
                                        ) : (
                                          <div className="text-center">
                                            <p>
                                              <b>
                                                <FormattedMessage
                                                  id="app.sisSupervisor.noSisGroups"
                                                  defaultMessage="Currently there are no ReCodEx groups matching this SIS course."
                                                />
                                              </b>
                                            </p>
                                          </div>
                                        )}
                                        <Row>
                                          <Col xs={6}>
                                            <ResourceRenderer resource={sisPossibleParents.get(course.course.code)}>
                                              {possibleParents => (
                                                <SisCreateGroupForm
                                                  form={'sisCreateGroup' + course.course.code}
                                                  onSubmit={data =>
                                                    createGroup(
                                                      course.course.code,
                                                      data,
                                                      currentUserId,
                                                      term.year,
                                                      term.term
                                                    )
                                                  }
                                                  groups={possibleParents}
                                                  groupsAccessor={groupsAccessor}
                                                />
                                              )}
                                            </ResourceRenderer>
                                          </Col>
                                          <Col xs={6}>
                                            <SisBindGroupForm
                                              form={'sisBindGroup' + course.course.code}
                                              onSubmit={data =>
                                                bindGroup(course.course.code, data, currentUserId, term.year, term.term)
                                              }
                                              groups={filterGroupsForBinding(groups, course.groups)}
                                              groupsAccessor={groupsAccessor}
                                            />
                                          </Col>
                                        </Row>
                                      </Panel>
                                    ))}
                                </Accordion>
                              ) : (
                                <div className="text-center">
                                  <p>
                                    <b>
                                      <FormattedMessage
                                        id="app.sisIntegration.noSisGroups"
                                        defaultMessage="Currently there are no ReCodEx groups matching your SIS subjects for this time period."
                                      />
                                    </b>
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </ResourceRenderer>
                      </div>
                    ))}
              </div>
            )}
          </ResourceRenderer>
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
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
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
