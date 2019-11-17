import React from 'react';
import PropTypes from 'prop-types';
import Icon from './Icon';

/*
 * Icons with meta-names
 */

const defaultMessageIcon = ['far', 'envelope'];

export const AddIcon = props => <Icon {...props} icon="plus-circle" />;
export const AdressIcon = props => <Icon {...props} icon="at" />;
export const ArchiveGroupIcon = ({ archived = false, ...props }) => (
  <Icon {...props} icon={archived ? 'dolly' : 'archive'} />
);
export const BanIcon = props => <Icon {...props} icon="ban" />;
export const BonusIcon = props => <Icon {...props} icon="hand-holding-usd" />;
export const BugIcon = props => <Icon {...props} icon="bug" />;
export const CloseIcon = props => <Icon {...props} icon="times" />;
export const CodeIcon = props => <Icon {...props} icon="code" />;
export const CopyIcon = props => <Icon {...props} icon={['far', 'clipboard']} />;
export const DeleteIcon = props => <Icon {...props} icon="trash" />;
export const DownloadIcon = props => <Icon {...props} icon="cloud-download-alt" />;
export const EditIcon = props => <Icon {...props} icon={['far', 'edit']} />;
export const EmpoweredSupervisorIcon = props => <Icon {...props} icon="user-ninja" />;
export const FailureIcon = props => (
  <strong className="text-danger">
    <Icon {...props} icon="times" />
  </strong>
);
export const GroupIcon = ({ organizational = false, archived = false, ...props }) => (
  <Icon {...props} icon={organizational ? 'sitemap' : archived ? 'archive' : 'users'} />
);
export const InfoIcon = props => <Icon {...props} icon="info-circle" />;
export const LoadingIcon = props => <Icon {...props} icon="spinner" pulse style={{ opacity: 0.8 }} />;
export const LocalIcon = props => <Icon {...props} icon="thumbtack" />;
export const LockIcon = props => <Icon {...props} icon="lock" />;
export const MailIcon = props => <Icon {...props} icon={defaultMessageIcon} />;
export const NeedFixingIcon = props => <Icon {...props} icon="medkit" />;
export const PipelineIcon = props => <Icon {...props} icon="random" />;
export const RefreshIcon = props => <Icon {...props} icon="sync" />;
export const RemoveIcon = props => <Icon {...props} icon="minus-circle" />;
export const ResultsIcon = props => <Icon {...props} icon="chart-line" />;
export const SearchIcon = props => <Icon {...props} icon="search" />;
export const SendIcon = props => <Icon {...props} icon={['far', 'paper-plane']} />;
export const SettingsIcon = props => <Icon {...props} icon="cog" />;
export const ShadowAssignmentIcon = props => <Icon {...props} icon="user-secret" />;
export const SortedIcon = ({ active = true, descending = false, ...props }) => (
  <Icon
    icon={!active || !descending ? 'sort-alpha-down' : 'sort-alpha-up'}
    timid={!active}
    className={active ? 'text-success' : 'text-primary'}
    {...props}
  />
);
export const SuccessIcon = props => (
  <strong className="text-success">
    <Icon {...props} icon="check" />
  </strong>
);
export const SuccessOrFailureIcon = ({ success = false, ...props }) =>
  success ? <SuccessIcon {...props} /> : <FailureIcon {...props} />;
export const SuperadminIcon = props => <Icon {...props} icon="chess-queen" />;
export const SupervisorIcon = props => <Icon {...props} icon="user-graduate" />;
export const SupervisorStudentIcon = props => <Icon {...props} icon="chalkboard-teacher" />;
export const TransferIcon = props => <Icon {...props} icon="exchange-alt" />;

const messageIconTypes = {
  success: ['far', 'check-circle'],
  info: 'info-circle',
  danger: 'radiation',
  warning: 'exclamation-triangle',
};
export const TypedMessageIcon = ({ type, ...props }) => (
  <Icon {...props} icon={messageIconTypes[type] || defaultMessageIcon} />
);

export const UnlockIcon = props => <Icon {...props} icon="unlock" />;
export const UploadIcon = props => <Icon {...props} icon="cloud-upload-alt" />;
export const UserIcon = props => <Icon {...props} icon={['far', 'user']} />;
export const VisibleIcon = ({ visible = true, ...props }) =>
  visible ? (
    <Icon {...props} icon={['far', 'eye']} />
  ) : (
    <Icon {...props} icon={['far', 'eye-slash']} className="text-muted" />
  );
export const WarningIcon = props => <Icon {...props} icon="exclamation-triangle" />;

GroupIcon.propTypes = {
  organizational: PropTypes.bool,
  archived: PropTypes.bool,
};

ArchiveGroupIcon.propTypes = {
  archived: PropTypes.bool,
};

SortedIcon.propTypes = {
  active: PropTypes.bool,
  descending: PropTypes.bool,
};

SuccessOrFailureIcon.propTypes = {
  success: PropTypes.bool,
};

TypedMessageIcon.propTypes = {
  type: PropTypes.string.isRequired,
};

VisibleIcon.propTypes = {
  visible: PropTypes.bool,
};

export { default as ExercisePrefixIcons } from './ExercisePrefixIcons';
export { default as MaybeBonusAssignmentIcon } from './MaybeBonusAssignmentIcon';
export { default as MaybeVisibleAssignmentIcon } from './MaybeVisibleAssignmentIcon';

export default Icon;
