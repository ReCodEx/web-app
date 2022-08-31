import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';
import { withRouter } from 'react-router';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';
import Prism from 'prismjs';

import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import InsetPanel from '../../components/widgets/InsetPanel';
import SourceCodeViewer from '../../components/helpers/SourceCodeViewer';
import { AssignmentSolutionNavigation } from '../../components/layout/Navigation';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import SolutionsTable from '../../components/Assignments/SolutionsTable';
import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import Icon, { DownloadIcon, LoadingIcon, SolutionResultsIcon, SwapIcon, WarningIcon } from '../../components/icons';
import AcceptSolutionContainer from '../../containers/AcceptSolutionContainer';
import ReviewSolutionContainer from '../../containers/ReviewSolutionContainer';

import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { fetchAssignmentIfNeeded } from '../../redux/modules/assignments';
import { fetchSolutionIfNeeded, fetchUsersSolutions } from '../../redux/modules/solutions';
import { fetchAssignmentSolutionFilesIfNeeded } from '../../redux/modules/solutionFiles';
import { download } from '../../redux/modules/files';
import { fetchContentIfNeeded } from '../../redux/modules/filesContent';
import { getSolution } from '../../redux/selectors/solutions';
import { getSolutionFiles } from '../../redux/selectors/solutionFiles';
import {
  getAssignment,
  getUserSolutionsSortedData,
  assignmentEnvironmentsSelector,
} from '../../redux/selectors/assignments';
import { getFilesContentSelector } from '../../redux/selectors/files';
import { getLoggedInUserEffectiveRole } from '../../redux/selectors/users';

import withLinks from '../../helpers/withLinks';
import { isSupervisorRole } from '../../components/helpers/usersRoles';
import { hasPermissions } from '../../helpers/common';
import { getPrismModeFromExtension } from '../../components/helpers/syntaxHighlighting';

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

const associateFilesForDiff = defaultMemoize((files, secondFiles) => {
  if (!secondFiles) {
    return files;
  }

  const index = {};
  secondFiles
    .map(preprocessZipEntries)
    .reduce((acc, file) => [...acc, ...(file.zipEntries || [file])], [])
    .forEach(file => {
      index[file.name] = file;
    });

  return files.map(file => (index[file.name] ? { ...file, diffWith: index[file.name] } : file));
});

const fileNameAndEntry = file => [file.parentId || file.id, file.entryName || null];

const fileContentResource = (fileContentsSelector, file) => {
  const res = fileContentsSelector(...fileNameAndEntry(file));
  return file.diffWith ? [res, fileContentsSelector(...fileNameAndEntry(file.diffWith))] : res;
};

const diffViewHighlightSyntax = lang => str =>
  str && (
    <pre
      style={{ display: 'inline' }}
      dangerouslySetInnerHTML={{
        __html: Prism.highlight(str, Prism.languages[lang] || Prism.languages.cpp),
      }}
    />
  );

class SolutionSourceCodes extends Component {
  state = { dialogOpen: false };

  static loadAsync = ({ solutionId, assignmentId, secondSolutionId }, dispatch) =>
    Promise.all([
      dispatch(fetchRuntimeEnvironments()),
      secondSolutionId
        ? dispatch(fetchSolutionIfNeeded(secondSolutionId)).then(res =>
            res.value.assignmentId !== assignmentId
              ? dispatch(fetchAssignmentIfNeeded(res.value.assignmentId))
              : Promise.resolve()
          )
        : Promise.resolve(),
      dispatch(fetchSolutionIfNeeded(solutionId))
        .then(res => res.value)
        .then(solution => Promise.all([dispatch(fetchUsersSolutions(solution.authorId, assignmentId))])),
      dispatch(fetchAssignmentIfNeeded(assignmentId)),
      dispatch(fetchAssignmentSolutionFilesIfNeeded(solutionId))
        .then(res => preprocessFiles(res.value))
        .then(files => Promise.all(files.map(file => dispatch(fetchContentIfNeeded(...fileNameAndEntry(file)))))),
      secondSolutionId && secondSolutionId !== solutionId
        ? dispatch(fetchAssignmentSolutionFilesIfNeeded(secondSolutionId))
            .then(res => preprocessFiles(res.value))
            .then(files => Promise.all(files.map(file => dispatch(fetchContentIfNeeded(...fileNameAndEntry(file))))))
        : Promise.resolve(),
    ]);

  componentDidMount = () => this.props.loadAsync();

  componentDidUpdate(prevProps) {
    if (
      this.props.match.params.solutionId !== prevProps.match.params.solutionId ||
      this.props.match.params.secondSolutionId !== prevProps.match.params.secondSolutionId
    ) {
      this.props.loadAsync();
    }
  }

  openDialog = () => {
    this.setState({ dialogOpen: true });
  };

  closeDialog = () => {
    this.setState({ dialogOpen: false });
  };

