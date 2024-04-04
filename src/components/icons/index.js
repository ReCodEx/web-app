import React from 'react';
import PropTypes from 'prop-types';
import Icon from './Icon';
import { NeedFixingIcon, ExercisePrefixIcons, LockIcon, CheckRequiredIcon } from './ExercisePrefixIcons';

/*
 * Icons with meta-names
 */

const defaultMessageIcon = ['far', 'envelope'];

export const AbortIcon = props => <Icon {...props} icon="car-crash" />;
export const AcceptIcon = props => <Icon {...props} icon={['far', 'handshake']} />;
export const AcceptedIcon = props => <Icon {...props} icon="circle-check" />;
export const AddIcon = props => <Icon {...props} icon="plus-circle" />;
export const AdminIcon = props => <Icon {...props} icon="user-tie" />;
export const AdminRoleIcon = props => <Icon {...props} icon="crown" />;
export const AdressIcon = props => <Icon {...props} icon="at" />;
export const ArchiveIcon = ({ archived = false, ...props }) => (
  <Icon {...props} icon={archived ? 'dolly' : 'boxes-packing'} />
);
export const AssignmentIcon = props => <Icon {...props} icon="laptop-code" />;
export const AssignmentsIcon = props => <Icon {...props} icon="tasks" />;
export const AuthorIcon = props => <Icon {...props} icon="user-pen" />;
export const BanIcon = props => <Icon {...props} icon="ban" />;
export const BellIcon = props => <Icon {...props} icon={['far', 'bell']} />;
export const BindIcon = props => <Icon {...props} icon="link" />;
export const BonusIcon = props => <Icon {...props} icon="hand-holding-usd" />;
export const BugIcon = props => <Icon {...props} icon="bug" />;
export { CheckRequiredIcon };
export const CircleIcon = ({ selected = false, ...props }) => (
  <Icon {...props} icon={['far', selected ? 'circle-dot' : 'circle']} />
);
export const ClockIcon = props => <Icon {...props} icon={['far', 'clock']} />;
export const CloseIcon = props => <Icon {...props} icon="times" />;
export const CodeFileIcon = props => <Icon {...props} icon={['far', 'file-code']} />;
export const CodeIcon = props => <Icon {...props} icon="code" />;
export const CodeCompareIcon = props => <Icon {...props} icon="code-compare" />;
export const CopyIcon = props => <Icon {...props} icon={['far', 'clipboard']} />;
export const ChatIcon = props => <Icon {...props} icon={['far', 'comments']} />;
export const DashboardIcon = props => <Icon {...props} icon="tachometer-alt" />;
export const DeadlineIcon = props => <Icon {...props} icon="hourglass-half" />;
export const DeleteIcon = props => <Icon {...props} icon="trash" />;
export const DetailIcon = props => <Icon {...props} icon="search" />;
export const DownloadIcon = props => <Icon {...props} icon="cloud-download-alt" />;
export const EditIcon = props => <Icon {...props} icon={['far', 'edit']} />;
export const EditAssignmentIcon = EditIcon;
export const EditExerciseIcon = EditIcon;
export const EditGroupIcon = props => <Icon {...props} icon="users-cog" />;
export const EditShadowAssignmentIcon = EditIcon;
export const EditUserIcon = props => <Icon {...props} icon="user-edit" />;
export const EmpoweredSupervisorIcon = props => <Icon {...props} icon="user-ninja" />;
export const ErrorIcon = props => <Icon {...props} icon="exclamation-circle" />;
export const EvaluationFailedIcon = props => <Icon {...props} icon="bomb" />;
export const ExerciseIcon = props => <Icon {...props} icon="puzzle-piece" />;
export const ExpandCollapseIcon = ({ isOpen = false, ...props }) =>
  isOpen ? (
    <Icon icon={['far', 'minus-square']} gapRight {...props} />
  ) : (
    <Icon icon={['far', 'plus-square']} gapRight {...props} />
  );
