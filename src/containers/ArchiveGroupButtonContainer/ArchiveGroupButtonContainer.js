import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import ArchiveGroupButton from '../../components/buttons/ArchiveGroupButton';
import { setArchived } from '../../redux/modules/groups';
import {
  groupSelector,
  groupArchivedPendingChange
} from '../../redux/selectors/groups';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';

const ArchiveGroupButtonContainer = ({
  group,
  pending,
  setArchived,
  bsSize = undefined,
  ...props
}) =>
  <ResourceRenderer resource={group}>
    {({ directlyArchived }) =>
      <ArchiveGroupButton
        archived={directlyArchived}
        pending={pending}
        setArchived={setArchived}
        bsSize={bsSize}
        {...props}
      />}
  </ResourceRenderer>;

ArchiveGroupButtonContainer.propTypes = {
  id: PropTypes.string.isRequired,
  group: ImmutablePropTypes.map,
  pending: PropTypes.bool.isRequired,
  setArchived: PropTypes.func.isRequired,
  bsSize: PropTypes.string
};

const mapStateToProps = (state, { id }) => ({
  group: groupSelector(id)(state),
  pending: groupArchivedPendingChange(id)(state)
});

const mapDispatchToProps = (dispatch, { id }) => ({
  setArchived: archived => () => dispatch(setArchived(id, archived))
});

export default connect(mapStateToProps, mapDispatchToProps)(
  ArchiveGroupButtonContainer
);
