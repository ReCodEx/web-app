import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { LinkContainer } from 'react-router-bootstrap';
import { Card, Table } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';

import Box from '../../components/widgets/Box';
import Button from '../../components/widgets/FlatButton';
import InsetPanel from '../../components/widgets/InsetPanel';
import UsersNameContainer from '../UsersNameContainer';
import LeaveJoinGroupButtonContainer from '../LeaveJoinGroupButtonContainer';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { AssignmentsIcon } from '../../components/icons';
import CourseLabel, { getLocalizedData } from '../../components/SisIntegration/CourseLabel';

import { fetchSisStatusIfNeeded } from '../../redux/modules/sisStatus';
import { fetchSisSubscribedGroups } from '../../redux/modules/sisSubscribedGroups';
import { sisStateSelector } from '../../redux/selectors/sisStatus';
import { sisSubscribedCoursesGroupsSelector } from '../../redux/selectors/sisSubscribedGroups';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { groupDataAccessorSelector } from '../../redux/selectors/groups';

import { getGroupCanonicalLocalizedName } from '../../helpers/localizedData';
import withLinks from '../../helpers/withLinks';

const dowFix = dow => (typeof dow === 'number' ? dow : 8);

const timeToMinutes = time => {
  const [hour, minute] = String(time).split(':');
  const minutes = Number(hour) * 60 + Number(minute);
  return isNaN(minutes) ? 9999 : minutes;
};

const preprocessCourses = defaultMemoize((courses, groupsAccessor, locale) =>
  courses
    .map(({ course, groups }) => ({
      course,
      groups: groups
        .map(group => {
          group = groupsAccessor(group);
          return group && group.toJS();
        })
        .filter(group => group),
    }))
    .filter(({ groups }) => groups && groups.length > 0)
    .sort(
      (a, b) =>
        dowFix(a.course.dayOfWeek) - dowFix(b.course.dayOfWeek) ||
        timeToMinutes(a.course.time) - timeToMinutes(b.course.time) ||
        Number(a.course.fortnightly) - Number(b.course.fortnightly) ||
        getLocalizedData(a.course.captions, locale).localeCompare(getLocalizedData(b.course.captions, locale), locale)
    )
);

class SisIntegrationContainer extends Component {
  componentDidMount() {
    this.props.loadData(this.props.currentUserId);
  }

  static loadData = (dispatch, loggedInUserId) =>
    dispatch(fetchSisStatusIfNeeded())
      .then(res => res.value)
      .then(
        ({ accessible, terms }) =>
          accessible &&
          terms
            .filter(({ isAdvertised }) => isAdvertised)
            .map(({ year, term }) => dispatch(fetchSisSubscribedGroups(loggedInUserId, year, term)))
      );

  reloadData = () => {
    this.props.loadData(this.props.currentUserId);
  };

