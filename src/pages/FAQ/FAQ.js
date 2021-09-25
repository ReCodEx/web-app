import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';

import PageContent from '../../components/layout/PageContent';
import Markdown from '../../components/widgets/Markdown';
import { FaqIcon } from '../../components/icons';

const FAQ_MD_URI = 'https://raw.githubusercontent.com/wiki/ReCodEx/wiki/FAQ.md';

class FAQ extends Component {
  state = {
    faqText: '',
  };

  componentDidMount() {
    fetch(FAQ_MD_URI)
      .then(res => res.text())
      .then(text => this.setState({ faqText: text }));
  }

  render() {
    return (
      <PageContent
        icon={<FaqIcon />}
        title={<FormattedMessage id="app.faq.title" defaultMessage="Frequently Asked Questions" />}>
        <>
          <hr />
          <Markdown source={this.state.faqText} />
        </>
      </PageContent>
    );
  }
}

export default FAQ;
