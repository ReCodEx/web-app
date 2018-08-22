import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Tabs, Tab, Well } from 'react-bootstrap';

import ExternalLinkPreview from '../ExternalLinkPreview';
import Icon from '../../icons';
import Markdown from '../../widgets/Markdown';

import './LocalizedTexts.css';

const tabsComparator = ({ locale: a }, { locale: b }) =>
  typeof a !== 'string'
    ? typeof b !== 'string' ? 0 : 1
    : typeof b !== 'string' ? -1 : a.localeCompare(b);

const LocalizedTexts = ({ locales = [] }, { lang = 'en' }) =>
  <Tabs
    defaultActiveKey={
      locales.find(({ locale }) => locale === lang) || locales.length === 0
        ? lang
        : locales[0].locale
    }
    className="nav-tabs-custom"
    id="localized-texts"
  >
    {locales
      .sort(tabsComparator)
      .map(({ locale, text, link = '', studentHint = null }, i) =>
        <Tab key={i} eventKey={locale} title={locale}>
          {link &&
            link !== '' &&
            <div>
              <Well>
                <h4>
                  <FormattedMessage
                    id="app.localizedTexts.externalLink"
                    defaultMessage="The description is located beyond the realms of ReCodEx"
                  />
                </h4>
                <Icon icon="link" gapRight />
                <a href={link} target="_blank">
                  {link}
                </a>
              </Well>
              <ExternalLinkPreview url={link} />
            </div>}

          {text.trim() !== '' && <Markdown source={text} />}

          {!text.trim() &&
            !link &&
            <div className="callout callout-warning em-margin">
              <FormattedMessage
                id="app.localizedTexts.noText"
                defaultMessage="There is no text nor link for given localization. The exercise is not fully specified yet."
              />
            </div>}

          {studentHint &&
            studentHint !== '' &&
            <div>
              <hr />
              <h4>
                <FormattedMessage
                  id="app.localizedTexts.studentHintHeading"
                  defaultMessage="Hint"
                />
              </h4>
              <Markdown source={studentHint} />
            </div>}
        </Tab>
      )}

    {locales.length === 0 &&
      <Tab eventKey={lang} title={lang}>
        <FormattedMessage
          id="app.localizedTexts.missingText"
          defaultMessage="Localized text has not been published yet."
        />
      </Tab>}
  </Tabs>;

LocalizedTexts.contextTypes = {
  lang: PropTypes.string
};

LocalizedTexts.propTypes = {
  locales: PropTypes.arrayOf(
    PropTypes.shape({
      locale: PropTypes.string.isRequried,
      text: PropTypes.string.isRequried
    })
  )
};

export default LocalizedTexts;
