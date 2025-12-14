export const http = function(url, options) {
  return fetch(url, options).then(function(response) {
    if(response.status !== 200) {
      throw new Error(`Auth request failed: ${ response.statusText } (${ response.status })`);
    }

    return response.json();
  });
};

export const client = function(url, options) {
  return http(url, options).then(function({ data, errors }) {
    if(Array.isArray(errors) === true) {
      throw new Error(errors[0].message);
    }

    return data;
  });
};
