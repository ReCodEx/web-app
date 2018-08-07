import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import OrganizationalGroupButton from '../../components/buttons/OrganizationalGroupButton';
import { setOrganizational } from '../../redux/modules/groups';
import {
  groupSelector,
  groupOrganizationalPendingChange
} from '../../redux/selectors/groups';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';

const OrganizationalGroupButtonContainer = ({
  group,
  pending,
  setOrganizational
}) =>
  <ResourceRenderer resource={group}>
    {({
      organizational,
      privateData: { students, assignments },
      permissionHints
    }) =>
      <OrganizationalGroupButton
        organizational={organizational}
        pending={pending}
        setOrganizational={setOrganizational}
        disabled={
          !permissionHints.update ||
          students.length > 0 ||
          assignments.length > 0
        }
      />}
  </ResourceRenderer>;

OrganizationalGroupButtonContainer.propTypes = {
  id: PropTypes.string.isRequired,
  group: ImmutablePropTypes.map,
  pending: PropTypes.bool.isRequired,
  setOrganizational: PropTypes.func.isRequired
};

const mapStateToProps = (state, { id }) => ({
  group: groupSelector(id)(state),
  pending: groupOrganizationalPendingChange(id)(state)
});

const mapDispatchToProps = (dispatch, { id }) => ({
  setOrganizational: organizational => () =>
    dispatch(setOrganizational(id, organizational))
});

export default connect(mapStateToProps, mapDispatchToProps)(
  OrganizationalGroupButtonContainer
);
