import React, { Component } from 'react';
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

import { identity } from '../../helpers/common';

class ArchiveGroupButtonContainer extends Component {
  render() {
    const { group, pending, setArchived, bsSize = undefined } = this.props;
    return (
      <ResourceRenderer resource={group}>
        {({ directlyArchived, permissionHints }) =>
          permissionHints.archive
            ? <ArchiveGroupButton
                archived={directlyArchived}
                pending={pending}
                setArchived={setArchived}
                bsSize={bsSize}
                {...this.props}
              />
            : null}
      </ResourceRenderer>
    );
  }
}

ArchiveGroupButtonContainer.propTypes = {
  id: PropTypes.string.isRequired,
  group: ImmutablePropTypes.map,
  pending: PropTypes.bool.isRequired,
  setArchived: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  bsSize: PropTypes.string
};

const mapStateToProps = (state, { id }) => ({
  group: groupSelector(id)(state),
  pending: groupArchivedPendingChange(id)(state)
});

const mapDispatchToProps = (dispatch, { id, onChange = identity }) => ({
  setArchived: archived => ev => {
    ev && ev.stopPropagation();
    return dispatch(setArchived(id, archived)).then(onChange);
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(
  ArchiveGroupButtonContainer
);
