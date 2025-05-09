/**
 * Controlador para coordenar ações relacionadas ao Nitrotype
 */
const nitrotypeService = require('../services/nitrotype.service');
const logger = require('../utils/logger');

class NitroTypeController {
  /**
   * Inicia uma sessão no Nitrotype
   */
  async iniciarSessao() {
    try {
      logger.info('Iniciando sessão no Nitrotype...');
      
      // Acessa a página de login
      const loginAcessado = await nitrotypeService.acessarPaginaLogin();
      
      if (!loginAcessado) {
        throw new Error('Não foi possível acessar a página de login');
      }
      
      logger.info('Sessão iniciada com sucesso');
      return true;
    } catch (error) {
      logger.error(`Erro ao iniciar sessão: ${error.message}`);
      
      // Tenta fechar o navegador em caso de erro
      await nitrotypeService.fecharNavegador();
      return false;
    }
  }

  /**
   * Finaliza a sessão do Nitrotype
   */
  async finalizarSessao() {
    try {
      logger.info('Finalizando sessão...');
      await nitrotypeService.fecharNavegador();
      logger.info('Sessão finalizada com sucesso');
      return true;
    } catch (error) {
      logger.error(`Erro ao finalizar sessão: ${error.message}`);
      return false;
    }
  }
}

module.exports = new NitroTypeController();