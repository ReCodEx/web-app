import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';
import Prism from 'prismjs';

import Box from '../../widgets/Box';
import SourceCodeViewer from '../../helpers/SourceCodeViewer';
import ResourceRenderer from '../../helpers/ResourceRenderer';
import Icon, { CodeCompareIcon, DownloadIcon, LoadingIcon, WarningIcon } from '../../icons';

import { getPrismModeFromExtension } from '../../helpers/syntaxHighlighting';
import { getFileExtensionLC } from '../../../helpers/common';

const diffViewHighlightSyntax = lang => str =>
  str && (
    <pre
      style={{ display: 'inline' }}
      dangerouslySetInnerHTML={{
        __html: Prism.highlight(str, Prism.languages[lang] || Prism.languages.cpp),
      }}
    />
  );

const SourceCodeBox = ({
  id,
  parentId = id,
  name,
  entryName = null,
  download = null,
  diffWith = null,
  diffMode = false,
  fileContentsSelector,
  adjustDiffMapping = null,
  intl: { formatMessage },
}) => {
  const res = fileContentsSelector(parentId, entryName);
  return (
    <ResourceRenderer
      key={id}
      resource={
        diffWith ? [res, fileContentsSelector(diffWith.parentId || diffWith.id, diffWith.entryName || null)] : res
      }
      loading={
        <Box
          key={`${id}-loading`}
          title={
            <>
              <LoadingIcon gapRight />
              <code>{name}</code>
              {diffWith && (
                <>
                  <CodeCompareIcon className="text-muted ml-4 mr-3" />
                  <code>{diffWith.name}</code>
                </>
              )}
            </>
          }
          noPadding
        />
      }>
      {(content, secondContent = null) => (
        <Box
          key={id}
          title={
            <>
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

              <code>{name}</code>

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

              {diffMode && (
                <>
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
                    <CodeCompareIcon
                      className={adjustDiffMapping ? 'text-primary ml-4 mr-3' : 'text-muted ml-4 mr-3'}
                      onClick={
                        adjustDiffMapping ? () => adjustDiffMapping({ id, parentId, name, entryName }, diffWith) : null
                      }
                    />
                  </OverlayTrigger>

                  {secondContent && secondContent.malformedCharacters && (
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

                  {secondContent && secondContent.tooLarge && (
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

                  {diffWith ? (
                    <code>{diffWith.name}</code>
                  ) : (
                    <em className="small text-muted">
                      <FormattedMessage
                        id="app.solutionSourceCodes.noDiffWithFile"
                        defaultMessage="no corresponding file for the comparison found"
                      />
                    </em>
                  )}

                  {diffWith && download && (
                    <DownloadIcon
                      gapLeft
                      timid
                      className="text-primary"
                      onClick={ev => {
                        ev.stopPropagation();
                        download(diffWith.parentId || diffWith.id, diffWith.entryName || null);
                      }}
                    />
                  )}
                </>
              )}
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
                renderContent={diffViewHighlightSyntax(getPrismModeFromExtension(getFileExtensionLC(name)))}
                compareMethod={DiffMethod.WORDS_WITH_SPACE}
              />
            </div>
          ) : (
            <SourceCodeViewer content={content.content} name={name} />
          )}
        </Box>
      )}
    </ResourceRenderer>
  );
};

SourceCodeBox.propTypes = {
  id: PropTypes.string.isRequired,
  parentId: PropTypes.string,
  name: PropTypes.string.isRequired,
  entryName: PropTypes.string,
  download: PropTypes.func,
  fileContentsSelector: PropTypes.func,
  diffWith: PropTypes.object,
  diffMode: PropTypes.bool,
  adjustDiffMapping: PropTypes.func,
  intl: PropTypes.shape({ formatMessage: PropTypes.func.isRequired }).isRequired,
};

export default injectIntl(SourceCodeBox);
