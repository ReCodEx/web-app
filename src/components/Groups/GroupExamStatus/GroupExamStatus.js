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

class GroupExamStatus extends Component {
  state = { examModal: false };
  intervalHandler = null;

  static getDerivedStateFromProps({ group }, state) {
    const now = Date.now() / 1000;
    const hasExam = group.privateData.examBegin && group.privateData.examEnd && group.privateData.examEnd > now;
    const examInProgress = hasExam && group.privateData.examBegin <= now;
    const examEndsIn24 = hasExam && group.privateData.examEnd < now + 86400;
    const nextChange = examInProgress
      ? group.privateData.examEnd - now
      : hasExam
      ? group.privateData.examBegin - now
      : null;
    const changeImminent = nextChange && nextChange <= 5; // s
    const examModal = (state.examModal && !changeImminent) || false;
    return { hasExam, examInProgress, changeImminent, examEndsIn24, examModal };
  }

  examModalOpen = () => {
    this.setState({ examModal: true });
  };

  examModalClose = () => {
    this.setState({ examModal: false });
  };

  examFormSubmit = data => {
    const { begin, end, strict } = transformExamData(data);
    const { examInProgress } = this.state;
    return this.props.setExamPeriod(examInProgress ? null : begin, end, examInProgress ? null : strict).then(res => {
      this.examModalClose();
      return Promise.resolve(res);
    });
  };

  removeExam = () => {
    const {
      removeExamPeriod,
      addNotification,
      intl: { formatMessage },
    } = this.props;
    addNotification('kuk');
    removeExamPeriod().catch(err => {
      addNotification(getErrorMessage(formatMessage)(err), false);
    });
  };

  startNow = () => {
    const {
      group,
      setExamPeriod,
      addNotification,
      intl: { formatMessage },
    } = this.props;
    setExamPeriod(Math.round(Date.now() / 1000), group.privateData.examEnd).catch(err => {
      addNotification(getErrorMessage(formatMessage)(err), false);
    });
  };

  terminateNow = () => {
    const {
      setExamPeriod,
      addNotification,
      intl: { formatMessage },
    } = this.props;
    setExamPeriod(null, Math.round(Date.now() / 1000)).catch(err => {
      addNotification(getErrorMessage(formatMessage)(err), false);
    });
  };

  periodicRefresh = () => {
    this.setState(GroupExamStatus.getDerivedStateFromProps(this.props, this.state));
    // console.log(this.state);
  };

