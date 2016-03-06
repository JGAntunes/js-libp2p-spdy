var streamPair = require('stream-pair')

module.exports.all = function (test, common) {
  test('Open a stream from the dialer', function (t) {
    common.setup(test, function (err, muxer) {
      t.plan(4)
      t.ifError(err, 'Should not throw')

      var pair = streamPair.create()
      var dialer = muxer(pair, false)
      var listener = muxer(pair.other, true)

      listener.on('stream', (stream) => {
        t.pass('got stream')
      })

      dialer.newStream((err, stream) => {
        t.ifError(err, 'Should not throw')
        t.pass('dialed stream')
      })
    })
  })
  test('Open a stream from the listener', function (t) {
    common.setup(test, function (err, muxer) {
      t.plan(4)
      t.ifError(err, 'Should not throw')

      var pair = streamPair.create()
      var dialer = muxer(pair, false)
      var listener = muxer(pair.other, true)

      dialer.on('stream', (stream) => {
        t.pass('got stream')
      })

      listener.newStream((err, stream) => {
        t.ifError(err, 'Should not throw')
        t.pass('dialed stream')
      })
    })
  })

  test('Open a stream on both sides', function (t) {
    common.setup(test, function (err, muxer) {
      t.plan(7)
      t.ifError(err, 'Should not throw')

      var pair = streamPair.create()
      var dialer = muxer(pair, false)
      var listener = muxer(pair.other, true)

      dialer.on('stream', (stream) => {
        t.pass('got stream')
      })

      listener.newStream((err, stream) => {
        t.ifError(err, 'Should not throw')
        t.pass('dialed stream')
      })

      listener.on('stream', (stream) => {
        t.pass('got stream')
      })

      dialer.newStream((err, stream) => {
        t.ifError(err, 'Should not throw')
        t.pass('dialed stream')
      })
    })
  })

  test('Open a stream on one side, write, open a stream in the other side', function (t) {
    common.setup(test, function (err, muxer) {
      t.plan(9)
      t.ifError(err, 'Should not throw')

      var pair = streamPair.create()
      var dialer = muxer(pair, false)
      var listener = muxer(pair.other, true)

      dialer.newStream(function (err, stream) {
        t.ifError(err, 'Should not throw')
        t.pass('dialed stream from dialer')
        stream.write('hey')
      })

      listener.on('stream', function (stream) {
        t.pass('listener got stream')

        stream.on('data', function (chunk) {
          t.equal(chunk.toString(), 'hey')
        })

        listener.newStream(function (err, stream) {
          t.ifError(err, 'Should not throw')
          t.pass('dialed stream from listener')

          stream.write('hello')
        })
      })

      dialer.on('stream', function (stream) {
        t.pass('dialer got stream')

        stream.on('data', function (chunk) {
          t.equal(chunk.toString(), 'hello')
        })
      })
    })
  })

  test('Open a stream using the net.connect pattern', function (t) {
    common.setup(test, function (err, muxer) {
      t.plan(2)
      t.ifError(err, 'Should not throw')

      var pair = streamPair.create()
      var dialer = muxer(pair, false)
      var listener = muxer(pair.other, true)

      var stream = dialer.newStream()

      stream.on('ready', function () {
        t.pass('dialed stream')
      })

      stream.on('error', function (err) {
        t.ifError(err, 'Should not throw')
      })

      listener.on('stream', function (stream) {
        t.pass('got stream')
      })
    })
  })

  test('Buffer writes Open a stream using the net.connect pattern', function (t) {
    common.setup(test, function (err, muxer) {
      t.plan(3)
      t.ifError(err, 'Should not throw')

      var pair = streamPair.create()
      var dialer = muxer(pair, false)
      var listener = muxer(pair.other, true)

      var stream = dialer.newStream()

      stream.write('buffer this')

      stream.on('ready', function () {
        t.pass('dialed stream')
      })

      stream.on('error', function (err) {
        t.ifError(err, 'Should not throw')
      })

      listener.on('stream', function (stream) {
        t.pass('got stream')

        stream.on('data', function (chunk) {
          t.equal(chunk.toString(), 'buffer this')
        })
      })
    })
  })
}