import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Box from '../../components/widgets/Box';
import { Table } from 'react-bootstrap';
import Button from '../../components/widgets/FlatButton';
import { LinkContainer } from 'react-router-bootstrap';
import Icon from 'react-fontawesome';

import { fetchSisStatusIfNeeded } from '../../redux/modules/sisStatus';
import { fetchSisSubscribedGroups } from '../../redux/modules/sisSubscribedGroups';
import { sisStateSelector } from '../../redux/selectors/sisStatus';
import { sisSubscribedGroupsSelector } from '../../redux/selectors/sisSubscribedGroups';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import LeaveJoinGroupButtonContainer from '../LeaveJoinGroupButtonContainer';

import withLinks from '../../hoc/withLinks';

class SisIntegrationContainer extends Component {
  componentWillMount() {
    this.props.loadData(this.props.currentUserId);
  }

  static loadData = (dispatch, loggedInUserId) => {
    dispatch((dispatch, getState) =>
      dispatch(fetchSisStatusIfNeeded())
        .then(res => res.value)
        .then(status =>
          status.terms.map(term =>
            dispatch(
              fetchSisSubscribedGroups(loggedInUserId, term.year, term.term)
            )
          )
        )
    );
  };

  render() {
    const {
      sisStatus,
      currentUserId,
      sisGroups,
      links: { GROUP_URI_FACTORY }
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
        isOpen
      >
        <ResourceRenderer resource={sisStatus}>
          {sisStatus =>
            <div>
              {!sisStatus.accessible &&
                <div className="text-center">
                  <FormattedMessage
                    id="app.sisIntegration.noAccessible"
                    defaultMessage="Your account does not support SIS integration. Please, log in using CAS-UK."
                  />
                </div>}
              {sisStatus.accessible &&
                sisStatus.terms.map((term, i) =>
                  <div key={i}>
                    <h4 style={{ paddingLeft: '10px' }}>
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
                                        id="app.sisIntegration.groupName"
                                        defaultMessage="Name"
                                      />
                                    </th>
                                    <th>
                                      <FormattedMessage
                                        id="app.sisIntegration.groupExtId"
                                        defaultMessage="SIS ID"
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
                                              to={GROUP_URI_FACTORY(group.id)}
                                            >
                                              <Button
                                                bsStyle="primary"
                                                bsSize="xs"
                                                className="btn-flat"
                                              >
                                                <Icon name="group" />{' '}
                                                <FormattedMessage
                                                  id="app.sisIntegration.groupDetail"
                                                  defaultMessage="See group's page"
                                                />
                                              </Button>
                                            </LinkContainer>
                                            <LeaveJoinGroupButtonContainer
                                              userId={currentUserId}
                                              groupId={group.id}
                                            />
                                          </span>
                                        </td>
                                      </tr>
                                    )}
                                </tbody>
                              </Table>
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

SisIntegrationContainer.propTypes = {
  sisStatus: PropTypes.object,
  currentUserId: PropTypes.string,
  loadData: PropTypes.func.isRequired,
  sisGroups: PropTypes.func.isRequired,
  links: PropTypes.object
};

export default withLinks(
  connect(
    state => {
      const currentUserId = loggedInUserIdSelector(state);
      return {
        sisStatus: sisStateSelector(state),
        currentUserId,
        sisGroups: (year, term) =>
          sisSubscribedGroupsSelector(currentUserId, year, term)(state)
      };
    },
    dispatch => ({
      loadData: loggedInUserId =>
        SisIntegrationContainer.loadData(dispatch, loggedInUserId)
    })
  )(SisIntegrationContainer)
);
