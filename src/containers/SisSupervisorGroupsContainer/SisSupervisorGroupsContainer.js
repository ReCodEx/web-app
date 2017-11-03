import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import Box from '../../components/widgets/Box';
import { Table, Accordion, Panel, Row, Col } from 'react-bootstrap';
import Button from '../../components/widgets/FlatButton';
import { LinkContainer } from 'react-router-bootstrap';
import Icon from 'react-fontawesome';

import { fetchSisStatusIfNeeded } from '../../redux/modules/sisStatus';
import {
  fetchSisSupervisedCourses,
  sisCreateGroup,
  sisBindGroup
} from '../../redux/modules/sisSupervisedCourses';
import { fetchSisPossibleParentsIfNeeded } from '../../redux/modules/sisPossibleParents';
import { sisPossibleParentsSelector } from '../../redux/selectors/sisPossibleParents';
import { sisStateSelector } from '../../redux/selectors/sisStatus';
import { sisSupervisedCoursesSelector } from '../../redux/selectors/sisSupervisedCourses';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import SisCreateGroupForm from '../../components/forms/SisCreateGroupForm';
import SisBindGroupForm from '../../components/forms/SisBindGroupForm';

import withLinks from '../../hoc/withLinks';
import './SisSupervisorGroupsContainer.css';

const days = {
  cs: ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'],
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
};