export const FailureIcon = props => <Icon className="text-danger" {...props} icon="times" />;
export const FaqIcon = props => <Icon {...props} icon={['far', 'question-circle']} />;
export const ForkIcon = props => <Icon {...props} icon="code-branch" />;
export const GroupIcon = ({ organizational = false, archived = false, exam = false, ...props }) => (
  <Icon {...props} icon={organizational ? 'sitemap' : archived ? 'archive' : exam ? 'person-circle-check' : 'users'} />
);
export const GroupExamsIcon = props => <Icon {...props} icon="lock" />;
export const HomeIcon = props => <Icon {...props} icon="home" />;
export const InfoIcon = props => <Icon {...props} icon="info-circle" />;
export const InputIcon = props => <Icon {...props} icon="sign-in-alt" />;
export const InstanceIcon = props => <Icon {...props} icon="university" />;
export const InvertIcon = props => <Icon {...props} icon="yin-yang" />;
export const LimitsIcon = props => <Icon {...props} icon="business-time" />;
export const LinkIcon = props => <Icon {...props} icon="share-square" />;
export const LoadingIcon = props => <Icon {...props} icon="spinner" pulse style={{ opacity: 0.8 }} />;
export const LocalIcon = props => <Icon {...props} icon="thumbtack" />;
export { LockIcon };
export const MailIcon = props => <Icon {...props} icon={defaultMessageIcon} />;
export { NeedFixingIcon };
export const NoteIcon = props => <Icon {...props} icon={['far', 'sticky-note']} />;
export const ObserverIcon = props => <Icon {...props} icon="binoculars" />;
export const OutputIcon = props => <Icon {...props} icon="sign-out-alt" />;
export const PastDeadlineIcon = props => <Icon {...props} icon="skull" />;
export const PipelineIcon = props => <Icon {...props} icon="random" />;
export const PipelineStructureIcon = props => <Icon {...props} icon="sitemap" />;
export const PlagiarismIcon = props => <Icon icon="person-circle-exclamation" {...props} />;
export const PointsIcon = props => <Icon icon="comment-dollar" {...props} />;
export const PointsDecreasedIcon = props => <Icon icon="level-down-alt" className="text-muted" {...props} />;
export const PointsGraphIcon = props => <Icon icon={['far', 'chart-bar']} {...props} />;
export const PointsInterpolationIcon = props => (
  <Icon icon="long-arrow-alt-right" className="text-muted" transform={{ rotate: 33 }} {...props} />
);
export const RedoIcon = props => <Icon {...props} icon="redo-alt" />;
export const ReferenceSolutionIcon = props => <Icon {...props} icon="book" />;
export const RefreshIcon = props => <Icon {...props} icon="sync" />;
export const RemoveIcon = props => <Icon {...props} icon="minus-circle" />;
export const RemoveUserIcon = props => <Icon {...props} icon="user-slash" />;
export const ResultsIcon = props => <Icon {...props} icon="chart-line" />;
export const ReviewIcon = ({ review = null, ...props }) =>
  review && review.closedAt ? (
    <Icon {...props} icon={review.issues > 0 ? 'file-circle-exclamation' : 'file-circle-check'} />
  ) : (
    <Icon {...props} icon="microscope" />
  );
export const SaveIcon = props => <Icon {...props} icon={['far', 'save']} />;
export const SearchIcon = props => <Icon {...props} icon="search" />;
export const ServerIcon = props => <Icon {...props} icon="server" />;
export const SendIcon = props => <Icon {...props} icon={['far', 'paper-plane']} />;
export const SettingsIcon = props => <Icon {...props} icon="cog" />;
export const ShadowAssignmentIcon = props => <Icon {...props} icon="user-secret" />;
export const SignInIcon = props => <Icon {...props} icon="sign-in-alt" />;
export const SolutionResultsIcon = props => <Icon {...props} icon="envelope-open-text" />;
export const SortedIcon = ({ active = true, descending = false, ...props }) => (
  <Icon
    icon={!active || !descending ? 'sort-alpha-down' : 'sort-alpha-up'}
    timid={!active}
    className={active ? 'text-success' : 'text-primary'}
    {...props}
  />
);
export const SquareIcon = ({ checked = false, ...props }) => (
  <Icon {...props} icon={checked ? ['far', 'check-square'] : ['far', 'square']} />
);
export const StopIcon = props => <Icon {...props} icon={['far', 'circle-stop']} />;
export const StudentsIcon = props => <Icon {...props} icon="graduation-cap" />;
export const SuccessIcon = props => <Icon {...props} icon="check" />;
export const SuccessOrFailureIcon = ({ success = false, colors = true, ...props }) =>
  success ? (
    <SuccessIcon className={colors ? 'text-success' : ''} {...props} />
  ) : (
    <FailureIcon className={colors ? 'text-danger' : ''} {...props} />
  );
