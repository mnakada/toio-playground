//
// WebService.js
//

'use strict';

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');
const fs = require('fs');
const process = require('process');
const ToioConnect = require('./ToioConnect');

class WebService {
  constructor(config) {
    this.setupWebClientConnections = [];
    this.lastData = null;

    const pack = JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'UTF-8'));
    config.description = pack.description;
    config.version = pack.version;
    this.config = config;

    const app = express();

    app.use('/js/*', (req, res) => {
      fs.readFile(`${__dirname}/../frontend${req.originalUrl}.gz`, (err, data) => {
        if(err) return res.end();
        res.set('Content-Type', 'application/javascript');
        res.set('Content-Encoding', 'gzip');
        res.send(data);
      });
    });

    app.use(express.static(__dirname + '/../frontend/'));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    const server = http.Server(app);
    server.listen(config.WebServicePort, () => {
      console.log('WebService listing on port %d', config.WebServicePort);
    });

    // toio I/F
    this.ToioConnect = new ToioConnect();
    this.ToioConnect.on('move', (data) => {
      this.SendSocket('move', data);
    });
    this.ToioConnect.on('button', (data) => {
      this.SendSocket('button', data);
    });

    // socketio
    const socketio = socketIO(server);
    socketio.on('connection', this.Connection.bind(this));

    process.on('SIGINT', this.Finalize.bind(this));
    process.on('SIGTERM', this.Finalize.bind(this));
    process.on('SIGHUP', this.Finalize.bind(this));
  }

  Finalize() {
    console.log('Finalize');
    if(this.intervalEvent) clearInterval(this.intervalEvent);
    this.intervalEvent = null;
    process.exit(0);
  }

  Connection(socket) {
    const clientAddress = socket.handshake.address;
    console.log(`new webBrowser client ${clientAddress}`);
    this.setupWebClientConnections.push(socket);

    socket.on('disconnect', (reason) => {
      console.log('disconnect webbrowser : ', reason);
      for(const i in this.setupWebClientConnections) {
        if(this.setupWebClientConnections[i].id == socket.id) {
          this.setupWebClientConnections.splice(i, 1);
        }
      }
    });

    // receive jobs
    socket.on('run', (position) => {
      this.ToioConnect.Run(position);
    });
    socket.emit('config', this.config);
  }

  SendSocket(label, data) {
    for(const con of this.setupWebClientConnections) {
      con.emit(label, data);
    }
  }
}

module.exports = WebService;