const oddEven = {
  cs: ['lichý', 'sudý'],
  en: ['odd', 'even']
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
          terms.map(({ year, term }) =>
            dispatch(fetchSisSupervisedCourses(loggedInUserId, year, term))
              .then(res => res.value)
              .then(courses =>
                courses.map(course =>
                  dispatch(fetchSisPossibleParentsIfNeeded(course.course.code))
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
      sisPossibleParents,
      links: { GROUP_URI_FACTORY },
      intl: { locale }
    } = this.props;
    return (
      <Box
        title={
          <FormattedMessage
            id="app.dashboard.sisGroups"
            defaultMessage="SIS groups with ReCodEx mapping"
          />
        }
        collapsable
        noPadding
        unlimitedHeight
        isOpen={false}
      >
        <ResourceRenderer resource={sisStatus}>
          {sisStatus =>
            <div>
              {!sisStatus.accessible &&
                <p className="text-center">
                  <FormattedMessage
                    id="app.sisSupervisor.noAccessible"
                    defaultMessage="Your account does not support SIS integration. Please, log in using CAS-UK."
                  />
                </p>}
              {sisStatus.accessible &&
                sisStatus.terms.map((term, i) =>
                  <div key={i}>
                    <h4 style={{ paddingLeft: '10px' }}>
                      <FormattedMessage
                        id="app.sisSupervisor.yearTerm"
                        defaultMessage="Year and term:"
                      />{' '}
                      {`${term.year}-${term.term}`}
                    </h4>
                    <ResourceRenderer
                      resource={sisCourses(term.year, term.term)}
                    >
                      {courses =>
                        <div>
                          {courses && courses.length > 0
                            ? <Accordion>
                                {courses &&
                                  courses.map((course, i) =>
                                    <Panel
                                      key={i}
                                      header={
                                        <span className="header">
                                          <span className="leftText">
                                            {course.groups.length > 0 &&
                                              <Icon
                                                name="check"
                                                className="leftIcon"
                                              />}
                                            <span>
                                              {getLocalizedData(
                                                course.course.captions,
                                                locale
                                              )}{' '}
                                              (<code>{course.course.code}</code>){' '}
                                            </span>
                                          </span>
                                          <span className="pull-right">
                                            {
                                              getLocalizedData(days, locale)[
                                                course.course.dayOfWeek
                                              ]
                                            }{' '}
                                            {course.course.time}{' '}
                                            {course.course.fortnightly
                                              ? getLocalizedData(
                                                  oddEven,
                                                  locale
                                                )[
                                                  course.course.oddWeeks ? 0 : 1
                                                ]
                                              : ''}
                                          </span>
                                        </span>
                                      }
                                      eventKey={i}
                                      bsStyle={
                                        course.course.type === 'lecture'
                                          ? 'info'
                                          : 'success'
                                      }
                                    >
                                      {course.groups.length > 0
                                        ? <Table hover>
                                            <thead>
                                              <tr>
                                                <th>
                                                  <FormattedMessage
                                                    id="app.sisSupervisor.groupName"
                                                    defaultMessage="Name"
                                                  />
                                                </th>
                                                <th>
                                                  <FormattedMessage
                                                    id="app.sisSupervisor.groupExtId"
                                                    defaultMessage="Group external ID"
                                                  />
                                                </th>
                                                <th />
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {course.groups.map((group, i) =>
                                                <tr key={i}>
                                                  <td>
                                                    {group.name}
                                                  </td>
                                                  <td>
                                                    <code>
                                                      {group.externalId}
                                                    </code>
                                                  </td>
                                                  <td className="text-right">
                                                    <span>
                                                      <LinkContainer
                                                        to={GROUP_URI_FACTORY(
                                                          group.id
                                                        )}
                                                      >
                                                        <Button
                                                          bsStyle="primary"
                                                          bsSize="xs"
                                                          className="btn-flat"
                                                        >
                                                          <Icon name="group" />{' '}
                                                          <FormattedMessage
                                                            id="app.sisSupervisor.groupDetail"
                                                            defaultMessage="See group's page"
                                                          />
                                                        </Button>
                                                      </LinkContainer>
                                                    </span>
                                                  </td>
                                                </tr>
                                              )}
                                            </tbody>
                                          </Table>
                                        : <div className="text-center">
                                            <b>
                                              <FormattedMessage
                                                id="app.sisSupervisor.noSisGroups"
                                                defaultMessage="Currently there are no ReCodEx groups matching this SIS lecture."
                                              />
                                            </b>
                                          </div>}
                                      <Row>
                                        <Col xs={6}>
                                          <ResourceRenderer
                                            resource={sisPossibleParents(
                                              course.course.code
                                            )}
                                          >
                                            {possibleParents =>
                                              <SisCreateGroupForm
                                                form={
                                                  'sisCreateGroup' +
                                                  course.course.code
                                                }
                                                onSubmit={data =>
                                                  createGroup(
                                                    course.course.code,
                                                    data
                                                  )}
                                                groups={possibleParents}
                                              />}
                                          </ResourceRenderer>
                                        </Col>
                                        <Col xs={6}>
                                          <SisBindGroupForm
                                            form={
                                              'sisBindGroup' +
                                              course.course.code
                                            }
                                            onSubmit={data =>
                                              bindGroup(
                                                course.course.code,
                                                data,
                                                currentUserId,
                                                term.year,
                                                term.term
                                              )}
                                            groups={
                                              groups !== null ? groups : []
                                            }
                                          />
                                        </Col>
                                      </Row>
                                    </Panel>
                                  )}
                              </Accordion>
                            : <div className="text-center">
                                <b>
                                  <FormattedMessage
                                    id="app.sisIntegration.noSisGroups"
                                    defaultMessage="Currently there are no ReCodEx groups matching your SIS subjects for this time period."
                                  />
                                </b>
                              </div>}
                        </div>}
                    </ResourceRenderer>
                  </div>
                )}
            </div>}
        </ResourceRenderer>
      </Box>
    );
  }
}

SisSupervisorGroupsContainer.propTypes = {
  sisStatus: PropTypes.object,
  currentUserId: PropTypes.string,
  groups: PropTypes.array,
  loadData: PropTypes.func.isRequired,
  sisCourses: PropTypes.func.isRequired,
  createGroup: PropTypes.func.isRequired,
  bindGroup: PropTypes.func.isRequired,
  links: PropTypes.object,
  sisPossibleParents: PropTypes.func.isRequired,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(
  withLinks(
    connect(
      state => {
        const currentUserId = loggedInUserIdSelector(state);
        return {
          sisStatus: sisStateSelector(state),
          currentUserId,
          sisCourses: (year, term) =>
            sisSupervisedCoursesSelector(currentUserId, year, term)(state),
          sisPossibleParents: courseId =>
            sisPossibleParentsSelector(courseId)(state)
        };
      },
      dispatch => ({
        loadData: loggedInUserId =>
          SisSupervisorGroupsContainer.loadData(dispatch, loggedInUserId),
        createGroup: (courseId, data) =>
          dispatch(sisCreateGroup(courseId, data)),
        bindGroup: (courseId, data, userId, year, term) =>
          dispatch(sisBindGroup(courseId, data, userId, year, term))
      })
    )(SisSupervisorGroupsContainer)
  )
);
