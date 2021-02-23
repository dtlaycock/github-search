const core = require('@actions/core');
jest.mock('@actions/core');
const { when } = require('jest-when');
const search = require('../src/search.js');

describe('Ensure the search string matches the input parameters', () => {
  it('Run with no input params and it should fail', () => {
    expect(() => { search.getSearchString() }).toThrow("Filename or Extension must be specified")
  });

  it('Run with filename should search for filename without specifying org or user', () => {
    const inputs = {'filename': 'ci.yml'};
    setInputs(inputs);
    const expected = getExpected(inputs);
    
    const actual = search.getSearchString();

    expect(actual).toEqual(expected);
  });

  it('Run with extension should search for extension without specifying org or user', () => {
    const inputs = {'extension': 'yml'};
    setInputs(inputs);
    const expected = getExpected(inputs);
    
    const actual = search.getSearchString();
    
    expect(actual).toEqual(expected);
  });

  it('Run with filename and path should search for filename and path', () => {
    const inputs = {'filename': 'ci.yml', 'path': '.github/workflows'};
    setInputs(inputs);
    const expected = getExpected(inputs);
    
    const actual = search.getSearchString();
    
    expect(actual).toEqual(expected);
  });

  it('Run with filename and org should search for filename and org', () => {
    const inputs = {'filename': 'ci.yml', 'org': 'myOrg'};
    setInputs(inputs);
    const expected = getExpected(inputs);
    
    const actual = search.getSearchString();
    
    expect(actual).toEqual(expected);
  });

  it('Run with filename and user should search for filename and user', () => {
    const inputs = {'filename': 'ci.yml', 'user': 'dtlaycock'};
    setInputs(inputs);
    const expected = getExpected(inputs);
    
    const actual = search.getSearchString();
    
    expect(actual).toEqual(expected);
  });

  it('Run with filename, org and user should search for filename, org and user', () => {
    const inputs = {'filename': 'ci.yml', 'org': 'myOrg', 'user': 'dtlaycock'};
    setInputs(inputs);
    const expected = getExpected(inputs);
    
    const actual = search.getSearchString();
    
    expect(actual).toEqual(expected);
  });

  it('Run with filename, path, org and user should search for filename, path, org and user', () => {
    const inputs = {'filename': 'ci.yml', 'path': '.github/workflows', 'org': 'myOrg', 'user': 'dtlaycock'};
    setInputs(inputs);
    const expected = getExpected(inputs);
    
    const actual = search.getSearchString();
    
    expect(actual).toEqual(expected);
  });
});

function setInputs(inputs = {}) {
  Object.entries(inputs).forEach(item => {
    const [key, value] = item;
    when(core.getInput)
      .calledWith(key)
      .mockReturnValueOnce(value);
  });
}

function getExpected(inputs = {}) {
  return Object.keys(inputs).map((key) => [key, inputs[key]].join(':')).join('+');
}

describe('Search results should be grouped by repository', () => {
  it('A basic list with one result per repo should be sorted alphabetically', () => {
    const results = [{"name": "file1.txt", "repository": {"name": "b_repo"}}, {"name": "file2.txt", "repository": {"name": "a_repo"}}];
    const expected = [{"name": "file2.txt", "repository": {"name": "a_repo"}}, {"name": "file1.txt", "repository": {"name": "b_repo"}}];
    const actual = search.sortResults(results);
    expect(actual).toEqual(expected);
  });
  it('A basic list with multiple results in one repo should be sorted alphabetically', () => {
    const results = [{"name": "file1.txt", "repository": {"name": "b_repo"}}, {"name": "image.jpg", "repository": {"name": "a_repo"}}, {"name": "file2.txt", "repository": {"name": "a_repo"}}];
    const expected = [{"name": "file2.txt", "repository": {"name": "a_repo"}}, {"name": "image.jpg", "repository": {"name": "a_repo"}}, {"name": "file1.txt", "repository": {"name": "b_repo"}}];
    const actual = search.sortResults(results);
    expect(actual).toEqual(expected);
  });
})