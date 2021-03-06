jest.mock('@actions/core');
jest.mock('@actions/github');
const core = require('@actions/core');
const github = require('@actions/github');
const { when } = require('jest-when');
const search = require('../src/search.js');
const maxItems = 100;

describe('Ensure the search string matches the input parameters', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

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

describe('SearchCode should return the total number of results', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('Search fails if token is not input', async () => {
    core.getInput.mockReturnValueOnce('');
    search.searchCode('Fake search string error expected');
    expect(core.setFailed).toHaveBeenCalledWith('Access Token must be specified')
  });
  it('Search works if token is available', async () => {
    core.getInput.mockReturnValueOnce('fake-valid-token');
    actual = search.searchCode('Fake search string error expected');

    expect(github.getOctokit).toHaveBeenCalledTimes(1);
  });
  it('Total items matches returned item count for search that returns less than 100 results', async () => {
    // Arrange
    const expectedResults = 4;
    const fakeSearchResults = getFakeSearchResults(expectedResults, expectedResults);
    const stubOctokit = getFakeOctokit();
    core.getInput.mockReturnValueOnce('fake-valid-token');
    stubOctokit.paginate.mockReturnValueOnce(fakeSearchResults);
    github.getOctokit.mockReturnValueOnce(stubOctokit);

    // Act
    const actual = await search.searchCode('filename:test.yml');

    // Assert
    expect(actual.data.items).toHaveLength(expectedResults);
  });
  it('Total items returned matches total_count for a search that returns more than 100 results', async () => {
    const expectedResults = 101;
    const fakeSearchResults = getFakeSearchResults(expectedResults, expectedResults, expectedResults);
    const stubOctokit = getFakeOctokit();
    core.getInput.mockReturnValueOnce('fake-valid-token');
    stubOctokit.paginate.mockReturnValueOnce(fakeSearchResults);
    github.getOctokit.mockReturnValueOnce(stubOctokit);

    const actual = await search.searchCode('filename:test.yml');

    expect(actual.data.items).toHaveLength(expectedResults);
  })
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
  // Generates the query string in key:value format e.g. path:.github/workflows+org:myOrg
  return Object.keys(inputs).map((key) => [key, inputs[key]].join(':')).join('+');
}

function getFakeOctokit() {
  const FakeOctokit = {
    paginate: jest.fn(),
    search: {
      code: jest.fn()
    }
  }
  return FakeOctokit;
}

function getFakeSearchResults(totalCount, itemCount, pageLimit = null) {
  const fakeResponse = {
    data: {
      total_count: totalCount
    }
  }

  var items = [];
  for (i = 1; i <= itemCount; i++) {
    items.push({
      "name": `${i}.yml`,
      "path": `.github/workflows/${i}.yml`,
      "repository": {
          "name": `Repo${i}`,
          "full_name": `myOrg/Repo${i}`,
          "owner": {
            "login": "myOrg",
            "type": "Organization"
          }
      }
    });
    if (i === pageLimit) { break; }
  }
  fakeResponse.data.items = items;
  return fakeResponse;
}
