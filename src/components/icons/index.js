import React from 'react';
import PropTypes from 'prop-types';
import Icon from './Icon';

/*
 * Icons with meta-names
 */

export const AddIcon = props => <Icon {...props} icon="plus" />;
export const AdressIcon = props => <Icon {...props} icon="at" />;
export const CloseIcon = props => <Icon {...props} icon="times" />;
export const CopyIcon = props =>
  <Icon {...props} icon={['far', 'clipboard']} />;
export const DeleteIcon = props => <Icon {...props} icon="trash" />;
export const DownloadIcon = props =>
  <Icon {...props} icon="cloud-download-alt" />;
export const EditIcon = props => <Icon {...props} icon={['far', 'edit']} />;
export const Failure = props =>
  <strong className="text-danger">
    <Icon {...props} icon="times" />
  </strong>;
export const GroupIcon = ({ organizational = false, ...props }) =>
  <Icon {...props} icon={organizational ? 'sitemap' : 'users'} />;
export const InfoIcon = props => <Icon {...props} icon="info" />;
export const LoadingIcon = props =>
  <Icon {...props} icon="spinner" pulse style={{ opacity: 0.8 }} />;
export const LocalIcon = props => <Icon {...props} icon="thumbtack" />;
export const MailIcon = props => <Icon {...props} icon={['far', 'envelope']} />;
export const NeedFixingIcon = props => <Icon {...props} icon="medkit" />;
export const RefreshIcon = props => <Icon {...props} icon="sync" />;
export const RemoveIcon = props => <Icon {...props} icon="minus" />;
export const ResultsIcon = props => <Icon {...props} icon="chart-line" />;
export const SearchIcon = props => <Icon {...props} icon="search" />;
export const SendIcon = props =>
  <Icon {...props} icon={['far', 'paper-plane']} />;
export const SettingsIcon = props => <Icon {...props} icon="cog" />;
export const SortedIcon = ({ active = true, descendant = false, ...props }) =>
  <Icon
    icon={!active || !descendant ? 'sort-alpha-down' : 'sort-alpha-up'}
    timid={!active}
    className={active ? 'text-success' : 'text-primary'}
    {...props}
  />;
export const SuccessIcon = props =>
  <strong className="text-success">
    <Icon {...props} icon="check" />
  </strong>;
export const SuccessOrFailureIcon = ({ success = false, ...props }) =>
  success ? <SuccessIcon {...props} /> : <Failure {...props} />;
export const SuperadminIcon = props => <Icon {...props} icon="chess-queen" />;
export const SupervisorAdminIcon = props =>
  <strong className="text-danger">
    <Icon {...props} icon="user-graduate" />
  </strong>;
export const SupervisorIcon = props => <Icon {...props} icon="user-graduate" />;
export const SupervisorStudentIcon = props =>
  <Icon {...props} icon="chalkboard-teacher" />;
export const TransferIcon = props => <Icon {...props} icon="exchange-alt" />;
export const UploadIcon = props => <Icon {...props} icon="cloud-upload-alt" />;
export const WarningIcon = props =>
  <Icon {...props} icon="exclamation-triangle" />;

GroupIcon.propTypes = {
  organizational: PropTypes.bool
};

SortedIcon.propTypes = {
  active: PropTypes.bool,
  descendant: PropTypes.bool
};

SuccessOrFailureIcon.propTypes = {
  success: PropTypes.bool
};

export { default as ExercisePrefixIcons } from './ExercisePrefixIcons';
export {
  default as MaybeBonusAssignmentIcon
} from './MaybeBonusAssignmentIcon';
export { default as MaybePublicIcon } from './MaybePublicIcon';

export default Icon;
