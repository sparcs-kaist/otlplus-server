'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === 'function' ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g['throw'] = verb(1)),
      (g['return'] = verb(2)),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t = op[0] & 2 ? y['return'] : op[0] ? y['throw'] || ((t = y['return']) && t.call(y), 0) : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, '__esModule', { value: true });
var dotenv_1 = require('dotenv');
var axios_1 = require('axios');
var dotenv_options_1 = require('@otl/noti-server/dotenv-options');
dotenv_1.default.config(dotenv_options_1.dotEnvOptions);
var RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672';
var FCM_SERVER_KEY = process.env.FCM_SERVER_KEY;
function sendPushNotification(pushToken, message) {
  return __awaiter(this, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            axios_1.default.post(
              'https://fcm.googleapis.com/fcm/send',
              {
                to: pushToken,
                notification: { title: 'New Message', body: message },
              },
              {
                headers: { Authorization: 'key='.concat(FCM_SERVER_KEY), 'Content-Type': 'application/json' },
              },
            ),
          ];
        case 1:
          _a.sent();
          console.log('Push notification sent to '.concat(pushToken));
          return [3 /*break*/, 3];
        case 2:
          error_1 = _a.sent();
          console.error('Failed to send push notification:', error_1);
          return [3 /*break*/, 3];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
function startWorker() {
  return __awaiter(this, void 0, void 0, function () {
    var connection, channel;
    var _this = this;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, amqp.connect(RABBITMQ_URL)];
        case 1:
          connection = _a.sent();
          return [4 /*yield*/, connection.createChannel()];
        case 2:
          channel = _a.sent();
          return [4 /*yield*/, channel.assertQueue('push_notification_queue', { durable: true })];
        case 3:
          _a.sent();
          console.log('Push Notification Worker started...');
          channel.consume('push_notification_queue', function (msg) {
            return __awaiter(_this, void 0, void 0, function () {
              var _a, pushToken, message;
              return __generator(this, function (_b) {
                switch (_b.label) {
                  case 0:
                    if (!msg) return [3 /*break*/, 2];
                    (_a = JSON.parse(msg.content.toString())), (pushToken = _a.pushToken), (message = _a.message);
                    return [4 /*yield*/, sendPushNotification(pushToken, message)];
                  case 1:
                    _b.sent();
                    channel.ack(msg);
                    _b.label = 2;
                  case 2:
                    return [2 /*return*/];
                }
              });
            });
          });
          return [2 /*return*/];
      }
    });
  });
}
startWorker();
