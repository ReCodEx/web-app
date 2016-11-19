import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';

import PageContent from '../../components/PageContent';

const Home = () => (
  <PageContent
    title={
      <FormattedMessage
        id='app.homepage.title'
        defaultMessage='ReCodEx - Code Examinator Reloaded'
        description='Homepage title' />
      }
    description={
      <FormattedMessage
        id='app.homepage.description'
        defaultMessage='ReCodEx - homepage'
        description='Homepage description' />
  }>
    <div>
      <h1>
        <FormattedMessage
          id='app.homepage.greetings'
          defaultMessage='Welcome to ReCodEx'
          description='Homepage greetings of the user' />
      </h1>
      <Row style={{"marginTop": "50px"}}>
        <Col sm={6}>
          <img src={'/public/logo.png'} width={'80%'} style={{'maxWidth': '500px'}} />
        </Col>
        <Col sm={6}>
          <h2>Co je ReCodEx?</h2>
          <p>
            ReCodEx je systém pro dynamické vyhodnocování programátorských úloh. Jedná se o soubor aplikací, které umožní vyučujícím informatických předmětů
            zadávat praktické programátorské úlohy skrze webové rozhraní. Studenti pak skrze toto rozhraní nahrávají svá řešení a ReCodEx je automaticky
            vyhodnocuje (typicky kontroluje správnost výstupu programu pro vstupy nastavené cvičícím) a přiděluje za ně body. Řešitelé tak získávají rychlou
            zpětnou vazbu a cvičícím odpadá povinnost ručně kontrolovat základní požadavky na správnost programů (například že se zdrojový kód zkompiluje
            a program vydává správné výsledky).
          </p>
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <h2>O projektu</h2>
          <p>
            Projekt vznikl v rámci předmětu <i>Softwarový projekt</i> v roce 2016 jako náhrada za již zastaralý systém CodEx používaný na MFF UK. Projekt je
            zveřejněn pod <a href="https://opensource.org/licenses/MIT">MIT</a> licencí a hostován na <a href="https://github.com/ReCodEx">GitHubu</a>.
            Podrobnější informace jsou k dispozici na <a href="https://github.com/ReCodEx/wiki/wiki">Wiki</a> projektu.
          </p>
          <p>
            Při vývoji se objevila řada témat pro studentské projekty různého typu, takže v případě zájmu o vylepšení tohoto systému neváhejte kontaktovat
            autory nebo některého z vyučujících.
          </p>
        </Col>
        <Col sm={6}>
          <h3>Autoři</h3>
          <ul>
            <li>Jan Buchar</li>
            <li>Martin Polanka</li>
            <li>Šimon Rozsíval</li>
            <li>Petr Stefan</li>
          </ul>
        </Col>
      </Row>
    </div>
  </PageContent>
);

export default Home;
