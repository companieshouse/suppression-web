import app from './app';

app.listen(app.get('port'), () => {
  console.log(`Open browser at http://localhost:${app.get('port')}`);
  console.log('Press CTRL-C to stop\n');

});