  componentDidMount() {
    if (window && 'setInterval' in window) {
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
    const { group, examBeginImmediately, examEndRelative, pending, removeExamPeriod } = this.props;

    return (
      <>
        <Callout
          variant={this.state.examInProgress ? 'danger' : this.state.hasExam ? 'warning' : 'secondary'}
          icon={
            this.state.examInProgress ? (
              <GroupExamsIcon className="fa-beat" />
            ) : this.state.hasExam ? (
              <ClockIcon />
            ) : null
          }>
          <h4>
            {this.state.examInProgress ? (
              <FormattedMessage
                id="app.groupExams.inProgress"
                defaultMessage="Exam in progress, the group is in secured mode"
              />
            ) : this.state.hasExam ? (
              <FormattedMessage id="app.groupExams.examPlanned" defaultMessage="There is an exam scheduled" />
            ) : (
              <FormattedMessage id="app.groupExams.noExam" defaultMessage="There is currently no exam scheduled" />
            )}
          </h4>

          {this.state.hasExam && (
            <table>
              <tbody>
                <tr>
                  <td className="text-bold p-2">
                    <FormattedMessage id="app.groupExams.beginAt" defaultMessage="Begins at" />:
                  </td>
                  <td>
                    <DateTime unixts={group.privateData.examBegin} showRelative />
                  </td>
                </tr>
                <tr>
                  <td className="text-bold p-2">
                    <FormattedMessage id="app.groupExams.endAt" defaultMessage="Ends at" />:
                  </td>
                  <td>
                    <DateTime unixts={group.privateData.examEnd} showRelative />
                  </td>
                </tr>
                <tr>
                  <td className="text-bold p-2">
                    <FormattedMessage id="app.groupExams.locking" defaultMessage="Lock type" />:
                  </td>
                  <td>
                    <em>
                      {group.privateData.examLockStrict ? (
                        <FormattedMessage id="app.groupExams.lockStrict" defaultMessage="strict" />
                      ) : (
                        <FormattedMessage id="app.groupExams.lockRegular" defaultMessage="regular" />
                      )}
                    </em>
                    <Explanation
                      id="lock-explain"
                      title={
                        group.privateData.examLockStrict ? (
                          <FormattedMessage id="app.groupExams.lockStrictTitle" defaultMessage="Strict lock" />
                        ) : (
                          <FormattedMessage id="app.groupExams.lockRegularTitle" defaultMessage="Regular lock" />
                        )
                      }>
                      {group.privateData.examLockStrict ? (
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

          {hasPermissions(group, 'setExamPeriod') && (
            <>
              <hr />

              <TheButtonGroup className="text-center">
                {this.state.hasExam ? (
                  <Button
                    variant="warning"
                    disabled={pending || this.state.changeImminent}
                    onClick={this.examModalOpen}>
                    {pending ? <LoadingIcon gapRight /> : <EditIcon gapRight />}
                    <FormattedMessage id="app.groupExams.button.edit" defaultMessage="Edit Exam" />
                  </Button>
                ) : (
                  <Button variant="success" disabled={pending} onClick={this.examModalOpen}>
                    {pending ? <LoadingIcon gapRight /> : <ClockIcon gapRight />}
                    <FormattedMessage id="app.groupExams.button.createNew" defaultMessage="Schedule New Exam" />
                  </Button>
                )}

                {this.state.examInProgress ? (
                  <Button
                    variant="danger"
                    disabled={pending || this.state.changeImminent}
                    onClick={this.terminateNow}
                    confirmId="end-exam-button"
                    confirm={
                      <FormattedMessage
                        id="app.groupExams.button.terminate.confirm"
                        defaultMessage="Do you really wish to terminate the exam immediately?"
                      />
                    }>
                    {pending ? <LoadingIcon gapRight /> : <Icon icon={['far', 'hand']} gapRight />}
                    <FormattedMessage id="app.groupExams.button.terminate" defaultMessage="Terminate Now" />
                  </Button>
                ) : (
                  this.state.hasExam && (
                    <>
                      {this.state.examEndsIn24 && (
                        <Button
                          variant="success"
                          disabled={pending || this.state.changeImminent}
                          onClick={this.startNow}
                          confirmId="start-exam-button"
                          confirm={
                            <FormattedMessage
                              id="app.groupExams.button.start.confirm"
                              defaultMessage="Do you really wish to start the exam immediately?"
                            />
                          }>
                          {pending ? <LoadingIcon gapRight /> : <Icon icon={['far', 'hand-point-right']} gapRight />}
                          <FormattedMessage id="app.groupExams.button.start" defaultMessage="Start Now" />
                        </Button>
                      )}
                      {hasPermissions(group, 'removeExamPeriod') && (
                        <Button
                          variant="danger"
                          disabled={pending || this.state.changeImminent}
                          onClick={removeExamPeriod}
                          confirmId="cancel-exam-button"
                          confirm={
                            <FormattedMessage
                              id="app.groupExams.button.cancel.confirm"
                              defaultMessage="Do you really wish to cancel the scheduled exam?"
                            />
                          }>
                          {pending ? <LoadingIcon gapRight /> : <BanIcon gapRight />}
                          <FormattedMessage id="app.groupExams.button.cancel" defaultMessage="Cancel Exam" />
                        </Button>
                      )}
                    </>
                  )
                )}
              </TheButtonGroup>
            </>
          )}
        </Callout>

        {hasPermissions(group, 'setExamPeriod') && (
          <Modal size="xl" show={this.state.examModal} onHide={this.examModalClose}>
            <Modal.Header closeButton>
              <Modal.Title>
                {this.state.hasExam ? (
                  <FormattedMessage
                    id="app.groupExams.examModal.edit"
                    defaultMessage="Update scheduled examination in this group"
                  />
                ) : (
                  <FormattedMessage
                    id="app.groupExams.examModal.create"
                    defaultMessage="Plan an examination in this group"
                  />
                )}
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <ExamForm
                form="exam"
                initialValues={
                  this.state.hasExam
                    ? prepareExamInitValues(
                        group.privateData.examBegin,
                        group.privateData.examEnd,
                        group.privateData.examLockStrict || false
                      )
                    : prepareExamInitValues()
                }
                createNew={!this.state.hasExam}
                examInProgress={this.state.examInProgress}
                beginImmediately={examBeginImmediately}
                endRelative={examEndRelative}
                onSubmit={this.examFormSubmit}
                onCancel={this.examModalClose}
              />
            </Modal.Body>
          </Modal>
        )}
      </>
    );
  }
}

GroupExamStatus.propTypes = {
  group: PropTypes.shape({
    privateData: PropTypes.shape({
      examBegin: PropTypes.number,
      examEnd: PropTypes.number,
      examLockStrict: PropTypes.bool,
    }).isRequired,
  }).isRequired,
  examBeginImmediately: PropTypes.bool,
  examEndRelative: PropTypes.bool,
  pending: PropTypes.bool,
  setExamPeriod: PropTypes.func.isRequired,
  removeExamPeriod: PropTypes.func.isRequired,
  addNotification: PropTypes.func.isRequired,
  intl: PropTypes.object,
};

export default injectIntl(GroupExamStatus);
