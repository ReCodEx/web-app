import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import GroupsNameContainer from '../../../containers/GroupsNameContainer';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import Box from '../../widgets/Box';
import Callout from '../../widgets/Callout';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import DateTime from '../../widgets/DateTime';
import Icon, {
  CodeCompareIcon,
  DownloadIcon,
  GroupIcon,
  LoadingIcon,
  SolutionResultsIcon,
  WarningIcon,
} from '../../icons';
import ResourceRenderer from '../../helpers/ResourceRenderer';
import CodeFragmentSelector from '../../helpers/CodeFragmentSelector';
import cfsStyles from '../../helpers/CodeFragmentSelector/CodeFragmentSelector.less';
import withLinks from '../../../helpers/withLinks';

import styles from './PlagiarismCodeBox.less';

const linesCount = content => (content.match(/\n/g) || '').length + 1;

const mergeRemainingFragments = (fragments, remainingFragments) => {
  remainingFragments &&
    Object.keys(remainingFragments).forEach(fileIdx => {
      remainingFragments[fileIdx].forEach(f => {
        fragments.push({ ...f, doubleClickData: fileIdx });
      });
    });
};

class PlagiarismCodeBox extends Component {
  // Generate content for <pre> element that holds line numbers (based on size of the two compared contents).
  content1Ref = null;
  content2Ref = null;
  generatedLineNumbersCache = null;

  generateLineNumbers = (content1, content2) => {
    if (this.content1Ref !== content1 || this.content2Ref !== content2) {
      const count = Math.max(linesCount(content1), linesCount(content2));
      this.generatedLineNumbersCache = [...Array(count).keys()] // [0, ..., count-1]
        .map(key => (key + 1).toString().padStart(5, ' '))
        .join('\n');
      this.content1Ref = content1;
      this.content2Ref = content2;
    }
    return this.generatedLineNumbersCache;
  };

  // Get fragments from the plagiarism record and split them to 2 lists (left half and right half)
  fragmentsRef = null;
  remainingFragmentsRef = null;
  splitFragmentsCache = null;

  preprocessFragments = (fragments, remainingFragments) => {
    if (this.fragmentsRef !== fragments || this.remainingFragmentsRef !== remainingFragments) {
      this.splitFragmentsCache = [[], []];
      fragments.forEach(([f0, f1], idx) => {
        this.splitFragmentsCache[0].push({ ...f0, clickData: idx });
        this.splitFragmentsCache[1].push({ ...f1, clickData: idx });
      });
      mergeRemainingFragments(this.splitFragmentsCache[0], remainingFragments);
      this.fragmentsRef = fragments;
      this.remainingFragmentsRef = remainingFragments;
    }
    return this.splitFragmentsCache;
  };

  /*
   * State and state-related functions.
   */

  state = {
    selectedFragment: null,
    fullWidth: false,
  };

  componentDidUpdate(prevProps) {
    if (prevProps.selectedPlagiarismFile !== this.props.selectedPlagiarismFile) {
      this.setState({ selectedFragment: null });
    }
  }

  fragmentClickHandler = data => {
    const selectedFragment =
      this.state.selectedFragment !== null
        ? data[data.indexOf(this.state.selectedFragment) + 1] || null
        : data.length > 0
        ? data[0]
        : null;

    this.setState({ selectedFragment });
  };

  fragmentDoubleClickHandler = data => {
    this.props.openSelectFileDialog(null, data);
  };

  _selectRelFragment = (ev, rel) => {
    const count = this.props.selectedPlagiarismFile.fragments.length;
    if (count > 0) {
      const next = this.state.selectedFragment !== null ? this.state.selectedFragment + rel : 0;
      this.fragmentClickHandler(next >= 0 && next < count ? [next] : []);
    }

    if (window) {
      window.setTimeout(() => {
        const span = window.document.querySelector('span.' + cfsStyles.selected);
        if (span) {
          window.scroll({
            top: Math.max(0, span.getBoundingClientRect().top + document.documentElement.scrollTop - 64), // 64 is a hack (to avoid srolling under top panel)
            behavior: 'smooth',
          });
        }
      }, 100);
    }
  };

  selectPrevFragment = ev => this._selectRelFragment(ev, -1);

  selectNextFragment = ev => this._selectRelFragment(ev, 1);

  keyDownHandler = ev => {
    if (ev.code === 'ArrowLeft') {
      this.selectPrevFragment(ev);
    } else if (ev.code === 'ArrowRight') {
      this.selectNextFragment(ev);
    }
  };

  toggleFullWidth = ev => {
    this.setState({ fullWidth: !this.state.fullWidth });
    ev.stopPropagation();
  };

