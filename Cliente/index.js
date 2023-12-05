const dgram = require('dgram');

// Configurar o cliente UDP
const client = dgram.createSocket('udp4');

// Configurações do servidor NTP
const serverAddress = '127.0.0';
const serverPort = 3000;

// Função para construir o pacote NTP
function construirPacoteNTP() {
  const buffer = Buffer.alloc(48);
  // Configurar o modo (client) e o número de versão (3)
  buffer.writeUInt8(0b00100011, 0);
  // Preencher os campos de timestamp com 0 (inicialmente)
  for (let i = 1; i < 48; i++) {
    buffer.writeUInt8(0, i);
  }
  return buffer;
}

// Função para extrair o timestamp da resposta do servidor
function extrairTimestamp(response) {
  // const secondsSince1900 = response.readUInt32BE(32);
  // const fraction = response.readUInt32BE(36);
  // const unixEpoch = Date.UTC(1900, 0, 1, 0, 0, 0);
  // const timestamp = unixEpoch + (secondsSince1900 * 1000) + (fraction / 4294967296 * 1000);
  // return new Date(timestamp);
  const secondsSince1900 = response.readUInt32BE(32);
  const fraction = response.readUInt32BE(36);
  const unixEpoch = Date.UTC(1900, 0, 1, 0, 0, 0);
  const timestamp = unixEpoch + (secondsSince1900 * 1000) + (fraction / 4294967296 * 1000);
  return new Date(timestamp);
}

// Enviar pacote NTP para o servidor
const message = construirPacoteNTP();
client.send(message, 0, message.length, serverPort, serverAddress, (err) => {
  if (err) throw err;
  console.log('Pacote NTP enviado com sucesso');
});

// Lidar com a resposta do servidor
client.on('message', (msg, rinfo) => {
  // const timestamp = extrairTimestamp(msg);
  // console.log(`Resposta do servidor NTP: ${timestamp}`);
  // client.close();
  const timestamp = extrairTimestamp(msg);
  console.log(`Resposta do servidor NTP: ${timestamp.toLocaleString()}`);
  client.close();
});

// Lidar com erros no socket
client.on('error', (err) => {
  console.error(`Erro no cliente UDP: ${err.message}`);
  client.close();
});

// Fechar o cliente após um período de tempo (por exemplo, 5 segundos)
// setTimeout(() => {
//   console.log('Tempo limite atingido. Fechando o cliente.');
//   client.close();
// }, 5000);
