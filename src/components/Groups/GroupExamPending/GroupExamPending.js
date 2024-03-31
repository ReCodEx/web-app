import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Modal } from 'react-bootstrap';

import ExamForm, {
  prepareInitValues as prepareExamInitValues,
  transformSubmittedData as transformExamData,
} from '../../forms/ExamForm';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Callout from '../../widgets/Callout';
import Icon, { BanIcon, ClockIcon, EditIcon, GroupExamsIcon, LoadingIcon } from '../../icons';
import DateTime from '../../widgets/DateTime';
import Explanation from '../../widgets/Explanation';
import { getErrorMessage } from '../../../locales/apiErrorMessages';

import { hasPermissions } from '../../../helpers/common';

const REFRESH_INTERVAL = 1; // [s]

class GroupExamPending extends Component {
  state = {};
  intervalHandler = null;

  static getDerivedStateFromProps({ privateData: { examBegin, examEnd } }, state) {
    const now = Date.now() / 1000;
    const isExam = examBegin && examEnd && examEnd > now && examBegin <= now;
    const nextChange = isExam ? examEnd - now : null;
    const changeImminent = nextChange && nextChange <= 5; // s
    return { isExam, changeImminent };
  }

  periodicRefresh = () => {
    if (!this.props.archived) {
      this.setState(GroupExamPending.getDerivedStateFromProps(this.props, this.state));
    }
  };

  componentDidMount() {
    if (!this.props.archived && window && 'setInterval' in window) {
      if (this.intervalHandler) {
        window.clearInterval(this.intervalHandler);
      }
      this.intervalHandler = window.setInterval(this.periodicRefresh, REFRESH_INTERVAL * 1000);
    }
  }

  componentWillUnmount() {
    if (this.intervalHandler) {
      window.clearInterval(this.intervalHandler);
      this.intervalHandler = null;
    }
  }

  render() {
    const {
      privateData: { examBegin, examEnd, examLockStrict },
      currentUser,
    } = this.props;

    //console.log(currentUser);
    return (
      this.state.isExam && (
        <Callout
          variant={this.state.examInProgress ? 'danger' : this.state.hasExam ? 'warning' : 'secondary'}
          icon={
            this.state.examInProgress ? (
              <GroupExamsIcon className="fa-beat" />
            ) : this.state.hasExam ? (
              <ClockIcon />
            ) : null
          }>
          TODO
          {this.state.hasExam && (
            <table>
              <tbody>
                <tr>
                  <td className="text-bold p-2">
                    <FormattedMessage id="app.groupExams.beginAt" defaultMessage="Begins at" />:
                  </td>
                  <td>
                    <DateTime unixts={examBegin} showRelative />
                  </td>
                </tr>
                <tr>
                  <td className="text-bold p-2">
                    <FormattedMessage id="app.groupExams.endAt" defaultMessage="Ends at" />:
                  </td>
                  <td>
                    <DateTime unixts={examEnd} showRelative />
                  </td>
                </tr>
                <tr>
                  <td className="text-bold p-2">
                    <FormattedMessage id="app.groupExams.locking" defaultMessage="Lock type" />:
                  </td>
                  <td>
                    <em>
                      {examLockStrict ? (
                        <FormattedMessage id="app.groupExams.lockStrict" defaultMessage="strict" />
                      ) : (
                        <FormattedMessage id="app.groupExams.lockRegular" defaultMessage="regular" />
                      )}
                    </em>
                    <Explanation
                      id="lock-explain"
                      title={
                        examLockStrict ? (
                          <FormattedMessage id="app.groupExams.lockStrictTitle" defaultMessage="Strict lock" />
                        ) : (
                          <FormattedMessage id="app.groupExams.lockRegularTitle" defaultMessage="Regular lock" />
                        )
                      }>
                      {examLockStrict ? (
                        <FormattedMessage
                          id="app.groupExams.lockStrictExplanation"
                          defaultMessage="Users taking the exam will not be allowed to access any other group, not even for reading (so thet are cut of source codes they submitted before the exam)."
                        />
                      ) : (
                        <FormattedMessage
                          id="app.groupExams.lockRegularExplanation"
                          defaultMessage="Users taking the exam will be able to access other groups in read-only mode (for instance to utilize pieces of previously submitted code)."
                        />
                      )}
                    </Explanation>
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </Callout>
      )
    );
  }
}

GroupExamPending.propTypes = {
  privateData: PropTypes.shape({
    examBegin: PropTypes.number,
    examEnd: PropTypes.number,
    examLockStrict: PropTypes.bool,
  }).isRequired,
  archived: PropTypes.bool,
  currentUser: PropTypes.object,
  //addNotification: PropTypes.func.isRequired,
  intl: PropTypes.object,
};

export default injectIntl(GroupExamPending);
