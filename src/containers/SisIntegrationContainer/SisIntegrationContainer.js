import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { LinkContainer } from 'react-router-bootstrap';
import Icon from 'react-fontawesome';
import { Table } from 'react-bootstrap';
import Box from '../../components/widgets/Box';
import Button from '../../components/widgets/FlatButton';

import { fetchGroupsIfNeeded } from '../../redux/modules/groups';
import { fetchSisStatusIfNeeded } from '../../redux/modules/sisStatus';
import { fetchSisSubscribedGroups } from '../../redux/modules/sisSubscribedGroups';
import { sisStateSelector } from '../../redux/selectors/sisStatus';
import { sisSubscribedGroupsSelector } from '../../redux/selectors/sisSubscribedGroups';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { groupDataAccessorSelector } from '../../redux/selectors/groups';

import UsersNameContainer from '../UsersNameContainer';
import LeaveJoinGroupButtonContainer from '../LeaveJoinGroupButtonContainer';
import { getGroupCanonicalLocalizedName } from '../../helpers/getLocalizedData';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';

import withLinks from '../../helpers/withLinks';

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
          terms.map(({ year, term }) =>
            dispatch(fetchSisSubscribedGroups(loggedInUserId, year, term))
              .then(res => res.value)
              .then(groups =>
                groups
                  .filter(
                    group =>
                      group.parentGroupsIds && group.parentGroupsIds.length > 0
                  )
                  .map(group =>
                    dispatch(fetchGroupsIfNeeded(...group.parentGroupsIds))
                  )
              )
          )
      );

  render() {
    const {
      sisStatus,
      currentUserId,
      sisGroups,
      groupsAccessor,
      links: { GROUP_INFO_URI_FACTORY, GROUP_DETAIL_URI_FACTORY },
      intl: { locale }
    } = this.props;
    return (
      <Box
        title={
          <FormattedMessage
            id="app.dashboard.sisGroupsStudent"
            defaultMessage="SIS Courses - Student"
          />
        }
        collapsable
        unlimitedHeight
        isOpen={false}
      >
        <div>
          <p className="text-muted">
            <FormattedMessage
              id="app.dashboard.sisGroupsStudentExplain"
              defaultMessage="SIS courses you are enrolled to in particular semesters and which have correspondig groups in ReCodEx."
            />
          </p>
          <ResourceRenderer resource={sisStatus}>
            {sisStatus =>
              <div>
                {!sisStatus.accessible &&
                  <p className="text-center">
                    <FormattedMessage
                      id="app.sisIntegration.noAccessible"
                      defaultMessage="Your account does not support SIS integration. Please, log in using CAS-UK."
                    />
                  </p>}
                {sisStatus.accessible &&
                  sisStatus.terms.map((term, i) =>
                    <div key={i}>
                      <h4>
                        <FormattedMessage
                          id="app.sisIntegration.yearTerm"
                          defaultMessage="Year and term:"
                        />{' '}
                        {`${term.year}-${term.term}`}
                      </h4>
                      <ResourceRenderer
                        resource={sisGroups(term.year, term.term)}
                      >
                        {groups =>
                          <div>
                            {groups && groups.length > 0
                              ? <Table hover>
                                  <thead>
                                    <tr>
                                      <th>
                                        <FormattedMessage
                                          id="generic.name"
                                          defaultMessage="Name"
                                        />
                                      </th>
                                      <th>
                                        <FormattedMessage
                                          id="app.sisIntegration.courseId"
                                          defaultMessage="Course ID"
                                        />
                                      </th>
                                      <th>
                                        <FormattedMessage
                                          id="app.sisIntegration.groupAdmins"
                                          defaultMessage="Group Administrators"
                                        />
                                      </th>
                                      <th />
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {groups &&
                                      groups.map((group, i) =>
                                        <tr key={i}>
                                          <td>
                                            {getGroupCanonicalLocalizedName(
                                              group,
                                              groupsAccessor,
                                              locale
                                            )}
                                          </td>
                                          <td>
                                            {group.sisCode &&
                                            Array.isArray(group.sisCode)
                                              ? <span>
                                                  {group.sisCode
                                                    .sort(
                                                      (a, b) =>
                                                        a.localeCompare(b) // locales intentionally ommited
                                                    )
                                                    .map((c, idx) =>
                                                      <span key="{c}">
                                                        {idx > 0 ? ', ' : ''}
                                                        <code>
                                                          {c}
                                                        </code>
                                                      </span>
                                                    )}
                                                </span>
                                              : <code>
                                                  {group.sisCode}
                                                </code>}
                                          </td>
                                          <td>
                                            {group.primaryAdminsIds.map(id =>
                                              <UsersNameContainer
                                                key={id}
                                                userId={id}
                                              />
                                            )}
                                          </td>
                                          <td className="text-right">
                                            <span>
                                              <LinkContainer
                                                to={
                                                  group.organizational
                                                    ? GROUP_INFO_URI_FACTORY(
                                                        group.id
                                                      )
                                                    : GROUP_DETAIL_URI_FACTORY(
                                                        group.id
                                                      )
                                                }
                                              >
                                                <Button
                                                  bsStyle="primary"
                                                  bsSize="xs"
                                                  className="btn-flat"
                                                >
                                                  <Icon name="group" />&nbsp;&nbsp;
                                                  <FormattedMessage
                                                    id="app.group.detail"
                                                    defaultMessage="Group Detail"
                                                  />
                                                </Button>
                                              </LinkContainer>
                                              {!group.organizational &&
                                                <LeaveJoinGroupButtonContainer
                                                  userId={currentUserId}
                                                  groupId={group.id}
                                                />}
                                            </span>
                                          </td>
                                        </tr>
                                      )}
                                  </tbody>
                                </Table>
                              : <div className="text-center">
                                  <p>
                                    <b>
                                      <FormattedMessage
                                        id="app.sisIntegration.noSisGroups"
                                        defaultMessage="Currently there are no ReCodEx groups matching your SIS subjects for this time period."
                                      />
                                    </b>
                                  </p>
                                </div>}
                          </div>}
                      </ResourceRenderer>
                    </div>
                  )}
              </div>}
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
  sisGroups: PropTypes.func.isRequired,
  groupsAccessor: PropTypes.func.isRequired,
  links: PropTypes.object,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default withLinks(
  connect(
    state => {
      const currentUserId = loggedInUserIdSelector(state);
      return {
        sisStatus: sisStateSelector(state),
        currentUserId,
        sisGroups: (year, term) =>
          sisSubscribedGroupsSelector(currentUserId, year, term)(state),
        groupsAccessor: groupDataAccessorSelector(state)
      };
    },
    dispatch => ({
      loadData: loggedInUserId =>
        SisIntegrationContainer.loadData(dispatch, loggedInUserId)
    })
  )(injectIntl(SisIntegrationContainer))
);
