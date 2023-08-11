import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { ArchiveGroupIcon, LoadingIcon } from '../../icons';
import Button from '../../widgets/TheButton';

const ArchiveGroupButton = ({ archived, pending, disabled = false, setArchived, shortLabels = false, ...props }) => (
  <Button
    {...props}
    variant={disabled ? 'secondary' : 'info'}
    onClick={setArchived(!archived)}
    disabled={pending || disabled}>
    {pending ? <LoadingIcon gapRight /> : <ArchiveGroupIcon archived={archived} gapRight />}
    {archived === true ? (
      shortLabels ? (
        <FormattedMessage id="app.archiveGroupButton.unsetShort" defaultMessage="Excavate" />
      ) : (
        <FormattedMessage id="app.archiveGroupButton.unset" defaultMessage="Excavate from Archive" />
      )
    ) : shortLabels ? (
      <FormattedMessage id="app.archiveGroupButton.setShort" defaultMessage="Archive" />
    ) : (
      <FormattedMessage id="app.archiveGroupButton.set" defaultMessage="Archive this Group" />
    )}
  </Button>
);

ArchiveGroupButton.propTypes = {
  archived: PropTypes.bool.isRequired,
  pending: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  setArchived: PropTypes.func.isRequired,
  shortLabels: PropTypes.bool,
};

export default ArchiveGroupButton;
