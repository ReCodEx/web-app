import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Modal, Table, OverlayTrigger, Tooltip } from 'react-bootstrap';

import Callout from '../../widgets/Callout';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Markdown from '../../widgets/Markdown';
import Icon, { DeleteIcon } from '../../icons';

import InsetPanel from '../../widgets/InsetPanel/InsetPanel.js';

const ReviewCommentSnippetDialog = ({
  text,
  fileName = null,
  lineNumber = null,
  useSnippet,
  setSnippet,
  ...snippets
}) => (
  <Modal.Body>
    <strong>
      <FormattedMessage id="app.reviewCommentSnippetDialog.commentText" defaultMessage="Selected comment text" /> [
      {fileName ? (
        <code>{fileName + (lineNumber && `:${lineNumber}`)}</code>
      ) : (
        <FormattedMessage id="app.solutionSourceCodes.reviewSummary.title" defaultMessage="Review summary" />
      )}
      ]
    </strong>
    {text ? (
      <InsetPanel size="sm">
        <Markdown source={text} />
      </InsetPanel>
    ) : (
      <p className="text-muted fst-italic small">
        <FormattedMessage id="app.reviewCommentSnippetDialog.commentEmpty" defaultMessage="no comment yet" />
      </p>
    )}

    <Table hover className="border">
      <tbody>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(i => (
          <tr key={i} className={text && text === snippets[`snippet${i}`] ? 'table-success' : ''}>
            <th className={!snippets[`snippet${i}`] && 'text-muted opacity-50'}>#{i}</th>
            <td className="w-100 small align-middle">
              {snippets[`snippet${i}`] ? (
                <Markdown source={snippets[`snippet${i}`]} />
              ) : (
                <i className="text-muted opacity-25">
                  <FormattedMessage id="generic.empty" defaultMessage="empty" />
                </i>
              )}
            </td>
            <td className="text-nowrap text-end">
              <TheButtonGroup>
                <OverlayTrigger
                  placement="bottom"
                  overlay={
                    <Tooltip id="useButton">
                      <FormattedMessage
                        id="app.reviewCommentSnippetDialog.useButtonTooltip"
                        defaultMessage="Replace the selected comment with this snippet."
                      />
                    </Tooltip>
                  }>
                  <Button
                    size="xs"
                    variant="success"
                    onClick={() => useSnippet(i)}
                    disabled={!snippets[`snippet${i}`] || snippets[`snippet${i}`] === text}>
                    <Icon icon="pen-to-square" gapLeft={1} gapRight={1} />
                  </Button>
                </OverlayTrigger>

                <OverlayTrigger
                  placement="bottom"
                  overlay={
                    <Tooltip id="setButton">
                      <FormattedMessage
                        id="app.reviewCommentSnippetDialog.setButtonTooltip"
                        defaultMessage="Replace this snippet with the selected comment."
                      />
                    </Tooltip>
                  }>
                  <Button
                    size="xs"
                    variant="primary"
                    onClick={() => setSnippet(i, text)}
                    disabled={!text || snippets[`snippet${i}`] === text}>
                    <Icon icon="upload" gapLeft={1} gapRight={1} />
                  </Button>
                </OverlayTrigger>

                <OverlayTrigger
                  placement="bottom"
                  overlay={
                    <Tooltip id="useButton">
                      <FormattedMessage
                        id="app.reviewCommentSnippetDialog.removeButtonTooltip"
                        defaultMessage="Clear this snippet."
                      />
                    </Tooltip>
                  }>
                  <Button
                    size="xs"
                    variant="danger"
                    onClick={() => setSnippet(i, null)}
                    disabled={!snippets[`snippet${i}`]}>
                    <DeleteIcon gapLeft={1} gapRight={1} />
                  </Button>
                </OverlayTrigger>
              </TheButtonGroup>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>

    <Callout variant="info">
      <FormattedMessage
        id="app.reviewCommentSnippetDialog.help"
        defaultMessage="The snippets above can be inserted into the comments. When editing, <code>Ctrl+[num]</code> inserts snippet from slot #num (where num is 0-9). <code>Ctrl+Alt+[num]</code> replaces the snippet #num with the currently selected text of the comment (or with the whole comment, if no part is selected)."
        values={{
          code: contents => (
            <code>
              <b>
                {Array.isArray(contents)
                  ? contents.map((c, i) => <React.Fragment key={i}>{c}</React.Fragment>)
                  : contents}
              </b>
            </code>
          ),
        }}
      />
    </Callout>
  </Modal.Body>
);

ReviewCommentSnippetDialog.propTypes = {
  dialogOpen: PropTypes.isRequired,
  snippet0: PropTypes.string,
  snippet1: PropTypes.string,
  snippet2: PropTypes.string,
  snippet3: PropTypes.string,
  snippet4: PropTypes.string,
  snippet5: PropTypes.string,
  snippet6: PropTypes.string,
  snippet7: PropTypes.string,
  snippet8: PropTypes.string,
  snippet9: PropTypes.string,
  text: PropTypes.string,
  fileName: PropTypes.string,
  lineNumber: PropTypes.number,
  closeDialog: PropTypes.func.isRequired,
  useSnippet: PropTypes.func.isRequired,
  setSnippet: PropTypes.func.isRequired,
};

export default ReviewCommentSnippetDialog;
