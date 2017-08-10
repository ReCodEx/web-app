import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Box from '../../components/widgets/Box';

import { fetchSisStatusIfNeeded } from '../../redux/modules/sisStatus';
import { sisStateSelector } from '../../redux/selectors/sisStatus';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';

class SisIntegrationContainer extends Component {
  componentWillMount() {
    this.props.loadData(this.props.currentUserId);
  }

  static loadData = (dispatch, loggedInUserId) => {
    dispatch((dispatch, getState) => dispatch(fetchSisStatusIfNeeded()));
  };

  render() {
    const { sisStatus, currentUserId } = this.props;
    return (
      <Box
        title={
          <FormattedMessage
            id="app.dashboard.sisIntegration"
            defaultMessage="SIS integration"
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
              {console.log(sisStatus)}
            </div>}
        </ResourceRenderer>
      </Box>
    );
  }
}

SisIntegrationContainer.propTypes = {
  sisStatus: PropTypes.object,
  currentUserId: PropTypes.string,
  loadData: PropTypes.func.isRequired
};

export default connect(
  state => ({
    sisStatus: sisStateSelector(state),
    currentUserId: loggedInUserIdSelector(state)
  }),
  dispatch => ({
    loadData: loggedInUserId =>
      SisIntegrationContainer.loadData(dispatch, loggedInUserId)
  })
)(SisIntegrationContainer);
