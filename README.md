# simple-ci-system

Простая система continious integration

## Содержание

1. [Установка](#установка)
2. [Запуск](#запуск)
3. [Краткий обзор работы с приложением](#краткий-обзор-работы-с-приложением)
3. [Используемые пакеты](#используемые-пакеты)
4. [Файлы конфигураций](#файлы-конфигураций)
5. [Интересные моменты](#интересные-моменты)

## Установка

1. `git clone https://github.com/vlad8zavr/simple-ci-system.git`
2. `cd ./simple-ci-system`
3. `cd ./server`
4. `npm i`
5. `cd ../agent`
6. `npm i`
7. `cd ../`

## Запуск

**Сервер**

1. `cd ./server/`
2. `npm start`
3. Открыть в браузере страницу **`http://localhost:8800`**

( или `node ./server/server.js` )

**Агент**

1. `cd ./agent/`
2. `npm start`

( или `node ./agent/agent.js` )


## Краткий обзор работы с приложением

1. При открытии страницы **`http://localhost:8800`** появится экран следующего вида

`(/screenshots/ci-app-1.png)`

![page-1](/screenshots/ci-app-1.png)

В первом инпуте вводится хэш коммита, во втором - команда сборки.

При завершении агентом процесса сборки и получением сервером информации, внизу в блоке **Сборки** появится информация о текущей сборке: id сборки и статус.

2. При клике на id сборки в новом окне откроется страница с подробной информацией об этой сборке.

`(/screenshots/ci-app-2.png)`

![page-1](/screenshots/ci-app-2.png)

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

## Links

https://www.endyourif.com/cant-set-headers-after-they-are-sent/


https://www.google.ru/search?newwindow=1&client=opera&ei=2D-jXY-1J-6PmwXJ1Yb4Bw&q=node+js+request.post+cannot+set+headers&oq=node+js+request.post+cannot+set+headers&gs_l=psy-ab.3..33i22i29i30.607221.610470..611611...0.4..0.123.2606.28j4......0....1..gws-wiz.......0i71j33i160j33i21.OuF9rzLsV40&ved=0ahUKEwiPgd7nw5nlAhXux6YKHcmqAX8Q4dUDCAo&uact=5