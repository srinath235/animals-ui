require('should')

const http = require('http')
const request = require('supertest')
const url = 'http://localhost:2999'
const fs = require('fs')
const decache = require('decache')
const Cats = require('../../src/services/cats')
const service = new Cats(process.env.API_URL)
const item = { name: 'Tom', description: 'Friend of Jerry' }

let server
let app
let agent
let created
service.create(item).then((data) => { created = data })

function startServer(done) {
  let port = process.env.PORT || '2999'
  app = require('../../src/app')
  decache('../../src/app')
  app.set('port', port)
  server = http.createServer(app)
  server.listen(port)
  server.on('listening', () => {
    agent = request.agent(server)
    done()
  })
  server.on('error', (error) => {
    console.log(error)
  })
}

describe('/', function () {

  beforeEach('Setup', function (done) {
    startServer(done)
  })

  it('should get cats', function () {
    return agent.get('/cats').expect(200).then(data => {
      data.text.includes('Cats').should.be.true()
    })
  })

  it('should get a cat', function () {
    return agent.get('/cats/'+created.id).expect(200).then(data => {
        data.text.includes('Cat').should.be.true()
      })
  })

  it('should get add cat page', function () {
    return agent.get('/cats/add').expect(200).then(data => {
      data.text.includes('Add a Cat').should.be.true()
    })
  })

  it('should add a cat', function () {
    return agent.post('/cats').expect(302).send({name: 'Test cat', description: 'Test description'})
  })

  it('should get edit cat page', function () {
    return agent.post('/cats').expect(200).send({ edit: 'Edit', id: created.id }).then(data => {
      data.text.includes('Edit a Cat').should.be.true()
    })
  })

  it('should edit a cat', function () {
    return agent.post('/cats').expect(302).send({ id: created.id, name: 'Spirit', description: 'Rebellion of Cimarron' })
  })

  afterEach('Teardown', function () {
    console.log('Teardown')
    server.close()
    server = undefined
    app = undefined
  })
})
