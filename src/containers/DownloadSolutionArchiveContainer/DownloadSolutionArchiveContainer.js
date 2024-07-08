import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import { downloadSolutionArchive } from '../../redux/modules/submissionEvaluations.js';
import { downloadSolutionArchive as downloadRefSolutionArchive } from '../../redux/modules/referenceSolutionEvaluations.js';
import { getUser } from '../../redux/selectors/users.js';
import Button from '../../components/widgets/TheButton';
import Icon from '../../components/icons';
import OptionalTooltipWrapper from '../../components/widgets/OptionalTooltipWrapper';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { toPlainAscii } from '../../helpers/common.js';

const solutionArchiveFileName = (solutionId, user, index = null) => {
  const components = [user.name.lastName, user.name.firstName];
  if (index) {
    components.push(String(index).padStart(3, '0'));
  }
  components.push(solutionId);
  const name = toPlainAscii(components.join('_').replaceAll(' ', '-'));
  return `${name}.zip`;
};

const DownloadSolutionArchiveContainer = ({
  downloadSolutionArchive,
  downloadRefSolutionArchive,
  isReference = false,
  iconOnly = false,
  variant = 'primary',
  size = null,
  authorUser,
}) => (
  <ResourceRenderer resource={authorUser}>
    {user => (
      <OptionalTooltipWrapper
        tooltip={
          <FormattedMessage id="app.solutionArchiveInfoBox.description" defaultMessage="All files in a ZIP archive" />
        }
        hide={!iconOnly}
        tooltipId="solution-archive">
        <Button
          onClick={isReference ? downloadRefSolutionArchive(user) : downloadSolutionArchive(user)}
          variant={variant}
          size={size}>
          <Icon icon={['far', 'file-archive']} gapRight={!iconOnly} fixedWidth={iconOnly} />
          {!iconOnly && (
            <FormattedMessage id="app.solutionArchiveInfoBox.description" defaultMessage="All files in a ZIP archive" />
          )}
        </Button>
      </OptionalTooltipWrapper>
    )}
  </ResourceRenderer>
);

DownloadSolutionArchiveContainer.propTypes = {
  solutionId: PropTypes.string.isRequired,
  attemptIndex: PropTypes.number,
  authorId: PropTypes.string.isRequired,
  isReference: PropTypes.bool,
  iconOnly: PropTypes.bool,
  variant: PropTypes.string,
  size: PropTypes.string,
  authorUser: ImmutablePropTypes.map,
  downloadSolutionArchive: PropTypes.func.isRequired,
  downloadRefSolutionArchive: PropTypes.func.isRequired,
};

export default connect(
  (state, { authorId }) => ({
    authorUser: getUser(authorId)(state),
  }),
  (dispatch, { solutionId, attemptIndex }) => ({
    downloadSolutionArchive: user => e => {
      e.preventDefault();
      dispatch(downloadSolutionArchive(solutionId, solutionArchiveFileName(solutionId, user, attemptIndex)));
    },
    downloadRefSolutionArchive: user => e => {
      e.preventDefault();
      dispatch(downloadRefSolutionArchive(solutionId, solutionArchiveFileName(solutionId, user)));
    },
  })
)(DownloadSolutionArchiveContainer);
