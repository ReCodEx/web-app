import React from 'react';
import { FormattedMessage } from 'react-intl';

export const LOCK_TYPE = {
  restricted: <FormattedMessage id="app.groupExams.lock.restricted" defaultMessage="restricted" />,
  accepted: <FormattedMessage id="app.groupExams.lock.accepted" defaultMessage="accepted" />,
  reviewed: <FormattedMessage id="app.groupExams.lock.reviewed" defaultMessage="reviewed" />,
  visible: <FormattedMessage id="app.groupExams.lock.visible" defaultMessage="visible" />,
};

export const LOCK_TITLE = {
  restricted: <FormattedMessage id="app.groupExams.lockTitle.restricted" defaultMessage="Restricted access" />,
  accepted: <FormattedMessage id="app.groupExams.lockTitle.accepted" defaultMessage="Accepted solutions" />,
  reviewed: (
    <FormattedMessage id="app.groupExams.lockTitle.reviewed" defaultMessage="Reviewed and accepted solutions" />
  ),
  visible: <FormattedMessage id="app.groupExams.lockTitle.visible" defaultMessage="All visible (read-only)" />,
};

export const LOCK_EXPLANATION = {
  restricted: (
    <FormattedMessage
      id="app.groupExams.lockExplanation.restricted"
      defaultMessage="Users taking the exam will not be allowed to access any other group, not even for reading (so that are cut of source codes they submitted before the exam)."
    />
  ),
  accepted: (
    <FormattedMessage
      id="app.groupExams.lockExplanation.accepted"
      defaultMessage="Users taking the exam will be allowed to access solutions marked as accepted in other groups in read-only mode."
    />
  ),
  reviewed: (
    <FormattedMessage
      id="app.groupExams.lockExplanation.reviewed"
      defaultMessage="Users taking the exam will be allowed to access reviewed and accepted solutions in other groups in read-only mode."
    />
  ),
  visible: (
    <FormattedMessage
      id="app.groupExams.lockExplanation.visible"
      defaultMessage="Users taking the exam will be able to see everything in all other groups in read-only mode (for instance to utilize pieces of previously submitted code)."
    />
  ),
};

export const STUDENT_INFO = {
  restricted: (
    <FormattedMessage
      id="app.groupExams.studentInfo.restricted"
      defaultMessage="Furthermore, you will not be able to access other groups until the exam lock expires."
    />
  ),
  accepted: (
    <FormattedMessage
      id="app.groupExams.studentInfo.accepted"
      defaultMessage="Furthermore, you will be able to access accepted solutions in other groups in a read-only mode until the exam lock expires."
    />
  ),
  reviewed: (
    <FormattedMessage
      id="app.groupExams.studentInfo.reviewed"
      defaultMessage="Furthermore, you will be able to access accepted and reviewed solutions in other groups in a read-only mode until the exam lock expires."
    />
  ),
  visible: (
    <FormattedMessage
      id="app.groupExams.studentInfo.visible"
      defaultMessage="Furthermore, you will be able to access other groups in a read-only mode until the exam lock expires."
    />
  ),
};

export const LOCKED_STUDENT_INFO = {
  restricted: (
    <FormattedMessage
      id="app.groupExams.lockedStudentInfo.restricted"
      defaultMessage="You may not access any other groups until the exam lock expires."
    />
  ),
  accepted: (
    <FormattedMessage
      id="app.groupExams.lockedStudentInfo.accepted"
      defaultMessage="You may access accepted solutions in other groups in read-only mode until the exam lock expires."
    />
  ),
  reviewed: (
    <FormattedMessage
      id="app.groupExams.lockedStudentInfo.reviewed"
      defaultMessage="You may access accepted and reviewed solutions in other groups in read-only mode until the exam lock expires."
    />
  ),
  visible: (
    <FormattedMessage
      id="app.groupExams.lockedStudentInfo.visible"
      defaultMessage="You may access other groups in read-only mode until the exam lock expires."
    />
  ),
};

export const LOCKED_ELSEWHERE_STUDENT_INFO = {
  accepted: (
    <FormattedMessage
      id="app.groupExams.lockedElsewhereStudentInfo.accepted"
      defaultMessage="Your access is limited to accepted solutions only."
    />
  ),
  reviewed: (
    <FormattedMessage
      id="app.groupExams.lockedElsewhereStudentInfo.reviewed"
      defaultMessage="Your access is limited to accepted and reviewed solutions only."
    />
  ),
};

export const STUDENT_SOLUTIONS_RESTRICTIONS = {
  accepted: (
    <FormattedMessage
      id="app.groupExams.studentSolutionsRestrictions.accepted"
      defaultMessage="showing only accepted solutions"
    />
  ),
  reviewed: (
    <FormattedMessage
      id="app.groupExams.studentSolutionsRestrictions.reviewed"
      defaultMessage="showing only accepted and reviewed solutions"
    />
  ),
};
