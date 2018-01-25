import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import PageContent from '../../components/layout/PageContent';
import { isLoggedAsSuperAdmin } from '../../redux/selectors/users';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';

class SisIntegration extends Component {
  static loadAsync = ({ groupId }, dispatch, userId, isSuperAdmin) =>
    Promise.all([]);

  componentWillMount() {
    const { loadAsync, userId, isSuperAdmin } = this.props;
    loadAsync(userId, isSuperAdmin);
  }

  componentWillReceiveProps(newProps) {}

  render() {
    // const {} = this.props;

    return (
      <PageContent
        title={
          <FormattedMessage
            id="app.sisIntegration.title"
            defaultMessage="SIS Integration"
          />
        }
        description={
          <FormattedMessage
            id="app.sisIntegration.description"
            defaultMessage="Integration with university SIS system"
          />
        }
        breadcrumbs={[
          {
            text: (
              <FormattedMessage
                id="app.sisIntegration.title"
                defaultMessage="SIS Integration"
              />
            ),
            iconName: 'id-badge'
          }
        ]}
      >
        <div>
          <div />
        </div>
      </PageContent>
    );
  }
}

SisIntegration.propTypes = {
  userId: PropTypes.string.isRequired,
  isSuperAdmin: PropTypes.bool.isRequired,
  loadAsync: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    userId: loggedInUserIdSelector(state),
    isSuperAdmin: isLoggedAsSuperAdmin(state)
  };
};

const mapDispatchToProps = (dispatch, { params }) => ({
  loadAsync: (userId, isSuperAdmin) =>
    SisIntegration.loadAsync(params, dispatch, userId, isSuperAdmin)
});

export default connect(mapStateToProps, mapDispatchToProps)(SisIntegration);
