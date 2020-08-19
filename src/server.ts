import app from './app';
import { get } from './modules/config-loader/ConfigLoader';

app.listen(app.get('port'), () => {
  console.log(`Open browser at http://localhost:${app.get('port')} in ${get('NODE_ENV')} mode`);
  console.log('Press CTRL-C to stop\n');

});
