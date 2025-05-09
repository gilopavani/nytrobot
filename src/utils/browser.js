/**
 * Utilitário para gerenciar o navegador Puppeteer com plugins de segurança
 */
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AnonymizeUaPlugin = require('puppeteer-extra-plugin-anonymize-ua');
const { getRandomUserAgent } = require('../config/user-agents');
const puppeteerConfig = require('../config/puppeteer.config');
const logger = require('./logger');

// Adicionar plugins para evitar detecção
puppeteer.use(StealthPlugin());
puppeteer.use(AnonymizeUaPlugin({ makeWindows: true }));

/**
 * Classe para gerenciar o navegador Puppeteer
 */
class BrowserManager {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  /**
   * Inicializa o navegador com as configurações de segurança
   */
  async init() {
    try {
      logger.info('Iniciando o navegador...');
      
      const userAgent = getRandomUserAgent();
      logger.debug(`Usando user-agent: ${userAgent}`);
      
      // Configurar com user agent aleatório
      const launchOptions = {
        ...puppeteerConfig.launchOptions
      };

      // Iniciar o navegador com as configurações
      this.browser = await puppeteer.launch(launchOptions);
      this.page = await this.browser.newPage();
      
      // Configurar o user agent na página
      await this.page.setUserAgent(userAgent);
      
      // Configurações adicionais para evitar detecção
      await this.page.evaluateOnNewDocument(() => {
        // Ocultar sinais de webdriver
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        
        // Ocultar Chrome
        window.chrome = { runtime: {} };
        
        // Adicionar plugins falsos
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) => (
          parameters.name === 'notifications' ?
            Promise.resolve({ state: Notification.permission }) :
            originalQuery(parameters)
        );
      });

      // Configurar listeners de console para debugging
      if (process.env.DEBUG === 'true') {
        this.page.on('console', msg => logger.debug(`PÁGINA: ${msg.text()}`));
        this.page.on('pageerror', error => logger.error(`ERRO NA PÁGINA: ${error.message}`));
      }
      
      // Configurar timeout padrão de navegação
      await this.page.setDefaultNavigationTimeout(puppeteerConfig.launchOptions.timeout);
      
      logger.info('Navegador iniciado com sucesso');
      return this.page;
    } catch (error) {
      logger.error(`Erro ao iniciar o navegador: ${error.message}`);
      throw error;
    }
  }

  /**
   * Navega para uma URL específica
   * @param {string} url - URL para navegar
   */
  async goTo(url) {
    try {
      logger.info(`Navegando para ${url}`);
      if (!this.page) {
        await this.init();
      }
      
      // Navegação com múltiplas estratégias de espera
      const response = await this.page.goto(url, { 
        waitUntil: ['load', 'networkidle2'],
        timeout: puppeteerConfig.launchOptions.timeout 
      });
      
      if (!response) {
        throw new Error('Falha na navegação: sem resposta');
      }
      
      const status = response.status();
      if (status >= 400) {
        throw new Error(`Página retornou status de erro: ${status}`);
      }
      
      // Aguarda tempo adicional para garantir que o JavaScript da página seja executado
      await this.page.waitForTimeout(1000);
      
      logger.info(`Navegou com sucesso para ${url}`);
    } catch (error) {
      logger.error(`Erro ao navegar para ${url}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fecha o navegador
   */
  async close() {
    try {
      if (this.browser) {
        logger.info('Fechando o navegador...');
        await this.browser.close();
        this.browser = null;
        this.page = null;
        logger.info('Navegador fechado com sucesso');
      }
    } catch (error) {
      logger.error(`Erro ao fechar o navegador: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new BrowserManager();