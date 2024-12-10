import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { ArchiveIcon, LoadingIcon } from '../../icons';
import Button from '../../widgets/TheButton';

const ArchiveExerciseButton = ({ archived, pending, disabled = false, setArchived, ...props }) => (
  <Button
    {...props}
    variant={disabled ? 'secondary' : pending === false ? 'danger' : 'warning'}
    onClick={() => setArchived(!archived)}
    disabled={pending || disabled}>
    {pending ? <LoadingIcon gapRight={2} /> : <ArchiveIcon archived={archived} gapRight={2} />}
    {archived ? (
      <FormattedMessage id="app.archiveExerciseButton.unset" defaultMessage="Excavate from Archive" />
    ) : (
      <FormattedMessage id="app.archiveExerciseButton.set" defaultMessage="Archive the Exercise" />
    )}
  </Button>
);

ArchiveExerciseButton.propTypes = {
  archived: PropTypes.bool.isRequired,
  pending: PropTypes.bool,
  disabled: PropTypes.bool,
  setArchived: PropTypes.func.isRequired,
};

export default ArchiveExerciseButton;
