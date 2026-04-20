export default {
  google: {
    authorization: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${ process.env.GOOGLE_OAUTH_CLIENTID }&redirect_uri=${ process.env.PULSE_HOSTNAME }/auth/callback&response_type=code&scope=https://www.googleapis.com/auth/userinfo.email`,
    verify: function(code) {
      const tokenUrl = `https://oauth2.googleapis.com/token?client_id=${ process.env.GOOGLE_OAUTH_CLIENTID }&client_secret=${ process.env.GOOGLE_OAUTH_CLIENTSECRET }&grant_type=authorization_code&redirect_uri=${ process.env.PULSE_HOSTNAME }/auth/callback`;
      const apiUrl = 'https://www.googleapis.com/oauth2/v1/userinfo';

      return fetch(`${ tokenUrl }&code=${ code }`, {
        method: 'POST'
      }).then(function(response) {
        if(response.status !== 200) {
          throw new Error('Unable to generate OAuth token');
        }
    
        return response.json();
      }).then(function({ access_token }) {
        return fetch(apiUrl, {
          headers: {
            authorization: `Bearer ${ access_token }`
          }
        });
      }).then(function(response) {
        if(response.status !== 200) {
          throw new Error('Unable to obtain user info');
        }
    
        return response.json();
      });
    }
  }
};