  selectDiffSolution = id => {
    const {
      match: {
        params: { assignmentId, solutionId, secondSolutionId },
      },
      history: { replace },
      links: { SOLUTION_SOURCE_CODES_URI_FACTORY, SOLUTION_SOURCE_CODES_DIFF_URI_FACTORY },
    } = this.props;
    this.closeDialog();
    if (id !== secondSolutionId && (id || secondSolutionId))
      replace(
        id
          ? SOLUTION_SOURCE_CODES_DIFF_URI_FACTORY(assignmentId, solutionId, id)
          : SOLUTION_SOURCE_CODES_URI_FACTORY(assignmentId, solutionId)
      );
  };

  swapSolutions = () => {
    const {
      secondSolution,
      match: {
        params: { solutionId, secondSolutionId },
      },
      history: { replace },
      links: { SOLUTION_SOURCE_CODES_DIFF_URI_FACTORY },
    } = this.props;

    const assignmentId = secondSolution && secondSolution.getIn(['data', 'assignmentId']);
    if (secondSolutionId && assignmentId && solutionId !== secondSolutionId) {
      replace(SOLUTION_SOURCE_CODES_DIFF_URI_FACTORY(assignmentId, secondSolutionId, solutionId));
    }
  };

  render() {
    const {
      assignment,
      secondAssignment,
      solution,
      secondSolution,
      files,
      secondFiles,
      fileContentsSelector,
      download,
      userSolutionsSelector,
      effectiveRole,
      runtimeEnvironments,
      match: {
        params: { solutionId, assignmentId, secondSolutionId },
      },
      intl: { locale },
    } = this.props;

    const diffMode =
      secondSolutionId && secondSolutionId !== solutionId && secondSolution && isSupervisorRole(effectiveRole);
    const resources = diffMode ? [solution, assignment, secondSolution, secondAssignment] : [solution, assignment];

    return (
      <Page
        resource={resources}
        icon={<SolutionResultsIcon />}
        title={
          diffMode ? (
            <FormattedMessage
              id="app.solutionSourceCodes.titleDiff"
              defaultMessage="Comparing Source Codes of Two Solutions"
            />
          ) : (
            <FormattedMessage id="app.solutionSourceCodes.title" defaultMessage="Solution Source Code Files Overview" />
          )
        }>
        {(solution, assignment, secondSolution = null, secondAssignment = null) => (
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
              titlePrefix={
                diffMode ? (
                  <span className="text-muted mr-2 small">
                    <FormattedMessage id="app.solutionSourceCodes.left" defaultMessage="Left side" />:
                  </span>
                ) : null
              }
            />
            {diffMode && (
              <>
                <h4 className="text-muted text-center my-2">
                  <FormattedMessage
                    id="app.solutionSourceCodes.isBeingComparedWith"
                    defaultMessage="... is being compared with ..."
                  />

                  <SwapIcon largeGapLeft className="text-primary" timid onClick={this.swapSolutions} />
                </h4>

                <AssignmentSolutionNavigation
                  solutionId={secondSolution.id}
                  assignmentId={secondSolution.assignmentId}
                  exerciseId={secondAssignment.exerciseId}
                  userId={secondSolution.authorId}
                  groupId={secondAssignment.groupId}
                  attemptIndex={secondSolution.attemptIndex}
                  canViewSolutions={hasPermissions(secondAssignment, 'viewAssignmentSolutions')}
                  canViewExercise={
                    hasPermissions(
                      secondAssignment,
                      'viewAssignmentSolutions'
                    ) /* this is not the actual permission, but close enough */
                  }
                  canViewUserProfile={hasPermissions(secondAssignment, 'viewAssignmentSolutions')}
                  titlePrefix={
                    <span className="text-muted mr-2 small">
                      <FormattedMessage id="app.solutionSourceCodes.right" defaultMessage="Right side" />:
                    </span>
                  }
                />
              </>
            )}
            {isSupervisorRole(effectiveRole) && (
              <Row className="justify-content-sm-between">
                <Col sm="auto" className="mb-3">
                  {!diffMode && hasPermissions(solution, 'setFlag') && (
                    <TheButtonGroup>
                      <AcceptSolutionContainer id={solution.id} locale={locale} />
                      <ReviewSolutionContainer id={solution.id} locale={locale} />
                    </TheButtonGroup>
                  )}
                </Col>

                {userSolutionsSelector(solution.authorId, assignmentId).size > 1 && (
                  <Col sm="auto" className="mb-3">
                    <TheButtonGroup>
                      <Button variant="primary" onClick={this.openDialog}>
                        <Icon icon="code-compare" gapRight />
                        {diffMode ? (
                          <FormattedMessage
                            id="app.solutionSourceCodes.diffButtonChange"
                            defaultMessage="Compare with another..."
                          />
                        ) : (
                          <FormattedMessage id="app.solutionSourceCodes.diffButton" defaultMessage="Compare with..." />
                        )}
                      </Button>

                      {diffMode && (
                        <Button variant="danger" onClick={() => this.selectDiffSolution(null)}>
                          <Icon icon={['far', 'circle-stop']} gapRight />
                          <FormattedMessage
                            id="app.solutionSourceCodes.cancelDiffButton"
                            defaultMessage="Compare mode off"
                          />
                        </Button>
                      )}
                    </TheButtonGroup>
                  </Col>
                )}
              </Row>
            )}

            <ResourceRenderer resource={files} bulkyLoading>
              {files => (
                <ResourceRenderer resource={secondFiles || []} bulkyLoading>
                  {(secondFiles = null) =>
                    associateFilesForDiff(preprocessFiles(files), secondFiles).map(file => (
                      <ResourceRenderer
                        key={file.id}
                        resource={fileContentResource(fileContentsSelector, file)}
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
                        {(content, secondContent = null) => (
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
                                    download(...fileNameAndEntry(file));
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
                            ) : secondContent && !secondContent.malformedCharacters ? (
                              <div className="diff-wrapper">
                                <ReactDiffViewer
                                  oldValue={content.content}
                                  newValue={secondContent.content}
                                  splitView={true}
                                  renderContent={diffViewHighlightSyntax(
                                    getPrismModeFromExtension(file.name.split('.').pop())
                                  )}
                                  compareMethod={DiffMethod.WORDS_WITH_SPACE}
                                />
                              </div>
                            ) : (
                              <SourceCodeViewer content={content.content} name={file.name} />
                            )}
                          </Box>
                        )}
                      </ResourceRenderer>
                    ))
                  }
                </ResourceRenderer>
              )}
            </ResourceRenderer>

            <Modal show={this.state.dialogOpen} backdrop="static" onHide={this.closeDialog} size="xl">
              <Modal.Header closeButton>
                <Modal.Title>
                  <FormattedMessage
                    id="app.solutionSourceCodes.diffModal.title"
                    defaultMessage="Compare two solutions and display differences"
                  />
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <InsetPanel>
                  <FormattedMessage
                    id="app.solutionSourceCodes.diffModal.explain"
                    defaultMessage="When second solution is selected for comparison from the table below, the differences of the corresponding files will be displayed in a two-column views. The current solution will be displayed on the left, the second solution on the right."
                  />
                </InsetPanel>
                <ResourceRenderer resource={runtimeEnvironments} returnAsArray>
                  {runtimes => (
                    <SolutionsTable
                      solutions={userSolutionsSelector(solution.authorId, assignmentId)}
                      assignmentId={assignmentId}
                      groupId={assignment.groupId}
                      runtimeEnvironments={runtimes}
                      noteMaxlen={32}
                      selected={solution.id}
                      showActionButtons={false}
                      onSelect={this.selectDiffSolution}
                    />
                  )}
                </ResourceRenderer>
              </Modal.Body>
            </Modal>
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
      secondSolutionId: PropTypes.string,
    }).isRequired,
  }).isRequired,
  assignment: ImmutablePropTypes.map,
  secondAssignment: ImmutablePropTypes.map,
  effectiveRole: PropTypes.string,
  runtimeEnvironments: PropTypes.array,
  children: PropTypes.element,
  solution: ImmutablePropTypes.map,
  secondSolution: ImmutablePropTypes.map,
  files: ImmutablePropTypes.map,
  secondFiles: ImmutablePropTypes.map,
  fileContentsSelector: PropTypes.func.isRequired,
  userSolutionsSelector: PropTypes.func.isRequired,
  loadAsync: PropTypes.func.isRequired,
  download: PropTypes.func.isRequired,
  intl: PropTypes.object,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }),
  links: PropTypes.object,
};

