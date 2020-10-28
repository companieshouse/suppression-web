import app from './app';
import { getConfigValue } from './modules/config-handler/ConfigHandler';
import { loggerInstance } from './utils/Logger';

app.listen(app.get('port'), () => {
  loggerInstance().info(`Open browser at http://localhost:${getConfigValue('PORT')} in ${getConfigValue('NODE_ENV')} mode`);
  loggerInstance().info('Press CTRL-C to stop\n');

});