export const SuperadminIcon = props => <Icon {...props} icon="chess-queen" />;
export const SupervisorIcon = props => <Icon {...props} icon="user-graduate" />;
export const SupervisorStudentIcon = props => <Icon {...props} icon="chalkboard-teacher" />;
export const SwapIcon = props => <Icon {...props} icon="sync" />;
export const TagIcon = props => <Icon {...props} icon="tag" />;
export const TestsIcon = props => <Icon {...props} icon="cogs" />;
export const TransferIcon = props => <Icon {...props} icon="exchange-alt" />;

const messageIconTypes = {
  success: ['far', 'circle-check'],
  info: 'info-circle',
  danger: 'radiation',
  warning: 'exclamation-triangle',
};
export const TypedMessageIcon = ({ type, ...props }) => (
  <Icon {...props} icon={messageIconTypes[type] || defaultMessageIcon} />
);

export const UnbindIcon = props => <Icon {...props} icon={['far', 'hand-scissors']} />;
export const UndoIcon = props => <Icon {...props} icon="undo-alt" />;
export const UnlockIcon = props => <Icon {...props} icon="unlock" />;
export const UploadIcon = props => <Icon {...props} icon="cloud-upload-alt" />;
export const UserIcon = props => <Icon {...props} icon={['far', 'user']} />;
export const UserLockIcon = props => <Icon {...props} icon="user-lock" />;
export const UserProfileIcon = props => <Icon {...props} icon={['far', 'address-card']} />;
export const VisibleIcon = ({ visible = true, ...props }) =>
  visible ? (
    <Icon {...props} icon={['far', 'eye']} />
  ) : (
    <Icon {...props} icon={['far', 'eye-slash']} className="text-muted" />
  );
export const WarningIcon = props => <Icon {...props} icon="exclamation-triangle" />;
export const WorkingIcon = props => <Icon {...props} spin icon="cog" />;
export const ZipIcon = props => <Icon {...props} icon={['far', 'file-archive']} />;

ArchiveIcon.propTypes = {
  archived: PropTypes.bool,
};

CircleIcon.propTypes = {
  selected: PropTypes.bool,
};

ExpandCollapseIcon.propTypes = {
  isOpen: PropTypes.bool,
};

GroupIcon.propTypes = {
  organizational: PropTypes.bool,
  archived: PropTypes.bool,
  exam: PropTypes.bool,
};

ReviewIcon.propTypes = {
  review: PropTypes.shape({
    startedAt: PropTypes.number,
    closedAt: PropTypes.number,
    issues: PropTypes.number,
  }),
};

SortedIcon.propTypes = {
  active: PropTypes.bool,
  descending: PropTypes.bool,
};

SquareIcon.propTypes = {
  checked: PropTypes.bool,
};

SuccessOrFailureIcon.propTypes = {
  success: PropTypes.bool,
  colors: PropTypes.bool,
};

TypedMessageIcon.propTypes = {
  type: PropTypes.string.isRequired,
};

VisibleIcon.propTypes = {
  visible: PropTypes.bool,
};

export { ExercisePrefixIcons };
export { default as MaybeBonusAssignmentIcon } from './MaybeBonusAssignmentIcon';
export { default as MaybeVisibleAssignmentIcon } from './MaybeVisibleAssignmentIcon';

export default Icon;
