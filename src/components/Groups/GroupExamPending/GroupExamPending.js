import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import ExamLockButtonContainer from '../../../containers/ExamLockButtonContainer';
import Callout from '../../widgets/Callout';
import { InfoIcon, GroupExamsIcon } from '../../icons';
import DateTime from '../../widgets/DateTime';
import Explanation from '../../widgets/Explanation';

import { isStudentRole } from '../../helpers/usersRoles';

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
      id,
      privateData: { examBegin, examEnd, examLockStrict },
      currentUser: {
        privateData: { groupLock, isGroupLockStrict, ipLock, role },
      },
    } = this.props;
    const isStudent = isStudentRole(role);

    return (
      this.state.isExam && (
        <Callout variant={isStudent && !groupLock ? 'danger' : 'warning'} icon={<GroupExamsIcon />}>
          <h4>
            {isStudent && groupLock ? (
              <FormattedMessage
                id="app.groupExams.pending.studentLockedTitle"
                defaultMessage="You are locked in for an exam"
              />
            ) : (
              <FormattedMessage
                id="app.groupExams.inProgress"
                defaultMessage="Exam in progress, the group is in secured mode"
              />
            )}
          </h4>

          {isStudent ? (
            <>
              {groupLock ? (
                <>
                  <div className="mb-1">
                    <strong className="mr-2">
                      <FormattedMessage id="app.groupExams.endAtLong" defaultMessage="Exam ends at" />:
                    </strong>
                    <DateTime unixts={examEnd} showRelative />
                  </div>

                  <div className="text-muted mb-1">
                    <FormattedMessage
                      id="app.groupExams.lockedStudentInfo"
                      defaultMessage="You may now see and submit solutions to exam assignments."
                    />{' '}
                    {isGroupLockStrict ? (
                      <FormattedMessage
                        id="app.groupExams.lockedStudentInfoStrict"
                        defaultMessage="You may not access any other groups until the exam lock expires."
                      />
                    ) : (
                      <FormattedMessage
                        id="app.groupExams.lockedStudentInfoRegular"
                        defaultMessage="You may access other groups in read-only mode until the exam lock expires."
                      />
                    )}
                  </div>

                  {ipLock && (
                    <div className="text-muted mb-1">
                      <FormattedMessage
                        id="app.groupExams.ipLockInfo"
                        defaultMessage="Your actions are restricted to IP address [{ipLock}] until the exam lock expires. Contact your exam supervisor if you require relocation."
                        values={{ ipLock: <code>{ipLock}</code> }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <table>
                  <tbody>
                    <tr>
                      <td className="pr-5">
                        <ExamLockButtonContainer groupId={id} size="lg" />
                      </td>
                      <td>
                        <div className="mb-1">
                          <strong className="mr-2">
                            <FormattedMessage id="app.groupExams.endAtLong" defaultMessage="Exam ends at" />:
                          </strong>
                          <DateTime unixts={examEnd} showRelative />
                        </div>

                        <p className="text-muted small">
                          <InfoIcon gapRight />
                          <FormattedMessage
                            id="app.groupExams.studentInfo"
                            defaultMessage="You need to lock yourself in to see the exam assignments. When locked, your actions will be restricted to your current IP address."
                          />{' '}
                          {examLockStrict ? (
                            <FormattedMessage
                              id="app.groupExams.studentInfoStrict"
                              defaultMessage="Furthermore, you will not be able to access other groups until the exam lock expires."
                            />
                          ) : (
                            <FormattedMessage
                              id="app.groupExams.studentInfoRegular"
                              defaultMessage="Furthermore, you will be able to access other groups in a read-only mode until the exam lock expires."
                            />
                          )}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}

              <hr className="mb-1" />
              <div className="text-muted small">
                <FormattedMessage
                  id="app.groupExams.timeAccuracyWarning"
                  defaultMessage="Your local system clock should be sufficiently synchronized or this component may not work properly."
                />
              </div>
            </>
          ) : (
            <table className="w-100">
              <tbody>
                <tr>
                  <td className="text-bold text-nowrap">
                    <FormattedMessage id="app.groupExams.beginAt" defaultMessage="Begins at" />:
                  </td>
                  <td className="px-2 py-1 text-nowrap">
                    <DateTime unixts={examBegin} showRelative />
                  </td>
                  <td rowSpan={3} className="w-100 p-2 pl-5 text-muted">
                    <p>
                      <InfoIcon gapRight />
                      <FormattedMessage
                        id="app.groupExams.pending.teacherInfo"
                        defaultMessage="The exam assignments are currently visible only to students who have lock themselves in the group. "
                      />
                    </p>
                    <p>
                      <InfoIcon gapRight />
                      <FormattedMessage
                        id="app.groupExams.timeAccuracyWarning"
                        defaultMessage="Your local system clock should be sufficiently synchronized or this component may not work properly."
                      />
                    </p>
                  </td>
                </tr>
                <tr>
                  <td className="text-bold text-nowrap">
                    <FormattedMessage id="app.groupExams.endAt" defaultMessage="Ends at" />:
                  </td>
                  <td className="px-2 py-1 text-nowrap">
                    <DateTime unixts={examEnd} showRelative />
                  </td>
                </tr>
                <tr>
                  <td className="text-bold text-nowrap">
                    <FormattedMessage id="app.groupExams.locking" defaultMessage="Lock type" />:
                  </td>
                  <td className="px-2 py-1 text-nowrap">
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
  id: PropTypes.string.isRequired,
  privateData: PropTypes.shape({
    examBegin: PropTypes.number,
    examEnd: PropTypes.number,
    examLockStrict: PropTypes.bool,
  }).isRequired,
  archived: PropTypes.bool,
  currentUser: PropTypes.shape({
    privateData: PropTypes.shape({
      ipLock: PropTypes.string,
      groupLock: PropTypes.string,
      isGroupLockStrict: PropTypes.bool,
      role: PropTypes.string,
    }).isRequired,
  }),
};

export default GroupExamPending;
