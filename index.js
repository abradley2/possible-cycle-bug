const xs = require('xstream').default
const run = require('@cycle/run').default

// When merging multiple sources into a single stream
// and using the results for different sinks, only the FIRST
// sink will actually recieve results. Changing the order of
// HTTP and FOO sinks in the returned object keys of "app" will
// change whether or not we console.log "GOT FOO"

const drivers = {
  BAR: () => xs.periodic(1000),
  FOO: (in$) => in$.addListener({
    next: function (v) {
      console.log('GOT FOO', v)
    }
  })
}

function app (sources) {
  const allSinks$ = xs.merge(
    xs.of({ foo: 1 }),
    sources.BAR.mapTo({ bar: 1})
  )

  return {
    BAR: allSinks$,
    FOO: allSinks$.filter((v) => !!v.foo),
  }
}

run(app, drivers)

require('http').createServer(() => {}).listen(8082)
