/**
 * Serviço para interagir com o site Nitrotype
 */
const browserManager = require('../utils/browser');
const puppeteerConfig = require('../config/puppeteer.config');
const logger = require('../utils/logger');

class NitroTypeService {
  /**
   * Acessa a página de login do Nitrotype
   */
  async acessarPaginaLogin() {
    try {
      logger.info('Acessando a página de login do Nitrotype...');
      await browserManager.goTo(puppeteerConfig.urls.login);
      
      // Aguarda a página carregar completamente
      await browserManager.page.waitForSelector('#username', { visible: true });
      
      logger.info('Página de login do Nitrotype acessada com sucesso');
      return true;
    } catch (error) {
      logger.error(`Erro ao acessar página de login do Nitrotype: ${error.message}`);
      return false;
    }
  }

  /**
   * Fecha o navegador
   */
  async fecharNavegador() {
    return browserManager.close();
  }
}

module.exports = new NitroTypeService();