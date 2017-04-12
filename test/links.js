import { expect } from 'chai';
import {
  extractLanguageFromUrl,
  removeFirstSegment,
  changeLanguage,
  isAbsolute,
  absolute
} from '../src/links';

describe.only('Links functions', () => {
  it('must extract current language from the url (first segment)', () => {
    expect(extractLanguageFromUrl('xyz')).to.equal('xyz');
    expect(extractLanguageFromUrl('/xyz')).to.equal('xyz');
    expect(extractLanguageFromUrl('/xyz/')).to.equal('xyz');
    expect(extractLanguageFromUrl('/xyz/foo/bar')).to.equal('xyz');
    expect(extractLanguageFromUrl('/xyz?a=b')).to.equal('xyz');
    expect(extractLanguageFromUrl('/xyz/?a=b')).to.equal('xyz');
  });

  it('must remove the language from the URL', () => {
    expect(removeFirstSegment('xyz')).to.equal('');
    expect(removeFirstSegment('/xyz')).to.equal('');
    expect(removeFirstSegment('/xyz/')).to.equal('/');
    expect(removeFirstSegment('/xyz/foo/bar')).to.equal('/foo/bar');
    expect(removeFirstSegment('/xyz?a=b')).to.equal('?a=b');
    expect(removeFirstSegment('/xyz/?a=b')).to.equal('/?a=b');
  });

  it('must change old language for the new language while the rest of the URL remains the same', () => {
    expect(changeLanguage('xyz', 'abc')).to.equal('/abc');
    expect(changeLanguage('/xyz', 'abc')).to.equal('/abc');
    expect(changeLanguage('/xyz/', 'abc')).to.equal('/abc/');
    expect(changeLanguage('/xyz/foo/bar', 'abc')).to.equal('/abc/foo/bar');
    expect(changeLanguage('/xyz?a=b', 'abc')).to.equal('/abc?a=b');
    expect(changeLanguage('/xyz/?a=b', 'abc')).to.equal('/abc/?a=b');
  });

  it('must detect absolute and relative URLs (HTTP, HTTPS)', () => {
    expect(isAbsolute('http://')).to.equal(false);
    expect(isAbsolute('https://')).to.equal(false);
    expect(isAbsolute('//')).to.equal(false);
    expect(isAbsolute('//abc')).to.equal(true);
    expect(isAbsolute('http://www.xxx.yyy')).to.equal(true);
    expect(isAbsolute('https://www.xxx.yyy')).to.equal(true);
    expect(isAbsolute('/abc')).to.equal(false);
    expect(isAbsolute('abc')).to.equal(false);
    expect(isAbsolute('abc/def')).to.equal(false);
    expect(isAbsolute('/abc/def')).to.equal(false);
    expect(isAbsolute('')).to.equal(false);
  });
});
