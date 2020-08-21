import app from './app';
import { getConfigValue } from './modules/config-handler/ConfigHandler';

app.listen(app.get('port'), () => {
  console.log(`Open browser at http://localhost:${getConfigValue('PORT')} in ${getConfigValue('NODE_ENV')} mode`);
  console.log('Press CTRL-C to stop\n');

});
