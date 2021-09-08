import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';

import PageContent from '../../components/layout/PageContent';
import Markdown from '../../components/widgets/Markdown';

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
        title={<FormattedMessage id="app.faq.title" defaultMessage="FAQ" />}
        description={<FormattedMessage id="app.faq.description" defaultMessage="ReCodEx FAQ" />}>
        <Markdown source={this.state.faqText} />
      </PageContent>
    );
  }
}

export default FAQ;
