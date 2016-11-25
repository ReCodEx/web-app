import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { IntlProvider, addLocaleData } from 'react-intl';
import moment from 'moment';
import Layout from '../../components/Layout';

import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { toggleSize, toggleVisibility, collapse, unroll } from '../../redux/modules/sidebar';
import { isVisible, isCollapsed } from '../../redux/selectors/sidebar';
import { messages, localeData, defaultLanguage } from '../../locales';
import { linksFactory, isAbsolute } from '../../links';

import 'admin-lte/dist/css/AdminLTE.min.css';
import 'admin-lte/dist/css/skins/skin-green.min.css';
// import 'admin-lte/dist/css/skins/skin-purple.min.css';

/**
 * Handles the dependency injection of the localized links based on the current language stated in the URL.
 * Also controls the state of the sidebar - collapsing and showing the sidebar.
 */
class LayoutContainer extends Component {

  state = { links: null };

  componentWillMount() {
    this.changeLang(this.props, this.context);
  }

  componentWillReceiveProps(newProps, newContext) {
    if ((typeof this.context.userSettings.openedSidebar === 'undefined' && typeof newContext.userSettings.openedSidebar !== 'undefined') ||
      (typeof this.context.userSettings.openedSidebar !== 'undefined' && this.context.userSettings.openedSidebar !== newContext.userSettings.openedSidebar)) {
      this.resizeSidebarToDefault(newProps, newContext);
    }

    if (this.props.params.lang !== newProps.params.lang) {
      this.changeLang(newProps);
    }
  }

  resizeSidebarToDefault(props, context) {
    // open or hide the sidebar based on user's settings
    const { collapse, unroll } = props;
    const shouldBeOpen = this.getDefaultOpenedSidebar(context);
    shouldBeOpen ? unroll() : collapse();
  }

  getDefaultOpenedSidebar = ({ userSettings }) =>
    userSettings && typeof userSettings.openedSidebar !== 'undefined'
      ? userSettings.openedSidebar
      : true;

  getLang = (props) => {
    let lang = props.params.lang;
    if (!lang) {
      lang = defaultLanguage;
    }

    return lang;
  };

  changeLang = (props) => {
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

  maybeHideSidebar = (e) => {
    const { sidebar, toggleVisibility } = this.props;
    if (sidebar.isOpen) {
      toggleVisibility();
    }
  };

  /**
   * Get messages for the given language or the deafult - English
   */

  getDefaultLang = () => {
    const { userSettings } = this.context;
    return userSettings && userSettings.defaultLanguage ? userSettings.defaultLanguage : 'en';
  };

  getMessages = (lang) => messages[lang] || messages[this.getDefaultLang()];
  getLocaleData = (lang) => localeData[lang] || localeData[this.getDefaultLang()];

  render() {
    const {
      children,
      location: { pathname },
      sidebar,
      toggleSize,
      toggleVisibility,
      isLoggedIn
    } = this.props;

    const { lang } = this.state;
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
  router: PropTypes.object,
  userSettings: PropTypes.object
};

LayoutContainer.propTypes = {
  params: PropTypes.shape({
    lang: PropTypes.string
  }),
  toggleSize: PropTypes.func.isRequired,
  toggleVisibility: PropTypes.func.isRequired,
  collapse: PropTypes.func.isRequired,
  unroll: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool,
  sidebar: PropTypes.object,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }).isRequired,
  children: PropTypes.element
};

const mapStateToProps = (state, props) => ({
  sidebar: {
    isOpen: isVisible(state),
    isCollapsed: isCollapsed(state)
  },
  isLoggedIn: !!loggedInUserIdSelector(state)
});

const mapDispatchToProps = ({ toggleVisibility, toggleSize, collapse, unroll });

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LayoutContainer);
