import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col, Modal, Tabs, Tab, Table } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';
import { withRouter } from 'react-router';

import Page from '../../components/layout/Page';
import InsetPanel from '../../components/widgets/InsetPanel';
import { AssignmentSolutionNavigation } from '../../components/layout/Navigation';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import SolutionsTable from '../../components/Assignments/SolutionsTable';
import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import {
  CircleIcon,
  CodeCompareIcon,
  RefreshIcon,
  SolutionResultsIcon,
  StopIcon,
  SwapIcon,
} from '../../components/icons';
import AcceptSolutionContainer from '../../containers/AcceptSolutionContainer';
import ReviewSolutionContainer from '../../containers/ReviewSolutionContainer';
import SourceCodeBox from '../../components/Solutions/SourceCodeBox';
import RecentlyVisited from '../../components/Solutions/RecentlyVisited';
import { registerSolutionVisit } from '../../components/Solutions/RecentlyVisited/functions';

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

import { storageGetItem, storageSetItem, storageRemoveItem } from '../../helpers/localStorage';
import withLinks from '../../helpers/withLinks';
import { isSupervisorRole } from '../../components/helpers/usersRoles';
import {
  arrayToObject,
  hasPermissions,
  getFileExtensionLC,
  isEmptyObject,
  EMPTY_ARRAY,
  EMPTY_OBJ,
} from '../../helpers/common';

const nameComparator = (a, b) => a.name.localeCompare(b.name, 'en');

/**
 * Expand zip entries as regular files with adjusted parameters (name and ID are composed of the zip container and the entry itself).
 */
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

/**
 * Preprocess zip entries, consolidate, and sort by names.
 */
const preprocessFiles = defaultMemoize(files =>
  files
    .sort(nameComparator)
    .map(preprocessZipEntries)
    .reduce((acc, file) => [...acc, ...(file.zipEntries || [file])], [])
);

/**
 * @param {Array} files of the main solution
 * @param {Array|null} secondFiles of the second solution to diffWith
 * @param {Object} mapping explicit mappings as { firstId: secondId }
 * @return {Array} copy of files array where file objects are augmented -- if a file is matched with a second file
 *                 a `diffWith` entry is added into the file object
 */
const associateFilesForDiff = defaultMemoize((files, secondFiles, mapping = EMPTY_OBJ) => {
  if (!secondFiles) {
    return files;
  }

  // create an index {name: file} and extensions index {ext: [ fileNames ]}
  const index = {};
  const indexLC = {};
  const extensionsIndex = {};
  const usedSecondFiles = new Set(Object.values(mapping));
  secondFiles
    .filter(file => !usedSecondFiles.has(file.id))
    .forEach(file => {
      index[file.name] = file;
      const nameLC = file.name.toLowerCase();
      indexLC[nameLC] = indexLC[nameLC] || [];
      indexLC[nameLC].push(file.name);
      const ext = getFileExtensionLC(file.name);
      extensionsIndex[ext] = extensionsIndex[ext] || [];
      extensionsIndex[ext].push(file.name);
    });

  // prepare a helper function that gets and removes file of given name from index
  const getFile = name => {
    const file = index[name] || null;
    if (file) {
      const nameLC = file.name.toLowerCase();
      indexLC[nameLC] = indexLC[nameLC].filter(n => n !== name);
      const ext = getFileExtensionLC(name);
      extensionsIndex[ext] = extensionsIndex[ext].filter(n => n !== name);
      delete index[name];
    }
    return file;
  };

  // four stage association -- 1. explicit mapping by IDs, 2. exact file name match, 3. lower-cased name match, 4. extensions match
  // any ambiguity is treated as non-passable obstacle
  return files
    .map(file => {
      // explicit mapping
      const diffWith = mapping[file.id] && secondFiles.find(f => f.id === mapping[file.id]);
      return diffWith ? { ...file, diffWith } : file;
    })
    .map(file => {
      // exact file name match
      const diffWith = !file.diffWith ? getFile(file.name) : null;
      return diffWith ? { ...file, diffWith } : file;
    })
    .map(file => {
      // lowercased file name match
      if (!file.diffWith) {
        const nameLC = file.name.toLowerCase();
        if (indexLC[nameLC] && indexLC[nameLC].length === 1) {
          const diffWith = getFile(indexLC[nameLC].pop());
          return { ...file, diffWith };
        }
      }
      return file;
    })
    .map(file => {
      // file extension match
      if (!file.diffWith) {
        const ext = getFileExtensionLC(file.name);
        if (extensionsIndex[ext] && extensionsIndex[ext].length === 1) {
          const diffWith = getFile(extensionsIndex[ext].pop());
          return { ...file, diffWith };
        }
      }
      return file;
    });
});

/**
 * Helper that computes reverted mapping { secondId: firstId } from the result of associateFilesForDiff.
 */
