const test = require('node:test');
const assert = require('node:assert/strict');
const { isAllowedOrigin, isLocalOrPrivateHost } = require('./origin-utils');

test('allows private network origins for app shell requests', () => {
  assert.equal(isAllowedOrigin('http://192.168.1.100:3000'), true);
  assert.equal(isAllowedOrigin('http://10.0.0.10:3000'), true);
  assert.equal(isAllowedOrigin('http://my-laptop.local:3000'), true);
});

test('rejects unrelated public origins', () => {
  assert.equal(isAllowedOrigin('https://example.com'), false);
  assert.equal(isAllowedOrigin('http://8.8.8.8:3000'), false);
});

test('recognizes loopback and local hosts', () => {
  assert.equal(isLocalOrPrivateHost('localhost'), true);
  assert.equal(isLocalOrPrivateHost('127.0.0.1'), true);
  assert.equal(isLocalOrPrivateHost('my-home.local'), true);
  assert.equal(isLocalOrPrivateHost('example.com'), false);
});