  render() {
    const {
      sisStatus,
      currentUserId,
      sisCoursesGroups,
      groupsAccessor,
      links: { GROUP_INFO_URI_FACTORY, GROUP_DETAIL_URI_FACTORY },
      intl: { locale },
    } = this.props;
    return (
      <Box
        title={
          <FormattedMessage
            id="app.dashboard.sisGroupsStudent"
            defaultMessage="Join Groups Associated with UK SIS Courses"
          />
        }
        unlimitedHeight>
        <div>
          <p className="text-muted">
            <FormattedMessage
              id="app.dashboard.sisGroupsStudentExplain"
              defaultMessage="SIS courses you are enrolled to in particular semesters and which have correspondig groups in ReCodEx."
            />
          </p>
          <ResourceRenderer resource={sisStatus}>
            {sisStatus => (
              <div>
                {!sisStatus.accessible && (
                  <p className="text-center">
                    <FormattedMessage
                      id="app.sisIntegration.noAccessible"
                      defaultMessage="Your account does not support SIS integration. Please, log in using CAS-UK."
                    />
                  </p>
                )}
                {sisStatus.accessible &&
                  sisStatus.terms
                    .filter(({ isAdvertised }) => isAdvertised)
                    .map((term, i) => (
                      <div key={i}>
                        <hr />
                        <h3 className="em-margin-bottom">
                          <FormattedMessage id="app.sisIntegration.yearTerm" defaultMessage="Year and term:" />{' '}
                          {`${term.year}-${term.term}`}
                        </h3>
                        <ResourceRenderer resource={sisCoursesGroups(term.year, term.term)}>
                          {courses => (
                            <div>
                              {courses && preprocessCourses(courses, groupsAccessor, locale).length > 0 ? (
                                preprocessCourses(courses, groupsAccessor, locale).map(
                                  course =>
                                    course && (
                                      <Card key={course.course.code}>
                                        <Card.Header>{course && <CourseLabel {...course.course} />}</Card.Header>
                                        <Card.Body>
                                          <Table className="no-margin">
                                            <tbody>
                                              {course.groups &&
                                                course.groups.map((group, i) => (
                                                  <tr key={i}>
                                                    <td style={{ width: '55%' }}>
                                                      {getGroupCanonicalLocalizedName(group, groupsAccessor, locale)}
                                                    </td>
                                                    <td style={{ width: '30%' }}>
                                                      {group.primaryAdminsIds.map(id => (
                                                        <UsersNameContainer key={id} userId={id} isSimple />
                                                      ))}
                                                    </td>
                                                    <td className="text-right text-nowrap" style={{ width: '15%' }}>
                                                      <span>
                                                        {group.privateData &&
                                                          group.privateData.students.includes(currentUserId) && (
                                                            <LinkContainer
                                                              to={
                                                                group.organizational ||
                                                                // this is inacurate, but public groups are visible to students who cannot see detail until they join
                                                                group.public
                                                                  ? GROUP_INFO_URI_FACTORY(group.id)
                                                                  : GROUP_DETAIL_URI_FACTORY(group.id)
                                                              }>
                                                              <Button variant="primary" size="xs" className="btn-flat">
                                                                <AssignmentsIcon gapRight />
                                                                <FormattedMessage
                                                                  id="app.group.assignments"
                                                                  defaultMessage="Assignments"
                                                                />
                                                              </Button>
                                                            </LinkContainer>
                                                          )}

                                                        {!group.organizational &&
                                                          (!group.privateData ||
                                                            !group.privateData.detaining ||
                                                            !group.privateData.students.includes(currentUserId)) && (
                                                            <LeaveJoinGroupButtonContainer
                                                              userId={currentUserId}
                                                              groupId={group.id}
                                                              onJoin={this.reloadData}
                                                              onLeave={this.reloadData}
                                                            />
                                                          )}
                                                      </span>
                                                    </td>
                                                  </tr>
                                                ))}
                                            </tbody>
                                          </Table>
                                        </Card.Body>
                                      </Card>
                                    )
                                )
                              ) : (
                                <InsetPanel>
                                  <FormattedMessage
                                    id="app.sisIntegration.noCoursesGroupsAvailable"
                                    defaultMessage="There are currently no groups in ReCodEx bound to courses you are enrolled to in this semester."
                                  />
                                </InsetPanel>
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

SisIntegrationContainer.propTypes = {
  sisStatus: PropTypes.object,
  currentUserId: PropTypes.string,
  loadData: PropTypes.func.isRequired,
  sisCoursesGroups: PropTypes.func.isRequired,
  groupsAccessor: PropTypes.func.isRequired,
  links: PropTypes.object,
  intl: intlShape.isRequired,
};

export default withLinks(
  connect(
    state => {
      const currentUserId = loggedInUserIdSelector(state);
      return {
        sisStatus: sisStateSelector(state),
        currentUserId,
        sisCoursesGroups: (year, term) => sisSubscribedCoursesGroupsSelector(currentUserId, year, term)(state),
        groupsAccessor: groupDataAccessorSelector(state),
      };
    },
    dispatch => ({
      loadData: loggedInUserId => SisIntegrationContainer.loadData(dispatch, loggedInUserId),
    })
  )(injectIntl(SisIntegrationContainer))
);