const getRevertedMapping = defaultMemoize(files =>
  arrayToObject(
    files.filter(({ diffWith }) => Boolean(diffWith)),
    ({ diffWith }) => diffWith.id
  )
);

const fileNameAndEntry = file => [file.parentId || file.id, file.entryName || null];

const wrapInArray = defaultMemoize(entry => [entry]);

const localStorageDiffMappingsKey = 'SolutionSourceCodes.diffMappings.';

class SolutionSourceCodes extends Component {
  state = { diffDialogOpen: false, mappingDialogOpenFile: null, mappingDialogDiffWith: null, diffMappings: {} };

  static loadAsync = ({ solutionId, assignmentId, secondSolutionId }, dispatch) =>
    Promise.all([
      dispatch(fetchRuntimeEnvironments()),
      secondSolutionId
        ? dispatch(fetchSolutionIfNeeded(secondSolutionId)).then(res => {
            registerSolutionVisit(res.value);
            return res.value.assignmentId !== assignmentId
              ? dispatch(fetchAssignmentIfNeeded(res.value.assignmentId))
              : Promise.resolve();
          })
        : Promise.resolve(),
      dispatch(fetchSolutionIfNeeded(solutionId))
        .then(res => res.value)
        .then(solution => {
          registerSolutionVisit(solution);
          return Promise.all([dispatch(fetchUsersSolutions(solution.authorId, assignmentId))]);
        }),
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

  getDiffMappingsLocalStorageKey = () => {
    const {
      match: {
        params: { solutionId, secondSolutionId },
      },
    } = this.props;

    return secondSolutionId ? `${localStorageDiffMappingsKey}${solutionId}/${secondSolutionId}` : null;
  };

  componentDidMount = () => {
    this.props.loadAsync();

    const lsKey = this.getDiffMappingsLocalStorageKey();
    if (lsKey) {
      this.setState({
        diffMappings: storageGetItem(lsKey, {}),
      });
    }
  };

  componentDidUpdate(prevProps) {
    if (
      this.props.match.params.solutionId !== prevProps.match.params.solutionId ||
      this.props.match.params.secondSolutionId !== prevProps.match.params.secondSolutionId
    ) {
      this.props.loadAsync();

      const lsKey = this.getDiffMappingsLocalStorageKey();
      if (lsKey) {
        this.setState({
          diffMappings: storageGetItem(lsKey, {}),
        });
      }
    }
  }

  openDiffDialog = () => {
    this.setState({ diffDialogOpen: true });
  };

  openMappingDialog = (mappingDialogOpenFile, mappingDialogDiffWith) => {
    this.setState({ mappingDialogOpenFile, mappingDialogDiffWith });
  };

  closeDialogs = () => {
    this.setState({ diffDialogOpen: false, mappingDialogOpenFile: null, mappingDialogDiffWith: null });
  };

  selectDiffSolution = id => {
    const {
      match: {
        params: { assignmentId, solutionId, secondSolutionId },
      },
      history: { replace },
      links: { SOLUTION_SOURCE_CODES_URI_FACTORY, SOLUTION_SOURCE_CODES_DIFF_URI_FACTORY },
    } = this.props;
    this.closeDialogs();
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

  adjustDiffMapping = (firstId, secondId = null) => {
    this.closeDialogs();
    const diffMappings = Object.fromEntries(
      Object.entries(this.state.diffMappings).filter(([key, value]) => key !== firstId && value !== secondId)
    );
    if (secondId) {
      diffMappings[firstId] = secondId;
    }
    this.setState({ diffMappings });
    const lsKey = this.getDiffMappingsLocalStorageKey();
    if (lsKey) {
      storageSetItem(lsKey, diffMappings);
    }
  };

  resetDiffMappings = () => {
    this.closeDialogs();
    this.setState({ diffMappings: {} });
    const lsKey = this.getDiffMappingsLocalStorageKey();
    if (lsKey) {
      storageRemoveItem(lsKey);
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

                <Col sm="auto" className="mb-3">
                  <TheButtonGroup>
                    <Button variant="primary" onClick={this.openDiffDialog}>
                      <CodeCompareIcon gapRight />
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
                        <StopIcon gapRight />
                        <FormattedMessage
                          id="app.solutionSourceCodes.cancelDiffButton"
                          defaultMessage="Compare mode off"
                        />
                      </Button>
                    )}
                  </TheButtonGroup>
                </Col>
              </Row>
            )}

            <ResourceRenderer resource={files} bulkyLoading>
              {filesRaw => (
                <ResourceRenderer resource={secondFiles || []} bulkyLoading>
                  {(secondFilesRaw = null) => {
                    const secondFiles = secondFilesRaw && preprocessFiles(secondFilesRaw);
                    const files = associateFilesForDiff(
                      preprocessFiles(filesRaw),
                      secondFiles,
                      this.state.diffMappings
                    );
                    const revertedIndex = files && secondFiles && getRevertedMapping(files);
                    return (
                      <>
                        {files.map(file => (
                          <SourceCodeBox
                            key={file.id}
                            {...file}
                            download={download}
                            fileContentsSelector={fileContentsSelector}
                            diffMode={diffMode}
                            adjustDiffMapping={this.openMappingDialog}
                          />
                        ))}

                        {diffMode && secondFiles && (
                          <Modal
                            show={this.state.mappingDialogOpenFile !== null}
                            backdrop="static"
                            onHide={this.closeDialogs}
                            size="xl">
                            <Modal.Header closeButton>
                              <Modal.Title>
                                <FormattedMessage
                                  id="app.solutionSourceCodes.mappingModal.title"
                                  defaultMessage="Adjust mapping of compared files"
                                />
                              </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                              <h5 className="mb-3">
                                <code className="mr-2">
                                  {this.state.mappingDialogOpenFile && this.state.mappingDialogOpenFile.name}
                                </code>{' '}
                                <FormattedMessage
                                  id="app.solutionSourceCodes.mappingModal.fileIsAssociatedWith"
                                  defaultMessage="file (on the left) is associated with..."
                                />
                              </h5>

                              <InsetPanel>
                                {this.state.mappingDialogOpenFile && (
                                  <FormattedMessage
                                    id="app.solutionSourceCodes.mappingModal.explain"
                                    defaultMessage="Select a file from second solution that will be compared with ''<code>{name}</code>'' file from the first solution. Note that changing a mapping between two files may affect how other files are mapped."
                                    values={{
                                      name: this.state.mappingDialogOpenFile.name,
                                      code: content => <code>{content}</code>,
                                    }}
                                  />
                                )}
                              </InsetPanel>

                              <Table hover>
                                <tbody>
                                  {secondFiles.map(file => {
                                    const selected =
                                      this.state.mappingDialogDiffWith &&
                                      file.id === this.state.mappingDialogDiffWith.id;
                                    return (
                                      <tr
                                        key={file.id}
                                        className={selected ? 'table-primary' : ''}
                                        onClick={
                                          selected
                                            ? null
                                            : () => this.adjustDiffMapping(this.state.mappingDialogOpenFile.id, file.id)
                                        }>
                                        <td className="shrink-col">
                                          <CircleIcon selected={selected} />
                                        </td>
                                        <td>{file.name}</td>
                                        <td className="shrink-col text-muted text-nowrap small">
                                          {revertedIndex && revertedIndex[file.id] && (
                                            <>
                                              <CodeCompareIcon gapRight />
                                              {revertedIndex[file.id].name}
                                            </>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </Table>

                              {this.state.diffMappings && !isEmptyObject(this.state.diffMappings) && (
                                <div className="text-center">
                                  <Button variant="danger" onClick={this.resetDiffMappings}>
                                    <RefreshIcon gapRight />
                                    <FormattedMessage
                                      id="app.solutionSourceCodes.mappingModal.resetButton"
                                      defaultMessage="Reset mapping"
                                    />
                                  </Button>
                                </div>
                              )}
                            </Modal.Body>
                          </Modal>
                        )}
                      </>
                    );
                  }}
                </ResourceRenderer>
              )}
            </ResourceRenderer>

            <Modal show={this.state.diffDialogOpen} backdrop="static" onHide={this.closeDialogs} size="xl">
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
                <Tabs defaultActiveKey="user-solutions" id="solution-sources-modal-tabs">
                  <Tab
                    eventKey="user-solutions"
                    title={
                      <FormattedMessage
                        id="app.solutionSourceCodes.diffModal.tabUserSolutions"
                        defaultMessage="User solutions"
                      />
                    }>
                    <ResourceRenderer resource={runtimeEnvironments} returnAsArray>
                      {runtimes => (
                        <SolutionsTable
                          solutions={userSolutionsSelector(solution.authorId, assignmentId)}
                          assignmentId={assignmentId}
                          groupId={assignment.groupId}
                          runtimeEnvironments={runtimes}
                          noteMaxlen={32}
                          selected={solution.id}
                          highlights={secondSolutionId ? wrapInArray(secondSolutionId) : EMPTY_ARRAY}
                          showActionButtons={false}
                          onSelect={this.selectDiffSolution}
                        />
                      )}
                    </ResourceRenderer>
                  </Tab>
                  <Tab
                    eventKey="recently-visited"
                    title={
                      <FormattedMessage
                        id="app.solutionSourceCodes.diffModal.tabRecentSolutions"
                        defaultMessage="Recently visited"
                      />
                    }>
                    <RecentlyVisited
                      selectedId={solutionId}
                      secondSelectedId={secondSolutionId}
                      onSelect={this.selectDiffSolution}
                    />
                  </Tab>
                </Tabs>
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
