import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import { downloadSolutionArchive } from '../../redux/modules/submissionEvaluations';
import { downloadSolutionArchive as downloadRefSolutionArchive } from '../../redux/modules/referenceSolutionEvaluations';
import { getUser } from '../../redux/selectors/users';
import SolutionArchiveInfoBox from '../../components/Solutions/SolutionArchiveInfoBox';
import Button from '../../components/widgets/TheButton';
import Icon from '../../components/icons';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { toPlainAscii } from '../../helpers/common';

const solutionArchiveFileName = (solutionId, user) => {
  const name = toPlainAscii(`${user.name.lastName}-${user.name.firstName}`);
  return `${name}_${solutionId}.zip`;
};

const DownloadSolutionArchiveContainer = ({
  solutionId,
  downloadSolutionArchive,
  downloadRefSolutionArchive,
  isReference = false,
  simpleButton = false,
  variant = 'primary',
  size = null,
  submittedByUser,
}) => (
  <ResourceRenderer resource={submittedByUser}>
    {user =>
      simpleButton ? (
        <Button
          onClick={isReference ? downloadRefSolutionArchive(user) : downloadSolutionArchive(user)}
          variant={variant}
          size={size}>
          <Icon icon={['far', 'file-archive']} gapRight />
          <FormattedMessage id="app.solutionArchiveInfoBox.description" defaultMessage="All files in a ZIP archive" />
        </Button>
      ) : (
        <a href="#" onClick={isReference ? downloadRefSolutionArchive(user) : downloadSolutionArchive(user)}>
          <SolutionArchiveInfoBox id={solutionId} />
        </a>
      )
    }
  </ResourceRenderer>
);

DownloadSolutionArchiveContainer.propTypes = {
  solutionId: PropTypes.string.isRequired,
  submittedBy: PropTypes.string.isRequired,
  isReference: PropTypes.bool,
  simpleButton: PropTypes.bool,
  variant: PropTypes.string,
  size: PropTypes.string,
  submittedByUser: ImmutablePropTypes.map,
  downloadSolutionArchive: PropTypes.func.isRequired,
  downloadRefSolutionArchive: PropTypes.func.isRequired,
};

export default connect(
  (state, { submittedBy }) => ({
    submittedByUser: getUser(submittedBy)(state),
  }),
  (dispatch, { solutionId }) => ({
    downloadSolutionArchive: user => e => {
      e.preventDefault();
      dispatch(downloadSolutionArchive(solutionId, solutionArchiveFileName(solutionId, user)));
    },
    downloadRefSolutionArchive: user => e => {
      e.preventDefault();
      dispatch(downloadRefSolutionArchive(solutionId, solutionArchiveFileName(solutionId, user)));
    },
  })
)(DownloadSolutionArchiveContainer);
