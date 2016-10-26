import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { IntlProvider, addLocaleData } from 'react-intl';
import moment from 'moment';
import Layout from '../../components/Layout';

import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { toggleSize, toggleVisibility } from '../../redux/modules/sidebar';
import { isVisible, isCollapsed } from '../../redux/selectors/sidebar';
import { messages, localeData, defaultLanguage } from '../../locales';
import { linksFactory, isAbsolute } from '../../links';

import 'admin-lte/dist/css/AdminLTE.min.css';
import 'admin-lte/dist/css/skins/skin-green.min.css';
// import 'admin-lte/dist/css/skins/skin-purple.min.css';

/**
 * This component is intended to be used as the root component and should wrap
 * the whole tree of components in the ReCodEx application as it provides crutial
 * functionality like localized links dependency injection to its subtree.
 * @class LayoutContainer
 * @extends {Component}
 */
class LayoutContainer extends Component {

  state = { links: null };

  componentWillMount() {
    this.changeLang(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.lang !== newProps.params.lang) {
      this.changeLang(newProps);
    }
  }

  getLang = props => {
    let lang = props.params.lang;
    if (!lang) {
      lang = defaultLanguage;
    }

    return lang;
  };

  changeLang = props => {
    const lang = this.getLang(props);
    this.setState({ lang, links: linksFactory(lang) });
  };

  /**
   * Child components should be able to access current language settings
   * and up-to-date links (with respect to the given language).
   */
  getChildContext = () => ({
    links: this.state.links,
    lang: this.state.lang,
    isActive: link => !isAbsolute(link) && this.context.router.isActive(link, true)
  });

  maybeHideSidebar = e => {
    e.preventDefault();
    const { sidebar, toggleVisibility } = this.props;
    if (sidebar.isOpen) {
      toggleVisibility();
    }
  };

  /**
   * Get messages for the given language or the deafult - English
   */

  getMessages = lang => messages[lang] || messages[this.getDefaultLang()];
  getLocaleData = lang => localeData[lang] || localeData[this.getDefaultLang()];

  render() {
    const {
      children,
      location: { pathname },
      sidebar,
      toggleSize,
      toggleVisibility,
      isLoggedIn
    } = this.props;

    const { lang, links: { HOME_URI } } = this.state;
    addLocaleData([ ...this.getLocaleData(lang) ]);
    moment.locale(lang);

    return (
      <IntlProvider locale={lang} messages={this.getMessages(lang)}>
        <Layout
          sidebar={sidebar}
          isLoggedIn={isLoggedIn}
          toggleSize={toggleSize}
          toggleVisibility={toggleVisibility}
          onCloseSidebar={this.maybeHideSidebar}
          lang={lang}
          availableLangs={Object.keys(messages)}
          currentUrl={pathname}>
          {children}
        </Layout>
      </IntlProvider>
    );
  }

}

LayoutContainer.childContextTypes = {
  lang: PropTypes.string,
  links: PropTypes.object,
  isActive: PropTypes.func
};

LayoutContainer.contextTypes = {
  router: PropTypes.object
};

const mapStateToProps = (state, props) => ({
  sidebar: {
    isOpen: isVisible(state),
    isCollapsed: isCollapsed(state)
  },
  isLoggedIn: !!loggedInUserIdSelector(state)
});

const mapDispatchToProps = (dispatch, props) => ({
  toggleVisibility: () => dispatch(toggleVisibility()),
  toggleSize: () => dispatch(toggleSize())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LayoutContainer);
