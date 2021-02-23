const core = require('@actions/core');
const github = require("@actions/github");


function getSearchString() {
  const path = core.getInput("path");
  const filename = core.getInput("filename");
  const extension = core.getInput("extension");
  const user = core.getInput("user");
  const org = core.getInput("org")

  var searchString = '';
  if (filename) {
    searchString += `filename:${filename}`;
  } else if(extension) {
    searchString += `extension:${extension}`;
  } else {
    core.setFailed("Filename or Extension must be specified, received none.");
    throw new Error('Filename or Extension must be specified, received none.');
  }
  if (path) {
    searchString += `+path:${path}`;
  }
  if(org) {
    searchString += `+org:${org}`;
  }
  if(user) {
    searchString += `+user:${user}`;
  }
  return searchString;
}

function searchCode(searchString) {
  const token = core.getInput("access-token");
  if (!token) {
    throw new Error('Token must be specified');
  }    
  const octokit = github.getOctokit(token);
  const { data } = await octokit.search.code({ q: searchString });
  if (!data || data.total_count === 0) {
    console.log(`No results found for ${searchString}`);
    return null;
  }

  return data;
}

function sortResults(items) {
  return items.sort((a, b) => (a.repository.name > b.repository.name) ? 1 : -1);
}

module.exports = {
  searchCode,
  getSearchString,
  sortResults
}