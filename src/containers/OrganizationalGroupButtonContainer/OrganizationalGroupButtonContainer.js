import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { lruMemoize } from 'reselect';

import OrganizationalGroupButton from '../../components/buttons/OrganizationalGroupButton';
import { setOrganizational } from '../../redux/modules/groups.js';
import { groupSelector, groupTypePendingChange } from '../../redux/selectors/groups.js';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { getErrorMessage } from '../../locales/apiErrorMessages.js';
import { addNotification } from '../../redux/modules/notifications.js';

const setOrganizationalHandlingErrors = lruMemoize(
  (organizational, setOrganizational, addNotification, formatMessage) => () =>
    setOrganizational(!organizational).catch(err => {
      addNotification(getErrorMessage(formatMessage)(err), false);
    })
);

const OrganizationalGroupButtonContainer = ({
  group,
  pending,
  setOrganizational,
  addNotification,
  intl: { formatMessage },
  ...props
}) => (
  <ResourceRenderer resource={group}>
    {({ exam, organizational, privateData: { students, assignments }, permissionHints }) => (
      <OrganizationalGroupButton
        organizational={organizational}
        pending={pending}
        setOrganizational={setOrganizationalHandlingErrors(
          organizational,
          setOrganizational,
          addNotification,
          formatMessage
        )}
        disabled={!permissionHints.setOrganizational || exam || students.length > 0 || assignments.length > 0}
        {...props}
      />
    )}
  </ResourceRenderer>
);

OrganizationalGroupButtonContainer.propTypes = {
  id: PropTypes.string.isRequired,
  group: ImmutablePropTypes.map,
  pending: PropTypes.bool.isRequired,
  setOrganizational: PropTypes.func.isRequired,
  addNotification: PropTypes.func.isRequired,
  intl: PropTypes.object,
};

const mapStateToProps = (state, { id }) => ({
  group: groupSelector(state, id),
  pending: groupTypePendingChange(state, id),
});

const mapDispatchToProps = (dispatch, { id }) => ({
  setOrganizational: organizational => dispatch(setOrganizational(id, organizational)),
  addNotification: (...args) => dispatch(addNotification(...args)),
});

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(OrganizationalGroupButtonContainer));
