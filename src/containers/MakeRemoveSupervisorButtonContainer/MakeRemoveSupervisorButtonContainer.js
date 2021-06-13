import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';

import { makeSupervisor, removeSupervisor } from '../../redux/modules/groups';
import { fetchUserIfNeeded } from '../../redux/modules/users';
import { isSupervisorOf } from '../../redux/selectors/users';

import MakeSupervisorButton from '../../components/Groups/MakeSupervisorButton';
import RemoveSupervisorButton from '../../components/Groups/RemoveSupervisorButton';

const MakeRemoveSupervisorButtonContainer = ({
  userId,
  groupId,
  isSupervisor,
  makeSupervisor,
  removeSupervisor,
  fetchUserIfNeeded,
  ...props
}) =>
  isSupervisor ? (
    <RemoveSupervisorButton {...props} onClick={() => removeSupervisor(groupId, userId)} size="xs" />
  ) : (
    <MakeSupervisorButton
      {...props}
      onClick={() => {
        fetchUserIfNeeded(userId).then(() => makeSupervisor(groupId, userId));
      }}
      size="xs"
    />
  );

MakeRemoveSupervisorButtonContainer.propTypes = {
  groupId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  isSupervisor: PropTypes.bool.isRequired,
  makeSupervisor: PropTypes.func.isRequired,
  removeSupervisor: PropTypes.func.isRequired,
  fetchUserIfNeeded: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state, { groupId, userId }) => ({
  isSupervisor: isSupervisorOf(userId, groupId)(state),
});

const mapDispatchToProps = {
  makeSupervisor,
  removeSupervisor,
  fetchUserIfNeeded,
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(MakeRemoveSupervisorButtonContainer));
