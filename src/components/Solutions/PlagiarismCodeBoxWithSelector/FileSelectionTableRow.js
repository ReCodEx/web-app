import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import DateTime from '../../widgets/DateTime';
import GroupsNameContainer from '../../../containers/GroupsNameContainer';
import { CodeFileIcon } from '../../icons';

const FileSelectionTableRow = ({ file, idx, selected = false, selectFile }) => (
  <tr
    className={selected ? 'table-primary' : 'clickable'}
    onClick={!selected && selectFile ? () => selectFile(idx) : null}>
    <td className="text-nowrap shrink-col">
      <CodeFileIcon className="text-muted" gapLeft gapRight />
    </td>
    <td>
      <code>
        {file.solutionFile.name}
        {file.fileEntry ? `/${file.fileEntry}` : ''}
      </code>
    </td>
    <td>
      {file.fragments && (
        <FormattedMessage
          id="app.solutionPlagiarisms.selectPlagiarismFileModal.fragments"
          defaultMessage="({fragments} {fragments, plural, one {fragment} other {fragments}})"
          values={{ fragments: file.fragments.length }}
        />
      )}
    </td>
    <td>
      <FormattedMessage id="app.solutionPlagiarisms.selectPlagiarismFileModal.fromSolution" defaultMessage="solution" />{' '}
      <strong>#{file.solution.attemptIndex}</strong>
    </td>
    <td>
      (<DateTime unixts={file.solution.createdAt} />)
    </td>
    <td className="small">
      <GroupsNameContainer groupId={file.groupId} admins />
    </td>
  </tr>
);

FileSelectionTableRow.propTypes = {
  file: PropTypes.object.isRequired,
  idx: PropTypes.number.isRequired,
  selected: PropTypes.bool,
  selectFile: PropTypes.func,
};

export default FileSelectionTableRow;
