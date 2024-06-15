import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { lruMemoize } from 'reselect';

import ExamGroupButton from '../../components/buttons/ExamGroupButton';
import { setExamFlag } from '../../redux/modules/groups';
import { groupSelector, groupTypePendingChange } from '../../redux/selectors/groups';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { getErrorMessage } from '../../locales/apiErrorMessages';
import { addNotification } from '../../redux/modules/notifications';

const setExamFlagHandlingErrors = lruMemoize(
  (exam, setExamFlag, addNotification, formatMessage) => () =>
    setExamFlag(!exam).catch(err => {
      addNotification(getErrorMessage(formatMessage)(err), false);
    })
);

const ExamGroupButtonContainer = ({
  group,
  pending,
  setExamFlag,
  addNotification,
  intl: { formatMessage },
  ...props
}) => (
  <ResourceRenderer resource={group}>
    {({ exam, organizational, childGroups, permissionHints }) => (
      <ExamGroupButton
        exam={exam}
        pending={pending}
        setExamFlag={setExamFlagHandlingErrors(exam, setExamFlag, addNotification, formatMessage)}
        disabled={!permissionHints.setExamFlag || organizational || childGroups.length > 0}
        {...props}
      />
    )}
  </ResourceRenderer>
);

ExamGroupButtonContainer.propTypes = {
  id: PropTypes.string.isRequired,
  group: ImmutablePropTypes.map,
  pending: PropTypes.bool.isRequired,
  setExamFlag: PropTypes.func.isRequired,
  addNotification: PropTypes.func.isRequired,
  intl: PropTypes.object,
};

const mapStateToProps = (state, { id }) => ({
  group: groupSelector(state, id),
  pending: groupTypePendingChange(state, id),
});

const mapDispatchToProps = (dispatch, { id }) => ({
  setExamFlag: value => dispatch(setExamFlag(id, value)),
  addNotification: (...args) => dispatch(addNotification(...args)),
});

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ExamGroupButtonContainer));
