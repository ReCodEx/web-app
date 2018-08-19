import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { GroupIcon, LoadingIcon } from '../../icons';
import Button from '../../widgets/FlatButton';

const ArchiveGroupButton = ({
  archived,
  pending,
  disabled = false,
  setArchived
}) =>
  <Button
    bsStyle={disabled ? 'default' : 'info'}
    onClick={setArchived(!archived)}
    disabled={pending || disabled}
  >
    {pending
      ? <LoadingIcon gapRight />
      : <GroupIcon archived={!archived} gapRight />}
    {archived === true
      ? <FormattedMessage
          id="app.archiveGroupButton.unset"
          defaultMessage="Unarchivate this Group"
        />
      : <FormattedMessage
          id="app.archiveGroupButton.set"
          defaultMessage="Archivate this Group"
        />}
  </Button>;

ArchiveGroupButton.propTypes = {
  archived: PropTypes.bool.isRequired,
  pending: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  setArchived: PropTypes.func.isRequired
};

export default ArchiveGroupButton;