export default withLinks(
  connect(
    (
      state,
      {
        match: {
          params: { solutionId, secondSolutionId, assignmentId },
        },
      }
    ) => {
      const secondSolution =
        secondSolutionId && secondSolutionId !== solutionId ? getSolution(state, secondSolutionId) : null;

      return {
        solution: getSolution(state, solutionId),
        secondSolution,
        files: getSolutionFiles(state, solutionId),
        secondFiles:
          secondSolutionId && secondSolutionId !== solutionId ? getSolutionFiles(state, secondSolutionId) : null,
        fileContentsSelector: getFilesContentSelector(state),
        userSolutionsSelector: getUserSolutionsSortedData(state),
        assignment: getAssignment(state)(assignmentId),
        secondAssignment:
          secondSolution && secondSolution.getIn(['data', 'assignmentId'])
            ? getAssignment(state)(secondSolution.getIn(['data', 'assignmentId']))
            : null,
        effectiveRole: getLoggedInUserEffectiveRole(state),
        runtimeEnvironments: assignmentEnvironmentsSelector(state)(assignmentId),
      };
    },
    (dispatch, { match: { params } }) => ({
      loadAsync: () => SolutionSourceCodes.loadAsync(params, dispatch),
      download: (id, entry = null) => dispatch(download(id, entry)),
    })
  )(injectIntl(withRouter(SolutionSourceCodes)))
);
