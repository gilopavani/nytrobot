/**
 * Ponto de entrada principal para a aplicação
 */
require('dotenv').config();
const nitroTypeController = require('./controllers/nitrotype.controller');
const logger = require('./utils/logger');

/**
 * Função principal que inicia a aplicação
 */
async function main() {
  try {
    logger.info('Iniciando aplicação...');
    
    // Iniciar sessão no Nitrotype
    const loginSucesso = await nitroTypeController.iniciarSessao();
    
    if (loginSucesso) {
      // Aguarda na página do garage após login bem-sucedido
      logger.info('Autenticação realizada com sucesso. Aguardando na página do garage...');
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 segundos para visualização
    } else {
      logger.error('Não foi possível realizar login ou verificar autenticação');
    }
    
    // Finaliza a sessão
    await nitroTypeController.finalizarSessao();
    
    logger.info('Aplicação finalizada com sucesso');
  } catch (error) {
    logger.error(`Erro na execução da aplicação: ${error.message}`);
    
    // Garante que o navegador será fechado em caso de erro
    await nitroTypeController.finalizarSessao();
    
    // Encerra o processo com código de erro
    process.exit(1);
  }
}

// Executa a função principal
main();