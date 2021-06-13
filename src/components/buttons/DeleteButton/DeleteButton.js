import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

import Button from '../../widgets/FlatButton';
import OptionalTooltipWrapper from '../../widgets/OptionalTooltipWrapper';
import Confirm from '../../forms/Confirm';
import { isReady, isLoading, isDeleting, isDeleted } from '../../../redux/helpers/resourceManager';
import { DeleteIcon, FailureIcon, LoadingIcon, SuccessIcon } from '../../icons';

// Button states - reflecting resource states
const states = {
  DELETED: 'deleted',
  LOADING: 'loading',
  READY: 'ready',
  DELETING: 'deleting',
  FAILED: 'failed',
};

const getState = resource => {
  if (!resource || isDeleted(resource)) return states.DELETED;
  if (isLoading(resource)) return states.LOADING;
  if (isReady(resource)) return states.READY;
  if (isDeleting(resource)) return states.DELETING;
  return states.FAILED;
};

const stateIcons = captionAsTooltip => {
  const iconProps = { smallGapLeft: captionAsTooltip, smallGapRight: captionAsTooltip, gapRight: !captionAsTooltip };
  return {
    [states.DELETED]: <SuccessIcon {...iconProps} />,
    [states.LOADING]: <LoadingIcon {...iconProps} />,
    [states.READY]: <DeleteIcon {...iconProps} />,
    [states.DELETING]: <LoadingIcon {...iconProps} />,
    [states.FAILED]: <FailureIcon {...iconProps} />,
  };
};

const stateLabels = {
  [states.DELETED]: <FormattedMessage id="generic.deleted" defaultMessage="Deleted" />,
  [states.LOADING]: <FormattedMessage id="generic.delete" defaultMessage="Delete" />,
  [states.READY]: <FormattedMessage id="generic.delete" defaultMessage="Delete" />,
  [states.DELETING]: <FormattedMessage id="generic.deleting" defaultMessage="Deleting..." />,
  [states.FAILED]: <FormattedMessage id="generic.deleteFailed" defaultMessage="Delete Failed" />,
};

const DeleteButtonInternal = ({ id, icon, label, disabled, small, captionAsTooltip, ...props }) => (
  <OptionalTooltipWrapper tooltip={label} hide={!captionAsTooltip} tooltipId={`delete-${id}`}>
    <Button disabled={disabled} variant="danger" bsSize={small ? 'sm' : undefined} {...props}>
      {icon}
      {!captionAsTooltip && label}
    </Button>
  </OptionalTooltipWrapper>
);

const DeleteButton = ({
  id,
  resource,
  resourceless = false,
  deleteAction,
  disabled = false,
  small = true,
  captionAsTooltip = false,
  question = (
    <FormattedMessage
      id="app.deleteButton.confirm"
      defaultMessage="Are you sure you want to delete the resource? This cannot be undone."
    />
  ),
  ...props
}) => {
  const state = resourceless ? states.READY : getState(resource);
  const icon = stateIcons(captionAsTooltip)[state];
  const label = stateLabels[state];

  return state === states.READY ? (
    <Confirm id={id} onConfirmed={deleteAction} question={question}>
      <DeleteButtonInternal
        id={id}
        icon={icon}
        label={label}
        disabled={disabled || !id}
        small={small}
        captionAsTooltip={captionAsTooltip}
        {...props}
      />
    </Confirm>
  ) : (
    <DeleteButtonInternal
      id={id}
      icon={icon}
      label={label}
      disabled={disabled || !id}
      small={small}
      onClick={state === states.FAILED ? deleteAction : null}
      captionAsTooltip={captionAsTooltip}
      {...props}
    />
  );
};

DeleteButtonInternal.propTypes = {
  id: PropTypes.string,
  icon: PropTypes.element,
  label: PropTypes.oneOfType([PropTypes.oneOf([FormattedMessage]), PropTypes.element, PropTypes.string]),
  disabled: PropTypes.bool,
  small: PropTypes.bool,
  captionAsTooltip: PropTypes.bool,
};

DeleteButton.propTypes = {
  id: PropTypes.string,
  resource: ImmutablePropTypes.map,
  resourceless: PropTypes.bool,
  question: PropTypes.any,
  deleteAction: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  small: PropTypes.bool,
  captionAsTooltip: PropTypes.bool,
};

export default DeleteButton;
