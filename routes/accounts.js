import express from 'express';

//const fs = require('fs').promises;
import { promises } from 'fs';

import cors from 'cors';

//criação de variavel para uso de promises evita repetição de escrita toda vez que for usar promises

const router = express.Router(); //cria objeto router para substituir app uma vez que todos endpoint respondem na mesma url
const readFile = promises.readFile;
const writeFile = promises.writeFile;

router.post('/', async (req, res) => {
  //pegar parametros que estão sendo enviados
  let account = req.body;

  try {
    //data da callback passa a ser retornado pela promisse caso ela tenha sucesso. Erro retornado no catch
    let data = await readFile(global.fileName, 'utf8');

    let json = JSON.parse(data); // le o arquivo
    //console.log(json);

    // operador ... destructing faz a mesma função que criar as propiedades do objeto name: account.name, balance: account.balance
    account = { id: json.nextId++, ...account }; //constroi o objeto account
    json.accounts.push(account); // inserindo objeto no final do array account

    //escrita do conteudo. Como já foi lido podemos usar o writeFile e reescrever o novo arquivo
    await writeFile(global.fileName, JSON.stringify(json));

    //res.end(); // retorna status 200
    res.status(200).send('Conta cadastrada com sucesso');

    logger.info(`POST /account - ${JSON.stringify(account)}`);
  } catch (error) {
    res.status(400).send({ error: error.message });
    logger.error(`POST /account -${err.message}`);
  }
});

router.get('/', cors(), async (_, res) => {
  try {
    //ler o arquivo
    let data = await readFile(global.fileName, 'utf8');

    // criando variavel json para responder data usando a conversão parse e remover o next id com delete json.nextID
    let json = JSON.parse(data);
    delete json.nextId;
    res.send(json);

    logger.info('GET /account');
  } catch (error) {
    res.status(400).send({ error: error.message });

    logger.error(`GET /account -${err.message}`);
  }
});

router.get('/:id', async (req, res) => {
  try {
    let data = await readFile(global.fileName, 'utf8');

    // criando variavel json para responder data usando a conversão parse e remover o next id com delete json.nextID
    let json = JSON.parse(data);
    const account = json.accounts.find(
      (account) => account.id === parseInt(req.params.id, 10) // parseInt usado para converter string para inteiro
    ); //usar o metodo find para localizar o objeto com id fornecido no array accounts

    if (account) {
      res.send(account);

      logger.info(`GET /account/:id - ${JSON.stringify(account)}`);
    } else {
      res.status(200).send('Conta não localizada');

      logger.info('GET /account/:id');
    }
  } catch (error) {
    res.status(400).send({ error: error.message });
    logger.error(`GET /account/:id -${err.message}`);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    let data = await readFile(global.fileName, 'utf8');

    // criando variavel json para responder data usando a conversão parse e remover o next id com delete json.nextID

    let json = JSON.parse(data);
    //é possivel inserir um tratamento de erro aqui caso não exista o id no array

    let accounts = json.accounts.filter(
      (account) => account.id !== parseInt(req.params.id, 10) // parseInt usado para converter string para inteiro
    ); //usar o metodo filter para localizar o objeto com id fornecido no array accounts e remover retornando o array sem o objeto

    json.accounts = accounts; // troca o array com todos os registros pelo novo array

    //escreve o novo arquivo

    await writeFile(global.fileName, JSON.stringify(json));

    //res.end(); // retorna status 200
    res.status(200).send('Conta removida com sucesso');

    logger.info(`DELETE /account/:id - ${req.params.id}`);
  } catch (error) {
    res.status(400).send({ error: error.message });

    logger.error(`DELETE /account -${err.message}`);
  }
});

//put utilizado para atualizar completamente o registro. Patch para atualização parcial

router.put('/', async (req, res) => {
  try {
    //pegar parametros que estão sendo enviados
    let newAccount = req.body;

    let data = await readFile(global.fileName, 'utf8');

    let json = JSON.parse(data); //Lê a informação do arquivo

    let oldIndex = json.accounts.findIndex(
      (account) => account.id === newAccount.id
    ); //método dinfIndex encontra o índice anterior ao registro que desejamos alterar

    json.accounts[oldIndex].name = newAccount.name; //altera a posição do registro com os valores recebidos da requisição
    json.accounts[oldIndex].balance = newAccount.balance;

    await writeFile(global.fileName, JSON.stringify(json));

    res.status(200).send('Conta atualizada');
    //res.end(); // retorna status 200

    logger.info(`PUT /account - ${JSON.stringify(newAccount)}`);
  } catch (error) {
    res.status(400).send({ error: error.message });

    logger.error(`PUT /account -${err.message}`);
  }
});

router.post('/transaction', async (req, res) => {
  //pegar parametros que estão sendo enviados

  try {
    let params = req.body;

    let data = await readFile(global.fileName, 'utf8');

    // let json = JSON.parse(data); //Lê a informação do arquivo

    let json = JSON.parse(data);
    let index = json.accounts.findIndex((account) => account.id === params.id);

    //método dinfIndex encontra o índice anterior ao registro que desejamos alterar

    // prettier-ignore
    if ((params.value < 0) && ((json.accounts[index].balance + params.value) < 0)) {
        throw new Error("Não há saldo suficiente.");
      }

    json.accounts[index].balance += params.value;

    await writeFile(global.fileName, JSON.stringify(json));

    res.send(json.accounts[index]);
    //res.end(); // retorna status 200
    logger.info(`POST /account/transaction - ${JSON.stringify(params)}`);
  } catch (err) {
    res.status(400).send({ error: err.message });

    logger.error(`POST /account/transaction -${err.message}`);
  }
});

//module.exports = router;
export default router; //pesquisar outras formar de exportar variaveis. Aqui exportamos o modulo inteiro.
