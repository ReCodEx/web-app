import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import Button from '../../widgets/TheButton';
import { CopyIcon, CopySuccessIcon } from '../../icons';

class CopyLogToClipboard extends Component {
  state = { logCopied: false };

  logCopied = () => {
    this.setState({ logCopied: true });
    if (this.resetLogCopied) {
      clearTimeout(this.resetLogCopied);
    }
    this.resetLogCopied = setTimeout(() => {
      this.setState({ logCopied: false });
      this.resetLogCopied = undefined;
    }, 2000);
  };

  render() {
    const { log, ...props } = this.props;
    return (
      <CopyToClipboard text={log} onCopy={this.logCopied}>
        <Button variant="success" {...props} disabled={this.state.logCopied}>
          {this.state.logCopied ? <CopySuccessIcon gapRight={2} /> : <CopyIcon gapRight={2} />}
          <FormattedMessage id="generic.copyToClipboard" defaultMessage="Copy to clipboard" />
        </Button>
      </CopyToClipboard>
    );
  }
}

CopyLogToClipboard.propTypes = {
  log: PropTypes.string,
};

export default CopyLogToClipboard;
