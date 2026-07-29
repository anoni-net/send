import assert from 'assert';
import createApp from '../../../app/framework';

// The route handler only has to return something with a toString, and the test
// reads the params the router captured rather than the rendered output.
function appWithDownloadRoute(captured) {
  const app = createApp();
  app.route('/download/:id/:key', function(state) {
    captured.params = state.params;
    return '<div></div>';
  });
  app.route('*', function() {
    captured.wildcard = true;
    return '<div></div>';
  });
  return app;
}

describe('framework routing', function() {
  it('captures an ordinary key', function() {
    const captured = {};
    appWithDownloadRoute(captured).toString('/download/abc123/somekey');
    assert.equal(captured.params.id, 'abc123');
    assert.equal(captured.params.key, 'somekey');
  });

  it('survives a segment that will not percent-decode', function() {
    // decodeURIComponent throws URIError on a lone `%` or on `%zz`, and this
    // ran before the wildcard route was considered, from inside mount()'s
    // onDocumentReady callback where nothing catches it. The server-rendered
    // HTML displayed and the client script then died: no error page, no console
    // pointer, a page that never moves.
    const captured = {};
    const app = appWithDownloadRoute(captured);

    app.toString('/download/abc123/bad%key');

    assert.equal(captured.params.key, 'bad%key');
  });

  it('survives a truncated escape at the end of a segment', function() {
    const captured = {};
    appWithDownloadRoute(captured).toString('/download/abc123/trailing%');
    assert.equal(captured.params.key, 'trailing%');
  });
});
