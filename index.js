const xs = require('xstream').default
const run = require('@cycle/run').default
const { makeHTTPDriver } = require('@cycle/http')

// When merging multiple sources into a single stream
// and using the results for different sinks, only the FIRST
// sink will actually recieve results. Changing the order of
// HTTP and FOO sinks in the returned object keys of "app" will
// change whether or not we console.log "GOT FOO"

const drivers = {
  HTTP: makeHTTPDriver(),
  FOO: (in$) => {
    in$.addListener({
      next: function (v) {
        console.log('GOT FOO', v)
      }
    })
  }
}

function app (sources) {
  const allSinks$ = xs.merge(
    xs.of({ url: 'http://localhost:8082', category: 'test' }),
    xs.of({ foo: 1 }),
    sources.HTTP.select('test')
      .flatten()
      .map((res) => ({ response: res.text }))
  )

  return {
    HTTP: allSinks$.filter((v) => !!v.url),
    FOO: allSinks$.filter((v) => !!v.foo)
  }
}

run(app, drivers)

require('http').createServer((req, res) => {
  const buff = Buffer.from('hello')
  res.writeHead(200, {
    'Content-Length': buff.byteLength,
    'Content-Type': 'text/plain' })
  res.write(buff, () => res.end())
}).listen(8082)
