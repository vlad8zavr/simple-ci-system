# simple-ci-system

Простая система continious integration

## Запуск

**Сервер**

1. `cd ./server/`
2. `npm start`

**Агент**

1. `cd ./agent/`
2. `npm start`


## Используемые пакеты

1. express
2. bodyParser
3. path
4. request
5. os
6. child_process

## Файлы конфигураций

В каждом из двух папок - `./agent/` и `./server/` хранятся файлы конфигураций `config.json` для агента и сервера соответственно.

В конфиге сервера я прописал относительный путь до репозитория, а не абсолютный, потому что в моей среде (windows) в таком случае появляется ошибка.

## Интересные моменты

Выяснилось, что на операционных системах Windows нельзя просто так взять и вызвать `npm` через `spawn`. Для корректной работы в коде я заменяю `npm` на `npm.cmd`, если операционная система - windows.

(Источник: https://github.com/nodejs/node/issues/3675)

## Принимаемая информация

```javascript
// main page - info about builds
{
    buildReview: {
        buildCode: BUILDCODE, 
        code: req.body.code
    }
}

// main page - no free agents
{
    agentFilled: true
}

// page build
{
    buildInfo {
        timeStart: timeStart,
        timeEnd: timeEnd,
        code: code,
        result: result
    }
}
```