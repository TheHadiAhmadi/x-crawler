/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const AccountsController = () => import('#controllers/accounts_controller')
const TweetsController = () => import('#controllers/tweets_controller')
const UsersController = () => import('#controllers/users_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.get('/accounts', [AccountsController, 'index'])
router.post('/accounts', [AccountsController, 'save'])

router.get('/users', [UsersController, 'index'])
router.post('/users', [UsersController, 'store'])
router.get('/users/:id', [UsersController, 'show'])
router.put('/users/:id', [UsersController, 'update'])
router.delete('/users/:id', [UsersController, 'destroy'])

router.get('/tweets', [TweetsController, 'index'])

router.get('/test', async () => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Twitter Crawler Test</title>
      <style>
        body {
          font-family: sans-serif;
          background: #111;
          color: #eee;
          padding: 2rem;
        }
        h1 {
          margin-bottom: 1rem;
        }
        button {
          margin-right: 1rem;
          padding: 0.5rem 1rem;
          background: #333;
          color: white;
          border: none;
          cursor: pointer;
        }
        input {
          margin: 0.25rem;
          padding: 0.4rem;
        }
        form {
          margin-top: 2rem;
          background: #222;
          padding: 1rem;
          border-radius: 6px;
        }
        pre {
          background: #222;
          padding: 1rem;
          border-radius: 6px;
          overflow-x: auto;
          margin-top: 2rem;
        }
      </style>
    </head>
    <body>
      <h1>🧪 Twitter Crawler Test</h1>

      <div>
        <button onclick="fetchData('/users')">GET /users</button>
        <button onclick="fetchData('/tweets')">GET /tweets</button>
        <button onclick="fetchData('/accounts')">GET /accounts</button>
      </div>

      <form onsubmit="createUser(event)">
        <h3>Create User</h3>
        <input type="text" id="u_username" placeholder="username" required />
        <input type="text" id="u_name" placeholder="name" required />
        <input type="text" id="u_status" placeholder="status" value="active" />
        <button type="submit">POST /users</button>
      </form>

      <form onsubmit="createAccount(event)">
        <h3>Create Account</h3>
        <input type="text" id="a_authToken" placeholder="authToken" required />
        <input type="text" id="a_status" placeholder="status" value="active" />
        <button type="submit">POST /accounts</button>
      </form>

      <pre id="output">Click a button or submit a form to see output here...</pre>

      <script>
        async function fetchData(endpoint) {
          try {
            const res = await fetch(endpoint)
            const json = await res.json()
            document.getElementById('output').textContent = JSON.stringify(json, null, 2)
          } catch (err) {
            document.getElementById('output').textContent = 'Error: ' + err.message
          }
        }

        async function createUser(e) {
          e.preventDefault()
          const payload = {
            username: document.getElementById('u_username').value,
            name: document.getElementById('u_name').value,
            status: document.getElementById('u_status').value,
          }

          try {
            const res = await fetch('/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
            const json = await res.json()
            document.getElementById('output').textContent = JSON.stringify(json, null, 2)
          } catch (err) {
            document.getElementById('output').textContent = 'Error: ' + err.message
          }
        }

        async function createAccount(e) {
          e.preventDefault()
          const payload = {
            authToken: document.getElementById('a_authToken').value,
            status: document.getElementById('a_status').value,
          }

          try {
            const res = await fetch('/accounts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
            const json = await res.json()
            document.getElementById('output').textContent = JSON.stringify(json, null, 2)
          } catch (err) {
            document.getElementById('output').textContent = 'Error: ' + err.message
          }
        }
      </script>
    </body>
    </html>
  `
})
