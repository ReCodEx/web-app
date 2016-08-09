import { createSelector } from 'reselect';
import { submissionStatus } from '../modules/submission';

export const getSubmission = state => state.submission;
export const getFiles = state => getSubmission(state).get('files');

export const getNote = state => getSubmission(state).get('note');
export const getUploadingFiles = state => getFiles(state).get('uploading');
export const getUploadedFiles = state => getFiles(state).get('uploaded');
export const getFailedFiles = state => getFiles(state).get('failed');
export const getRemovedFiles = state => getFiles(state).get('removed');

export const getStatus = state => getSubmission(state).get('status');
export const isProcessing = state => getStatus(state) === submissionStatus.PROCESSING;
export const getSubmissionId = state => getSubmission(state).get('submissionId');
