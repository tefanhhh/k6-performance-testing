import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const loginRes = http.post('http://localhost/auth/login', {
    username: 'superadmin',
    password: 'password',
  });

  check(loginRes, {
    'login status was 201': (r) => r.status === 201,
    'login body has access_token': (r) =>
      JSON.parse(r.body).access_token !== undefined,
  });

  if (loginRes.status !== 201) {
    console.log('Login failed');
    return;
  }

  const jwt = JSON.parse(loginRes.body).access_token;

  const headers = { Authorization: `Bearer ${jwt}` };
  const res = http.get('http://localhost/user', {
    headers: headers,
  });

  check(res, {
    'get user status was 200': (r) => r.status === 200,
    'get user body has user data': (r) => JSON.parse(r.body).user !== undefined,
  });

  if (res.status !== 200) {
    console.log('Get user failed');
    return;
  }

  console.log(res.body);

  sleep(1);
}
