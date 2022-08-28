import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';

import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import SourceCodeViewer from '../../components/helpers/SourceCodeViewer';
import { AssignmentSolutionNavigation } from '../../components/layout/Navigation';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import AcceptSolutionContainer from '../../containers/AcceptSolutionContainer';
import ReviewSolutionContainer from '../../containers/ReviewSolutionContainer';
import { TheButtonGroup } from '../../components/widgets/TheButton';
import Icon, { DownloadIcon, LoadingIcon, SolutionResultsIcon, WarningIcon } from '../../components/icons';

import { fetchAssignmentIfNeeded } from '../../redux/modules/assignments';
import { fetchSolutionIfNeeded, fetchUsersSolutions } from '../../redux/modules/solutions';
import { fetchAssignmentSolutionFilesIfNeeded } from '../../redux/modules/solutionFiles';
import { download } from '../../redux/modules/files';
import { fetchContentIfNeeded } from '../../redux/modules/filesContent';
import { getSolution } from '../../redux/selectors/solutions';
import { getSolutionFiles } from '../../redux/selectors/solutionFiles';
import { getAssignment, getUserSolutionsSortedData } from '../../redux/selectors/assignments';
import { getFilesContentSelector } from '../../redux/selectors/files';

import { hasPermissions } from '../../helpers/common';

const nameComparator = (a, b) => a.name.localeCompare(b.name, 'en');

const preprocessZipEntries = ({ zipEntries, ...file }) => {
  if (zipEntries) {
    file.zipEntries = zipEntries
      .filter(({ name, size }) => !name.endsWith('/') || size !== 0)
      .map(({ name, size }) => ({
        entryName: name,
        name: `${file.name}#${name}`,
        size,
        id: `${file.id}/${name}`,
        parentId: file.id,
      }))
      .sort(nameComparator);
  }
  return file;
};

const preprocessFiles = defaultMemoize(files =>
  files
    .sort(nameComparator)
    .map(preprocessZipEntries)
    .reduce((acc, file) => [...acc, ...(file.zipEntries || [file])], [])
);

class SolutionSourceCodes extends Component {
  static loadAsync = ({ solutionId, assignmentId }, dispatch) =>
    Promise.all([
      dispatch(fetchSolutionIfNeeded(solutionId))
        .then(res => res.value)
        .then(solution => Promise.all([dispatch(fetchUsersSolutions(solution.authorId, assignmentId))])),
      dispatch(fetchAssignmentIfNeeded(assignmentId)),
      dispatch(fetchAssignmentSolutionFilesIfNeeded(solutionId))
        .then(res => preprocessFiles(res.value))
        .then(files =>
          Promise.all(
            files.map(file => dispatch(fetchContentIfNeeded(file.parentId || file.id, file.entryName || null)))
          )
        ),
    ]);

  componentDidMount = () => this.props.loadAsync();

  componentDidUpdate(prevProps) {
    if (this.props.match.params.solutionId !== prevProps.match.params.solutionId) {
      this.props.loadAsync();
    }
  }

