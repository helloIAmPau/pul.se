export default function client(path, options = {}) {
  return fetch(path, {
    method: options.method,
    headers: {
      'content-type': 'application/json'
    },
    body: options.body
  }).then(function(response) {
    if(response.status !== 200) {
      throw new Error(`HTTP request failed (${ response.status }): ${ response.statusText }`);
    }

    return response.json();
  }).then(function({ errors, data }) {
    if(Array.isArray(errors)) {
      throw new Error(errors[0].message);
    }

    return data;
  });
};
