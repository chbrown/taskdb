const default_headers = {
  'Content-Type': 'application/json'
};

/**
Determine URL and HTTP method from current id and desired action
*/
export function restParams(base, id = 'new', update = false) {
  var exists = id !== 'new';
  var method = update ? (exists ? 'PUT' : 'POST') : 'GET';
  var path = update ? (exists ? `/${id}` : '') : `/${id}`;
  return [`${base}${path}`, {method: method, headers: default_headers}];
}

/**
`response` is a Promise as returned by fetch()
*/
export function jsonOrDie(response) {
  if (response.status >= 200 && response.status < 400) {
    return response.json();
  } else {
    throw new Error('No results found');
  }
}