  render() {
    const {
      assignment,
      solution,
      files,
      fileContentsSelector,
      download,
      // userSolutionsSelector, // saved for later (for diffs)
      match: {
        params: { assignmentId },
      },
      intl: { locale },
    } = this.props;

    return (
      <Page
        resource={[solution, assignment]}
        icon={<SolutionResultsIcon />}
        title={
          <FormattedMessage id="app.solutionSourceCodes.title" defaultMessage="Solution Source Code Files Overview" />
        }>
        {(solution, assignment) => (
          <div>
            <AssignmentSolutionNavigation
              solutionId={solution.id}
              assignmentId={assignmentId}
              exerciseId={assignment.exerciseId}
              userId={solution.authorId}
              groupId={assignment.groupId}
              attemptIndex={solution.attemptIndex}
              canViewSolutions={hasPermissions(assignment, 'viewAssignmentSolutions')}
              canViewExercise={
                hasPermissions(
                  assignment,
                  'viewAssignmentSolutions'
                ) /* this is not the actual permission, but close enough */
              }
              canViewUserProfile={hasPermissions(assignment, 'viewAssignmentSolutions')}
            />

            {(hasPermissions(solution, 'setFlag') || hasPermissions(assignment, 'resubmitSubmissions')) && (
              <div className="mb-3">
                <TheButtonGroup>
                  {hasPermissions(solution, 'setFlag') && (
                    <>
                      <AcceptSolutionContainer id={solution.id} locale={locale} />
                      <ReviewSolutionContainer id={solution.id} locale={locale} />
                    </>
                  )}
                </TheButtonGroup>
              </div>
            )}

            <ResourceRenderer resource={files} bulkyLoading>
              {files =>
                preprocessFiles(files).map(file => (
                  <ResourceRenderer
                    key={file.id}
                    resource={fileContentsSelector(file.parentId || file.id, file.entryName || null)}
                    loading={
                      <Box
                        key={`${file.id}-loading`}
                        title={
                          <>
                            <LoadingIcon gapRight />
                            <code>{file.name}</code>
                          </>
                        }
                        noPadding
                      />
                    }>
                    {content => (
                      <Box
                        key={file.id}
                        title={
                          <>
                            {content.malformedCharacters && (
                              <OverlayTrigger
                                placement="bottom"
                                overlay={
                                  <Tooltip id={`${file.id}-malformed`}>
                                    <FormattedMessage
                                      id="app.solutionSourceCodes.malformedTooltip"
                                      defaultMessage="The file is not a valid UTF-8 text file so it cannot be properly displayed as a source code."
                                    />
                                  </Tooltip>
                                }>
                                <WarningIcon className="text-danger" gapRight />
                              </OverlayTrigger>
                            )}

                            {content.tooLarge && (
                              <OverlayTrigger
                                placement="bottom"
                                overlay={
                                  <Tooltip id={`${file.id}-tooLarge`}>
                                    <FormattedMessage
                                      id="app.solutionSourceCodes.tooLargeTooltip"
                                      defaultMessage="The file is too large for code preview and it was cropped."
                                    />
                                  </Tooltip>
                                }>
                                <Icon icon="scissors" className="text-warning" gapRight />
                              </OverlayTrigger>
                            )}

                            <code>{file.name}</code>

                            <DownloadIcon
                              gapLeft
                              timid
                              className="text-primary"
                              onClick={ev => {
                                ev.stopPropagation();
                                download(file.parentId || file.id, file.entryName || null);
                              }}
                            />
                          </>
                        }
                        noPadding
                        unlimitedHeight
                        collapsable
                        isOpen={!content.malformedCharacters}>
                        {content.malformedCharacters ? (
                          <pre>{content.content}</pre>
                        ) : (
                          <SourceCodeViewer content={content.content} name={file.name} />
                        )}
                      </Box>
                    )}
                  </ResourceRenderer>
                ))
              }
            </ResourceRenderer>
          </div>
        )}
      </Page>
    );
  }
}

SolutionSourceCodes.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      assignmentId: PropTypes.string.isRequired,
      solutionId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  assignment: PropTypes.object,
  children: PropTypes.element,
  solution: PropTypes.object,
  files: ImmutablePropTypes.map,
  fileContentsSelector: PropTypes.func.isRequired,
  userSolutionsSelector: PropTypes.func.isRequired,
  loadAsync: PropTypes.func.isRequired,
  download: PropTypes.func.isRequired,
  intl: PropTypes.object,
};

export default connect(
  (
    state,
    {
      match: {
        params: { solutionId, assignmentId },
      },
    }
  ) => ({
    solution: getSolution(solutionId)(state),
    files: getSolutionFiles(state, solutionId),
    fileContentsSelector: getFilesContentSelector(state),
    userSolutionsSelector: getUserSolutionsSortedData(state),
    assignment: getAssignment(state)(assignmentId),
  }),
  (dispatch, { match: { params } }) => ({
    loadAsync: () => SolutionSourceCodes.loadAsync(params, dispatch),
    download: (id, entry = null) => dispatch(download(id, entry)),
  })
)(injectIntl(SolutionSourceCodes));
