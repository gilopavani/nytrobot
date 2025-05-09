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
    await nitroTypeController.iniciarSessao();
    
    // Aguarda alguns segundos na página de login antes de fechar
    logger.info('Aguardando na página de login...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
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