  render() {
    const {
      id,
      parentId = id,
      solutionId,
      name,
      entryName = null,
      download = null,
      fileContentsSelector,
      selectedPlagiarismFile,
      remainingFragments,
      similarity = null,
      openSelectFileDialog = null,
      authorId = null,
      sourceAuthorId = null,
      sourceFilesCount,
      links: { SOLUTION_DETAIL_URI_FACTORY, GROUP_STUDENTS_URI_FACTORY },
    } = this.props;

    return (
      <ResourceRenderer
        key={id}
        resource={[
          fileContentsSelector(parentId, entryName),
          fileContentsSelector(selectedPlagiarismFile.solutionFile.id, selectedPlagiarismFile.fileEntry),
        ]}
        loading={
          <Box
            key={`${id}-loading`}
            title={
              <>
                <LoadingIcon gapRight />
                <code>{name}</code>
              </>
            }
            noPadding
          />
        }>
        {(content, secondContent) => (
          <div onKeyDown={this.keyDownHandler}>
            <nav className={styles.fragmentSelectButtons}>
              <TheButtonGroup>
                <Button size="xs" variant="primary" onClick={this.selectPrevFragment}>
                  <Icon icon="angles-left" />
                </Button>
                <Button size="xs" variant="primary" onClick={this.selectNextFragment}>
                  <Icon icon="angles-right" />
                </Button>
              </TheButtonGroup>
            </nav>

            <Box
              key={id}
              flexTitle
              title={
                <>
                  <div>
                    {similarity && (
                      <Badge variant={similarity > 0.8 ? 'danger' : 'warning'} className="mr-3">
                        {<FormattedNumber value={similarity * 100} maximumFractionDigits={1} />} %
                      </Badge>
                    )}
                    {content.malformedCharacters && (
                      <OverlayTrigger
                        placement="bottom"
                        overlay={
                          <Tooltip id={`${id}-malformed`}>
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
                          <Tooltip id={`${id}-tooLarge`}>
                            <FormattedMessage
                              id="app.solutionSourceCodes.tooLargeTooltip"
                              defaultMessage="The file is too large for code preview and it was cropped."
                            />
                          </Tooltip>
                        }>
                        <Icon icon="scissors" className="text-warning" gapRight />
                      </OverlayTrigger>
                    )}

                    <code className="text-bold">{name}</code>

                    {download && (
                      <DownloadIcon
                        gapLeft
                        timid
                        className="text-primary"
                        onClick={ev => {
                          ev.stopPropagation();
                          download(parentId, entryName);
                        }}
                      />
                    )}

                    {authorId && (
                      <small className="ml-2 text-muted">
                        (<UsersNameContainer userId={authorId} isSimple noAutoload />)
                      </small>
                    )}
                  </div>

                  <div>
                    {openSelectFileDialog ? (
                      <OverlayTrigger
                        placement="bottom"
                        overlay={
                          <Tooltip id={`${id}-mappingExplain`}>
                            <FormattedMessage
                              id="app.solutionSourceCodes.adjustMappingTooltip"
                              defaultMessage="Adjust file mappings by selecting which file from the second solution will be compared to this file."
                            />
                          </Tooltip>
                        }>
                        <span onClick={openSelectFileDialog} className="clickable">
                          <CodeCompareIcon className="text-primary" gapRight />
                          {sourceFilesCount > 1 && (
                            <small className="text-muted">
                              (
                              <FormattedMessage
                                id="app.solutionSourceCodes.adjustMappingFiles"
                                defaultMessage="{count} source files available"
                                values={{ count: sourceFilesCount }}
                              />
                              )
                            </small>
                          )}
                        </span>
                      </OverlayTrigger>
                    ) : (
                      <CodeCompareIcon className="text-muted ml-4 mr-3" />
                    )}
                  </div>

                  <div>
                    {secondContent.malformedCharacters && (
                      <OverlayTrigger
                        placement="bottom"
                        overlay={
                          <Tooltip id={`${id}-malformed2`}>
                            <FormattedMessage
                              id="app.solutionSourceCodes.malformedTooltip"
                              defaultMessage="The file is not a valid UTF-8 text file so it cannot be properly displayed as a source code."
                            />
                          </Tooltip>
                        }>
                        <WarningIcon className="text-danger" gapRight />
                      </OverlayTrigger>
                    )}

                    {secondContent.tooLarge && (
                      <OverlayTrigger
                        placement="bottom"
                        overlay={
                          <Tooltip id={`${id}-tooLarge2`}>
                            <FormattedMessage
                              id="app.solutionSourceCodes.tooLargeTooltip"
                              defaultMessage="The file is too large for code preview and it was cropped."
                            />
                          </Tooltip>
                        }>
                        <Icon icon="scissors" className="text-warning" gapRight />
                      </OverlayTrigger>
                    )}

                    <code className="text-bold">
                      {selectedPlagiarismFile.solutionFile.name}
                      {selectedPlagiarismFile.fileEntry ? `/${selectedPlagiarismFile.fileEntry}` : ''}
                    </code>

                    {download && (
                      <DownloadIcon
                        gapLeft
                        timid
                        className="text-primary"
                        onClick={ev => {
                          ev.stopPropagation();
                          download(
                            selectedPlagiarismFile.solutionFile.id,
                            selectedPlagiarismFile.fileEntry || null,
                            selectedPlagiarismFile.solutionFile.name,
                            solutionId
                          );
                        }}
                      />
                    )}

                    {sourceAuthorId && (
                      <small className="ml-2 text-muted">
                        (#{selectedPlagiarismFile.solution.attemptIndex},
                        <UsersNameContainer userId={sourceAuthorId} isSimple noAutoload />)
                      </small>
                    )}

                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id={`${id}-solutionIcon`}>
                          #{selectedPlagiarismFile.solution.attemptIndex} (
                          <DateTime unixts={selectedPlagiarismFile.solution.createdAt} />)
                        </Tooltip>
                      }>
                      {selectedPlagiarismFile.solution.canViewDetail ? (
                        <Link
                          to={SOLUTION_DETAIL_URI_FACTORY(
                            selectedPlagiarismFile.assignment.id,
                            selectedPlagiarismFile.solution.id
                          )}>
                          <SolutionResultsIcon gapLeft className="text-primary" timid />
                        </Link>
                      ) : (
                        <SolutionResultsIcon gapLeft className="text-muted" timid />
                      )}
                    </OverlayTrigger>

                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id={`${id}-groupIcon`}>
                          <GroupsNameContainer groupId={selectedPlagiarismFile.groupId} fullName admins />
                        </Tooltip>
                      }>
                      {selectedPlagiarismFile.assignment.canViewDetail ? (
                        <Link to={GROUP_STUDENTS_URI_FACTORY(selectedPlagiarismFile.groupId)}>
                          <GroupIcon gapLeft className="text-primary" timid />
                        </Link>
                      ) : (
                        <GroupIcon gapLeft className="text-muted" timid />
                      )}
                    </OverlayTrigger>

                    <span className="ml-4">
                      <OverlayTrigger
                        placement="left"
                        overlay={
                          <Tooltip id={`${id}-fullWidthIcon`}>
                            {this.state.fullWidth ? (
                              <FormattedMessage
                                id="app.solutionSourceCodes.restrictWidthTooltip"
                                defaultMessage="Restrict the width of each column to the half of the screen."
                              />
                            ) : (
                              <FormattedMessage
                                id="app.solutionSourceCodes.fullWidthTooltip"
                                defaultMessage="Enable full width of each column even if the box exceeds the screen width."
                              />
                            )}
                          </Tooltip>
                        }>
                        {this.state.fullWidth ? (
                          <Icon icon="arrows-left-right-to-line" timid onClick={this.toggleFullWidth} />
                        ) : (
                          <Icon icon="arrows-left-right" timid onClick={this.toggleFullWidth} />
                        )}
                      </OverlayTrigger>
                    </span>
                  </div>
                </>
              }
              noPadding
              unlimitedHeight
              isOpen={!content.malformedCharacters && !secondContent.malformedCharacters}>
              {!content.malformedCharacters && !secondContent.malformedCharacters ? (
                <div className={styles.container}>
                  <div className={styles.lines}>
                    <pre>{this.generateLineNumbers(content.content, secondContent.content)}</pre>
                  </div>
                  <div className={this.state.fullWidth ? styles.fullWidth : ''}>
                    <CodeFragmentSelector
                      content={content.content}
                      fragments={this.preprocessFragments(selectedPlagiarismFile.fragments, remainingFragments)[0]}
                      selected={this.state.selectedFragment}
                      clickHandler={this.fragmentClickHandler}
                      doubleClickHandler={this.fragmentDoubleClickHandler}
                    />
                  </div>
                  <div className={this.state.fullWidth ? styles.fullWidth : ''}>
                    <CodeFragmentSelector
                      content={secondContent.content}
                      fragments={this.preprocessFragments(selectedPlagiarismFile.fragments, remainingFragments)[1]}
                      selected={this.state.selectedFragment}
                      clickHandler={this.fragmentClickHandler}
                      doubleClickHandler={this.fragmentDoubleClickHandler}
                    />
                  </div>
                </div>
              ) : (
                <Callout variant="danger">
                  <FormattedMessage
                    id="app.solutionPlagiarisms.unableCompareMalformed"
                    defaultMessage="Malformed files cannot be visualized in comparison mode."
                  />
                </Callout>
              )}
            </Box>
          </div>
        )}
      </ResourceRenderer>
    );
  }
}

PlagiarismCodeBox.propTypes = {
  id: PropTypes.string.isRequired,
  parentId: PropTypes.string,
  solutionId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  entryName: PropTypes.string,
  download: PropTypes.func,
  fileContentsSelector: PropTypes.func,
  selectedPlagiarismFile: PropTypes.object.isRequired,
  similarity: PropTypes.number,
  remainingFragments: PropTypes.object,
  authorId: PropTypes.string,
  sourceAuthorId: PropTypes.string,
  selectPlagiarismFile: PropTypes.func,
  openSelectFileDialog: PropTypes.func,
  sourceFilesCount: PropTypes.number.isRequired,
  links: PropTypes.object,
};

export default withLinks(PlagiarismCodeBox);
